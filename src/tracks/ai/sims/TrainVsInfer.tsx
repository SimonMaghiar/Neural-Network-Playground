import { useState } from 'react'
import { ArrowLeft, ArrowRight, GraduationCap, Lock, MessageCircleQuestion, Unlock } from 'lucide-react'
import type { SimProps } from '../../types'
import { formatBytes, formatCount } from '../../units'

/** The kilometres-to-miles model from Module 5, now trained one example at a time. */
const EXAMPLES = [
  { km: 10, miles: 6.2 },
  { km: 5, miles: 3.1 },
  { km: 20, miles: 12.4 },
  { km: 8, miles: 4.96 },
  { km: 15, miles: 9.3 },
]
const STEP = 0.002
const START = 0.3

const MODELS = [
  { name: 'This converter', params: 1, examples: 100 },
  { name: 'A small handwriting reader', params: 100_000, examples: 600_000 },
  { name: 'Llama 3 8B (2024)', params: 8e9, examples: 15e12 },
]

const SUPERSCRIPT = '⁰¹²³⁴⁵⁶⁷⁸⁹'

/** Like formatCount, but switches to "7.2 × 10²³" beyond a quadrillion. */
function bigCount(n: number): string {
  if (n < 1e18) return formatCount(n)
  const exp = Math.floor(Math.log10(n))
  const digits = [...String(exp)].map((d) => SUPERSCRIPT[Number(d)]).join('')
  return `${Number((n / 10 ** exp).toPrecision(2))} × 10${digits}`
}

type Mode = 'train' | 'use'
interface TrainStep {
  km: number
  miles: number
  guess: number
  before: number
  after: number
}

export function TrainVsInfer({ onTaskDone }: SimProps) {
  const [mode, setMode] = useState<Mode>('train')
  const [weight, setWeight] = useState(START)
  const [steps, setSteps] = useState<TrainStep[]>([])
  const [km, setKm] = useState(42)
  const [answer, setAnswer] = useState<{ km: number; miles: number } | null>(null)
  const [modelIndex, setModelIndex] = useState(0)
  const [progress, setProgress] = useState({ trained: 0, asked: 0, big: false })

  const update = (change: Partial<typeof progress>) => {
    const next = { ...progress, ...change }
    setProgress(next)
    if (next.trained >= 3 && next.asked >= 1 && next.big) onTaskDone()
  }

  const train = () => {
    const ex = EXAMPLES[steps.length % EXAMPLES.length]
    const guess = weight * ex.km
    const after = weight - STEP * 2 * (guess - ex.miles) * ex.km
    setSteps([...steps, { ...ex, guess, before: weight, after }])
    setWeight(after)
    update({ trained: progress.trained + 1 })
  }

  const ask = () => {
    setAnswer({ km, miles: weight * km })
    update({ asked: progress.asked + 1 })
  }

  const last = steps[steps.length - 1]
  const model = MODELS[modelIndex]
  const forward = 2 * model.params
  const trainingPerExample = 6 * model.params

  return (
    <div className="sim">
      <div className="sim-row">
        <div className="pill-group">
          <button className={mode === 'train' ? 'is-active' : ''} onClick={() => setMode('train')}>
            <GraduationCap size={14} /> Training
          </button>
          <button className={mode === 'use' ? 'is-active' : ''} onClick={() => setMode('use')}>
            <MessageCircleQuestion size={14} /> Inference (using it)
          </button>
        </div>
        <span className="ai-weight-chip">
          {mode === 'train' ? <Unlock size={14} /> : <Lock size={14} />} weight = {weight.toFixed(3)}{' '}
          <span className="muted">{mode === 'train' ? '(changes)' : '(frozen)'}</span>
        </span>
      </div>

      {mode === 'train' ? (
        <section className="ai-panel">
          <button className="btn primary" onClick={train}>
            Train on the next example
          </button>
          {last ? (
            <ol className="ai-steps">
              <li>
                <b>
                  Forward pass <ArrowRight size={13} />
                </b>{' '}
                {last.km} km × {last.before.toFixed(3)} = {last.guess.toFixed(2)} miles
              </li>
              <li>
                <b>Compare</b> with the right answer, {last.miles} miles: off by {(last.guess - last.miles).toFixed(2)}
              </li>
              <li>
                <b>
                  <ArrowLeft size={13} /> Backward pass
                </b>{' '}
                nudge the weight from {last.before.toFixed(3)} to <b>{last.after.toFixed(3)}</b>
              </li>
            </ol>
          ) : (
            <p className="sim-note">The weight starts at a random guess ({START}), so its answers are wrong.</p>
          )}
          <p className="sim-note">Examples trained on: {steps.length}. The right weight is about 0.62.</p>
        </section>
      ) : (
        <section className="ai-panel">
          <label className="slider wide">
            <span>
              Distance: <b>{km} km</b>
            </span>
            <input type="range" min={1} max={100} value={km} onChange={(e) => setKm(Number(e.target.value))} />
          </label>
          <button className="btn primary" onClick={ask}>
            Ask the model
          </button>
          {answer && (
            <ol className="ai-steps">
              <li>
                <b>
                  Forward pass only <ArrowRight size={13} />
                </b>{' '}
                {answer.km} km × {weight.toFixed(3)} = <b>{answer.miles.toFixed(1)} miles</b> (really{' '}
                {(answer.km * 0.6214).toFixed(1)})
              </li>
              <li>No right answer to compare with, no backward pass: the weight stays exactly the same.</li>
            </ol>
          )}
        </section>
      )}

      <h4 className="sim-subtitle">The same two jobs for real models</h4>
      <div className="pill-group">
        {MODELS.map((m, i) => (
          <button
            key={m.name}
            className={i === modelIndex ? 'is-active' : ''}
            onClick={() => {
              setModelIndex(i)
              if (i === MODELS.length - 1) update({ big: true })
            }}
          >
            {m.name}
          </button>
        ))}
      </div>
      <div className="big-stats">
        <div>
          <span>Parameters</span>
          <b>{formatCount(model.params)}</b>
        </div>
        <div>
          <span>Inference: math for one answer</span>
          <b>{formatCount(forward)}</b>
        </div>
        <div>
          <span>Training: math per example (≈ 3× more)</span>
          <b>{formatCount(trainingPerExample)}</b>
        </div>
        <div>
          <span>Training: examples seen</span>
          <b>{formatCount(model.examples)}</b>
        </div>
        <div>
          <span>Training: total math</span>
          <b className="warn">{bigCount(trainingPerExample * model.examples)}</b>
        </div>
        <div>
          <span>Memory just to store the weights</span>
          <b>{formatBytes(model.params * 2)}</b>
        </div>
      </div>
      <p className="sim-note">
        "Math" counts multiplications and additions. Every weight is used in about 2 operations in a forward pass, and the
        backward pass costs about twice that again. Weights stored as 16-bit numbers (2 bytes each). For Llama 3, one
        "example" is one token of text.
      </p>
    </div>
  )
}
