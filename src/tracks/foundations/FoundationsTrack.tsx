import { useCallback, useEffect, useState } from 'react'
import { FlaskConical, GraduationCap, Minus, Plus, Trash2 } from 'lucide-react'
import type { Activation, LayerSpec } from '../../nn/network'
import { presets, type Preset } from '../../nn/presets'
import { allFeatures, featuresFor, lessons, stepKey } from '../../lessons'
import { navigate } from '../../router'
import { customPageMeta, useDocumentHead } from '../../seo'
import { labs } from '../catalog'
import type { TrackPageProps } from '../types'
import { LessonPanel } from '../../ui/LessonPanel'
import { Playground } from '../../ui/Playground'
import { SiteFooter } from '../../ui/SiteFooter'
import { Term } from '../../ui/Term'
import { useHydrated } from '../../ui/useHydrated'
import { loadFoundationsProgress, saveFoundationsProgress } from './progress'

const HIDDEN_ACTIVATIONS: Activation[] = ['tanh', 'sigmoid', 'relu', 'linear']
const MAX_HIDDEN_LAYERS = 3
const MAX_NEURONS = 8

type FoundationsMode = 'learn' | 'play'

/** `/foundations/` shows the lessons, `/foundations/playground/` the free playground. */
export default function FoundationsPage({ route }: TrackPageProps) {
  const mode: FoundationsMode = route[1] === 'playground' ? 'play' : 'learn'
  const track = labs.find((t) => t.id === 'foundations')!
  useDocumentHead(customPageMeta(track, mode === 'play' ? 'playground' : ''))
  const hydrated = useHydrated()
  if (!hydrated) return <FoundationsOutline mode={mode} />
  return <FoundationsTrack key={mode} mode={mode} />
}

/**
 * What the lab teaches, as plain HTML. Pre-rendered for search engines and shown until the
 * live lab (which needs the browser and the learner's saved progress) takes over.
 */
function FoundationsOutline({ mode }: { mode: FoundationsMode }) {
  const track = labs.find((t) => t.id === 'foundations')!
  return (
    <div className="home" style={{ ['--track' as string]: track.color }}>
      <header className="hero">
        <div className="hero-kicker">
          {track.label} · {track.level} · {lessons.length} lessons
        </div>
        <h1>{mode === 'play' ? 'Neural network playground' : track.title}</h1>
        <p>{track.pageMeta?.[mode === 'play' ? 'playground' : '']?.description ?? track.description}</p>
        <p className="page-loading">Loading the interactive lab…</p>
      </header>
      <section className="home-section overview-section">
        <h2 className="home-section-title">
          <GraduationCap size={20} /> Lessons
        </h2>
        <ol className="overview-modules">
          {lessons.map((l, i) => (
            <li key={l.id}>
              <div>
                <span className="overview-num">{i + 1}</span>
                <span className="overview-text">
                  <h3>{l.title}</h3>
                  <p>{l.steps.map((s) => s.title).join(' · ')}</p>
                </span>
              </div>
            </li>
          ))}
        </ol>
      </section>
      <SiteFooter />
    </div>
  )
}

function FoundationsTrack({ mode }: { mode: FoundationsMode }) {
  const [saved] = useState(loadFoundationsProgress)
  const setMode = (m: FoundationsMode) => {
    if (m !== mode) navigate(m === 'learn' ? 'foundations' : 'foundations/playground')
  }
  const [pos, setPos] = useState({ lesson: saved.lesson, step: saved.step })
  const [completed, setCompleted] = useState(() => new Set(saved.completed))

  const [presetId, setPresetId] = useState(presets[0].id)
  const preset = presets.find((p) => p.id === presetId)!
  const [hidden, setHidden] = useState<LayerSpec[]>(preset.hidden)

  const lesson = lessons[pos.lesson]
  const lessonStep = lesson.steps[pos.step]
  const [learningRate, setLearningRate] = useState(mode === 'learn' ? lesson.preset.learningRate : preset.learningRate)
  const [speed, setSpeed] = useState(mode === 'learn' ? lesson.speed : 60)
  const [seed, setSeed] = useState(1)
  const [resets, setResets] = useState(0)
  const [showWeights, setShowWeights] = useState(true)

  useEffect(() => {
    saveFoundationsProgress({ lesson: pos.lesson, step: pos.step, completed: [...completed] })
  }, [pos, completed])

  const goTo = (lessonIndex: number, step: number) => {
    if (lessonIndex !== pos.lesson || mode !== 'learn') {
      setLearningRate(lessons[lessonIndex].preset.learningRate)
      setSpeed(lessons[lessonIndex].speed)
      setSeed(1)
    }
    setMode('learn')
    setPos({ lesson: lessonIndex, step })
  }

  const choosePreset = (p: Preset) => {
    setMode('play')
    setPresetId(p.id)
    setHidden(p.hidden)
    setLearningRate(p.learningRate)
    setSpeed(60)
    setSeed(1)
  }

  const currentKey = stepKey(pos.lesson, pos.step)
  const markDone = useCallback(
    () => setCompleted((prev) => (prev.has(currentKey) ? prev : new Set(prev).add(currentKey))),
    [currentKey],
  )

  const customised = JSON.stringify(hidden) !== JSON.stringify(preset.hidden)
  const learning = mode === 'learn'

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <span className="track-code" style={{ color: '#a78bfa' }} aria-hidden="true">
            NN
          </span>
          <h1>{learning ? 'Neural Network Foundations' : 'Neural Network Playground'}</h1>
        </div>

        <div className="mode-tabs">
          <button className={learning ? 'is-active' : ''} onClick={() => goTo(pos.lesson, pos.step)}>
            <GraduationCap size={16} /> Lessons
          </button>
          <button className={!learning ? 'is-active' : ''} onClick={() => choosePreset(preset)}>
            <FlaskConical size={16} /> Free playground
          </button>
        </div>

        {learning ? (
          <LessonPanel
            lessons={lessons}
            lessonIndex={pos.lesson}
            stepIndex={pos.step}
            completed={completed}
            onGo={goTo}
            onFinish={() => choosePreset(presets[0])}
          />
        ) : (
          <>
            <section>
              <h4>Pick an example</h4>
              <div className="preset-list">
                {presets.map((p) => (
                  <button
                    key={p.id}
                    className={`preset${p.id === presetId ? ' is-active' : ''}`}
                    onClick={() => choosePreset(p)}
                  >
                    <span className="preset-name">{p.name}</span>
                    <span className="preset-summary">{p.summary}</span>
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h4>What to notice</h4>
              <ul className="lesson">
                {preset.lesson.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </section>

            <section>
              <h4>Build your network</h4>
              <div className="arch">
                <div className="arch-row fixed">
                  Input · {preset.inputLabels.length} neuron{preset.inputLabels.length > 1 ? 's' : ''}
                </div>
                {hidden.map((layer, idx) => (
                  <div className="arch-row" key={idx}>
                    <span>
                      <Term t="hidden layer">Hidden {idx + 1}</Term>
                    </span>
                    <div className="stepper">
                      <button
                        disabled={layer.size <= 1}
                        onClick={() => setHidden(hidden.map((h, k) => (k === idx ? { ...h, size: h.size - 1 } : h)))}
                        aria-label="Fewer neurons"
                      >
                        <Minus size={12} />
                      </button>
                      <span>{layer.size}</span>
                      <button
                        disabled={layer.size >= MAX_NEURONS}
                        onClick={() => setHidden(hidden.map((h, k) => (k === idx ? { ...h, size: h.size + 1 } : h)))}
                        aria-label="More neurons"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <select
                      value={layer.activation}
                      title="Squish function"
                      onChange={(e) =>
                        setHidden(
                          hidden.map((h, k) => (k === idx ? { ...h, activation: e.target.value as Activation } : h)),
                        )
                      }
                    >
                      {HIDDEN_ACTIVATIONS.map((a) => (
                        <option key={a}>{a}</option>
                      ))}
                    </select>
                    <button
                      className="icon-btn"
                      onClick={() => setHidden(hidden.filter((_, k) => k !== idx))}
                      aria-label="Remove layer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <div className="arch-row fixed">
                  Output · 1 neuron
                  {preset.outputActivation !== 'linear' && (
                    <>
                      {' '}
                      · <Term t="squish function">{preset.outputActivation}</Term>
                    </>
                  )}
                </div>
                <div className="arch-actions">
                  <button
                    disabled={hidden.length >= MAX_HIDDEN_LAYERS}
                    onClick={() => setHidden([...hidden, { size: 3, activation: 'tanh' }])}
                  >
                    <Plus size={14} /> Hidden layer
                  </button>
                  {customised && <button onClick={() => setHidden(preset.hidden)}>Use default</button>}
                </div>
                <p className="hint">
                  Each hidden layer has a number of helper neurons and a <Term t="squish function" />. Changing the
                  network starts learning from scratch.
                </p>
              </div>
            </section>
          </>
        )}
        <SiteFooter compact />
      </aside>

      {learning ? (
        <Playground
          key={`learn|${pos.lesson}|${seed}|${resets}`}
          preset={lesson.preset}
          hidden={lesson.hidden ?? []}
          seed={seed}
          learningRate={learningRate}
          onLearningRate={setLearningRate}
          speed={speed}
          onSpeed={setSpeed}
          showWeights={showWeights}
          onShowWeights={setShowWeights}
          onReset={() => setResets((r) => r + 1)}
          onRandomize={() => setSeed((s) => s + 1)}
          features={featuresFor(lessonStep)}
          highlight={lessonStep.highlight}
          task={lessonStep.task?.check}
          onTaskDone={markDone}
        />
      ) : (
        <Playground
          key={`play|${preset.id}|${JSON.stringify(hidden)}|${seed}|${resets}`}
          preset={preset}
          hidden={hidden}
          seed={seed}
          learningRate={learningRate}
          onLearningRate={setLearningRate}
          speed={speed}
          onSpeed={setSpeed}
          showWeights={showWeights}
          onShowWeights={setShowWeights}
          onReset={() => setResets((r) => r + 1)}
          onRandomize={() => setSeed((s) => s + 1)}
          features={allFeatures}
        />
      )}
    </div>
  )
}
