import { useEffect, useMemo, useState } from 'react'
import { Pause, Play, RotateCcw, Shuffle, StepForward, Waypoints } from 'lucide-react'
import { cloneNetwork, createNetwork, forward, output, trainEpoch, type LayerSpec } from '../nn/network'
import { scaleInputFor, type Preset } from '../nn/presets'
import type { Features, Highlight, TaskState } from '../lessons'
import { NetworkView, type Selection } from './NetworkView'
import { Inspector } from './Inspector'
import { DecisionMap, FitChart, LossChart } from './Charts'
import { NeuronRecipe, type ParamTarget } from './NeuronRecipe'
import { useTrainer } from './useTrainer'
import { fmt, fmtLoss } from './format'
import { Term } from './Term'

const LEARNING_RATES = [0.001, 0.003, 0.01, 0.03, 0.05, 0.1, 0.2, 0.3, 0.5, 1, 2, 3, 5, 10]
const SPEEDS = [1, 2, 5, 10, 20, 60, 250, 1000, 5000]

const statusText = {
  untrained: 'not trained yet',
  learning: 'learning…',
  trained: 'learned it!',
  diverged: 'blew up!',
}

export interface PlaygroundProps {
  preset: Preset
  hidden: LayerSpec[]
  seed: number
  learningRate: number
  onLearningRate: (v: number) => void
  speed: number
  onSpeed: (v: number) => void
  showWeights: boolean
  onShowWeights: (v: boolean) => void
  onReset: () => void
  onRandomize: () => void
  features: Features
  highlight?: Highlight
  task?: (s: TaskState) => boolean
  onTaskDone?: () => void
}

export function Playground(props: PlaygroundProps) {
  const { preset, hidden, seed, learningRate, speed, showWeights, features: f, highlight, task, onTaskDone } = props
  const scaleInput = useMemo(() => scaleInputFor(preset), [preset])
  const [initial] = useState(() =>
    createNetwork(
      preset.inputLabels.length,
      [...hidden, { size: 1, activation: preset.outputActivation }],
      seed,
      hidden.length === 0 && seed === 1 ? preset.fixedInit : undefined,
    ),
  )
  const { snapshot, running, setRunning, advance, edit } = useTrainer(
    initial,
    preset.data,
    scaleInput,
    learningRate,
    speed,
  )
  const { net } = snapshot
  const totalLayers = hidden.length + 2

  const [rawInput, setRawInput] = useState(preset.defaultInput)
  const [selection, setSelection] = useState<Selection | null>({ kind: 'neuron', layer: totalLayers - 1, index: 0 })
  const [propStep, setPropStep] = useState<number | null>(null)
  const [manualStep, setManualStep] = useState(false)
  const [inputMoved, setInputMoved] = useState(false)
  const [paramEdits, setParamEdits] = useState(0)
  const [manualSteps, setManualSteps] = useState(0)
  const [forwardRuns, setForwardRuns] = useState(0)

  const trace = useMemo(() => forward(net, scaleInput(rawInput)), [net, scaleInput, rawInput])
  const grads = useMemo(
    () => trainEpoch(cloneNetwork(net), preset.data, 0, scaleInput).gradients,
    [net, preset.data, scaleInput],
  )
  const target = preset.target(rawInput)
  const prediction = trace.a[totalLayers - 1][0]
  const allCorrect =
    preset.kind === 'binary' && preset.data.every((d) => Math.abs(output(net, scaleInput(d.x)) - d.y) < 0.4)

  const taskState: TaskState = {
    epoch: snapshot.epoch,
    loss: snapshot.loss,
    inputMoved,
    paramEdits,
    manualSteps,
    forwardRuns,
    allCorrect,
    diverged: snapshot.diverged,
  }
  const taskMet = task ? task(taskState) : false
  useEffect(() => {
    if (taskMet) onTaskDone?.()
  }, [taskMet, onTaskDone])

  useEffect(() => {
    if (propStep === null) return
    const done = propStep >= totalLayers - 1
    const id = setTimeout(
      () => {
        if (done) {
          setPropStep(null)
          setForwardRuns((n) => n + 1)
        } else {
          setPropStep(propStep + 1)
          setSelection({ kind: 'neuron', layer: propStep + 1, index: 0 })
        }
      },
      done ? 1500 : 1100,
    )
    return () => clearTimeout(id)
  }, [propStep, totalLayers])

  const play = () => {
    setPropStep(null)
    setManualStep(false)
    setRunning(!running)
  }
  const step = (n: number) => {
    setRunning(false)
    setPropStep(null)
    advance(n)
    setManualStep(true)
    setManualSteps((k) => k + 1)
  }
  const animateForward = () => {
    setRunning(false)
    setSelection({ kind: 'neuron', layer: 0, index: 0 })
    setPropStep(0)
  }
  const onEdit = (t: ParamTarget, v: number) => {
    edit(t, v)
    setParamEdits((n) => n + 1)
    setManualStep(false)
    setPropStep(null)
  }
  const changeInput = (x: number[]) => {
    setRawInput(x)
    setInputMoved(true)
  }

  const hl = (id: Highlight) => (highlight === id ? ' highlight' : '')
  const lrIndex = Math.max(0, LEARNING_RATES.indexOf(learningRate))
  const speedIndex = Math.max(0, SPEEDS.indexOf(speed))
  const status = snapshot.diverged
    ? 'diverged'
    : snapshot.loss < 1e-3
      ? 'trained'
      : snapshot.epoch === 0
        ? 'untrained'
        : 'learning'
  const showToolbar = f.train || f.step || f.reset || f.learningRate || f.speed || f.stats
  const showRecipe = f.recipe && hidden.length === 0

  return (
    <main className="main">
      {showToolbar && (
        <div className="toolbar">
          {f.train && (
            <span className={`hl-wrap${hl('train')}`}>
              <button className="primary" onClick={play} disabled={snapshot.diverged}>
                {running ? <Pause size={16} /> : <Play size={16} />} {running ? 'Pause' : 'Start learning'}
              </button>
            </span>
          )}
          {f.step && (
            <span className={`hl-wrap${hl('step')}`}>
              <button onClick={() => step(1)} title="Check all examples once, then nudge every weight and bias a little">
                <StepForward size={16} /> 1 learning step
              </button>
              {f.train && (
                <>
                  <button onClick={() => step(10)}>+10</button>
                  <button onClick={() => step(100)}>+100</button>
                </>
              )}
            </span>
          )}
          {f.reset && (
            <button onClick={props.onReset} title="Go back to the starting weights and forget everything learned">
              <RotateCcw size={16} /> Start over
            </button>
          )}
          {f.newWeights && (
            <button onClick={props.onRandomize} title="Start over from different random weights">
              <Shuffle size={16} /> Random start
            </button>
          )}

          {f.learningRate && (
            <label className={`slider${hl('learningRate')}`}>
              <span>
                <Term t="step size" /> <b>{learningRate}</b>
              </span>
              <input
                type="range"
                min={0}
                max={LEARNING_RATES.length - 1}
                value={lrIndex}
                onChange={(e) => props.onLearningRate(LEARNING_RATES[Number(e.target.value)])}
              />
            </label>
          )}
          {f.speed && f.train && (
            <label className="slider">
              <span>
                Speed <b>{speed}</b> steps/second
              </span>
              <input
                type="range"
                min={0}
                max={SPEEDS.length - 1}
                value={speedIndex}
                onChange={(e) => props.onSpeed(SPEEDS[Number(e.target.value)])}
              />
            </label>
          )}

          {f.stats && (
            <div className={`stats${hl('stats')}`}>
              {(f.step || f.train) && (
                <div>
                  <span>
                    <Term t="learning step">Learning steps</Term>
                  </span>
                  <b>{snapshot.epoch}</b>
                </div>
              )}
              <div>
                <span>
                  <Term t="mistake score" />
                </span>
                <b>{fmtLoss(snapshot.loss)}</b>
              </div>
              {(f.step || f.train) && <div className={`status status-${status}`}>{statusText[status]}</div>}
            </div>
          )}
        </div>
      )}

      {snapshot.diverged && (
        <div className="banner">
          The numbers blew up! The step size is too big, so every nudge overshoots the target by more than the last one.
          Lower the step size and press Start over.
        </div>
      )}

      <div className={`workspace${f.inspector ? '' : ' no-inspector'}`}>
        <div className="center">
          <div className={`canvas${hl('network')}`}>
            <NetworkView
              net={net}
              prev={snapshot.prev}
              showDeltas={manualStep && !running && propStep === null}
              trace={trace}
              rawInput={rawInput}
              inputScales={preset.inputScales}
              inputLabels={preset.inputLabels}
              outputLabel={preset.outputLabel}
              target={target}
              propStep={propStep}
              selection={f.inspector ? selection : null}
              onSelect={(s) => f.inspector && setSelection(s)}
              showWeights={showWeights}
            />
            <div className="canvas-legend">
              {f.weightLabels && (
                <label>
                  <input type="checkbox" checked={showWeights} onChange={(e) => props.onShowWeights(e.target.checked)} />{' '}
                  show weights
                </label>
              )}
              <span>
                Line: thicker = bigger <Term t="weight" />, <i className="swatch pos" /> positive{' '}
                <i className="swatch neg" /> negative
              </span>
              {manualStep && !running && (
                <span>
                  <span className="delta-up">green</span>/<span className="delta-down">red</span> = change in the last
                  step
                </span>
              )}
            </div>
          </div>

          {f.inputs && (
            <div className={`inputs${hl('inputs')}`}>
              <div className="inputs-title">
                <Term t="input">Input</Term> (the question)
              </div>
              {preset.inputLabels.map((label, i) => (
                <label key={label} className="slider input-slider">
                  <span>
                    {label} = <b>{fmt(rawInput[i], 2)}</b>
                  </span>
                  <input
                    type="range"
                    min={preset.inputRanges[i][0]}
                    max={preset.inputRanges[i][1]}
                    step={
                      preset.kind === 'binary' ? 0.01 : (preset.inputRanges[i][1] - preset.inputRanges[i][0]) / 200
                    }
                    value={rawInput[i]}
                    onChange={(e) => changeInput(rawInput.map((v, k) => (k === i ? Number(e.target.value) : v)))}
                  />
                </label>
              ))}
              {preset.kind === 'binary' && (
                <div className="quick-inputs">
                  {preset.data.map((d) => (
                    <button key={d.x.join()} onClick={() => changeInput(d.x)}>
                      {d.x.join(', ')}
                    </button>
                  ))}
                </div>
              )}
              <div className="io-result">
                → answer <b>{fmt(prediction)}</b>
                {target !== undefined && <span className="muted"> (correct: {fmt(target)})</span>}
              </div>
              {f.animate && (
                <span className={`hl-wrap${hl('animate')}`}>
                  <button className="primary" onClick={animateForward} disabled={propStep !== null}>
                    <Waypoints size={16} /> Watch the answer flow
                  </button>
                </span>
              )}
            </div>
          )}

          {showRecipe && (
            <div className={`recipe-wrap${hl('recipe')}`}>
              <NeuronRecipe
                net={net}
                trace={trace}
                rawInput={rawInput}
                inputLabels={preset.inputLabels}
                inputScales={preset.inputScales}
                target={target}
                onEdit={f.handTune ? onEdit : undefined}
              />
            </div>
          )}

          {(f.lossChart || f.fitChart) && (
            <div className={`charts${f.lossChart && f.fitChart ? '' : ' single'}`}>
              {f.lossChart && <LossChart history={snapshot.history} />}
              {f.fitChart &&
                (preset.kind === 'regression' ? (
                  <FitChart
                    net={net}
                    preset={preset}
                    scaleInput={scaleInput}
                    rawInput={rawInput}
                    showMistakes={f.mistakes}
                  />
                ) : (
                  <DecisionMap
                    net={net}
                    preset={preset}
                    scaleInput={scaleInput}
                    rawInput={rawInput}
                    onPick={changeInput}
                  />
                ))}
            </div>
          )}
        </div>

        {f.inspector && (
          <aside className="inspector">
            <Inspector
              net={net}
              trace={trace}
              grads={grads}
              history={snapshot.history}
              selection={selection}
              inputLabels={preset.inputLabels}
              inputScales={preset.inputScales}
              rawInput={rawInput}
              target={target}
              learningRate={learningRate}
              onEdit={onEdit}
            />
          </aside>
        )}
      </div>
    </main>
  )
}
