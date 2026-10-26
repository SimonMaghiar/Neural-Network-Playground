import { useState } from 'react'
import { ArrowLeft, ArrowRight, RotateCcw, StepForward } from 'lucide-react'
import type { SimProps } from '../../types'

/** A one-weight model: miles = weight × kilometres. The right weight is 0.62. */
const EXAMPLES = [
  { km: 5, miles: 3.1 },
  { km: 10, miles: 6.2 },
  { km: 20, miles: 12.4 },
]

const loss = (w: number) => EXAMPLES.reduce((s, e) => s + (w * e.km - e.miles) ** 2, 0) / EXAMPLES.length
const gradient = (w: number) => EXAMPLES.reduce((s, e) => s + 2 * (w * e.km - e.miles) * e.km, 0) / EXAMPLES.length

const STEP_SIZES = [
  { id: 'tiny', label: 'Tiny steps', value: 0.0003 },
  { id: 'good', label: 'Good steps', value: 0.002 },
  { id: 'big', label: 'Too big', value: 0.008 },
] as const

const W = 420
const H = 230
const W0 = -0.4
const W1 = 1.6
const LMAX = 190
const sx = (w: number) => 30 + ((w - W0) / (W1 - W0)) * (W - 50)
const sy = (l: number) => H - 30 - (Math.min(l, LMAX) / LMAX) * (H - 50)
const CURVE = Array.from({ length: 81 }, (_, i) => W0 + ((W1 - W0) * i) / 80)
  .map((w, i) => `${i ? 'L' : 'M'}${sx(w).toFixed(1)},${sy(loss(w)).toFixed(1)}`)
  .join(' ')

const showLoss = (l: number) => (l > 1e4 ? 'exploding!' : l < 0.001 ? l.toExponential(1) : l < 10 ? l.toFixed(3) : l.toFixed(1))

export function GradientDescent({ onTaskDone }: SimProps) {
  const [stepSize, setStepSize] = useState<(typeof STEP_SIZES)[number]['id']>('good')
  const [history, setHistory] = useState<number[]>([0])
  const [reached, setReached] = useState(false)
  const [triedBig, setTriedBig] = useState(false)

  const w = history[history.length - 1]
  const l = loss(w)
  const g = gradient(w)

  const step = (count: number) => {
    const size = STEP_SIZES.find((s) => s.id === stepSize)!.value
    const next = [...history]
    for (let i = 0; i < count; i++) {
      const cur = next[next.length - 1]
      if (Math.abs(cur) > 1e3) break
      next.push(cur - size * gradient(cur))
    }
    setHistory(next)
    const nowReached = reached || (stepSize !== 'big' && loss(next[next.length - 1]) < 0.01)
    const nowBig = triedBig || stepSize === 'big'
    setReached(nowReached)
    setTriedBig(nowBig)
    if (nowReached && nowBig) onTaskDone()
  }

  const visible = history.slice(-30)

  return (
    <div className="sim">
      <div className="sim-row">
        <span className="sim-label">Step size:</span>
        <div className="pill-group">
          {STEP_SIZES.map((s) => (
            <button key={s.id} className={s.id === stepSize ? 'is-active' : ''} onClick={() => setStepSize(s.id)}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="ai-chart">
        <line x1={30} x2={W - 20} y1={H - 30} y2={H - 30} className="grid-line" />
        {[0, 0.5, 1, 1.5].map((x) => (
          <text key={x} x={sx(x)} y={H - 12} textAnchor="middle" className="axis-text">
            {x}
          </text>
        ))}
        <text x={W - 20} y={H - 12} textAnchor="end" className="axis-text">
          weight
        </text>
        <text x={34} y={16} className="axis-text">
          mistake score (loss)
        </text>
        <path d={CURVE} className="ai-loss-curve" />
        <line x1={sx(0.62)} x2={sx(0.62)} y1={sy(0)} y2={sy(0) + 6} className="ai-best-tick" />
        <polyline
          points={visible.map((v) => `${sx(Math.max(W0, Math.min(W1, v)))},${sy(loss(v))}`).join(' ')}
          className="ai-trail"
        />
        {visible.slice(0, -1).map((v, i) => (
          <circle key={i} cx={sx(Math.max(W0, Math.min(W1, v)))} cy={sy(loss(v))} r={3} className="ai-trail-dot" />
        ))}
        <circle cx={sx(Math.max(W0, Math.min(W1, w)))} cy={sy(l)} r={8} className="ai-ball" />
      </svg>

      <div className="sim-row">
        <button className="btn primary" onClick={() => step(1)}>
          <StepForward size={15} /> Take one step
        </button>
        <button className="btn" onClick={() => step(10)}>
          Take 10 steps
        </button>
        <button className="btn" onClick={() => setHistory([0])}>
          <RotateCcw size={15} /> Start over
        </button>
      </div>

      <div className="big-stats">
        <div>
          <span>Weight</span>
          <b>{Math.abs(w) > 1e3 ? 'huge' : w.toFixed(3)}</b>
        </div>
        <div>
          <span>Mistake score (loss)</span>
          <b className={l < 0.01 ? 'good' : l > 200 ? 'warn' : ''}>{showLoss(l)}</b>
        </div>
        <div>
          <span>Downhill is</span>
          <b>
            {Math.abs(g) < 1e-6 ? (
              'here!'
            ) : g > 0 ? (
              <>
                <ArrowLeft size={16} /> left
              </>
            ) : (
              <>
                right <ArrowRight size={16} />
              </>
            )}
          </b>
        </div>
        <div>
          <span>Steps taken</span>
          <b>{history.length - 1}</b>
        </div>
      </div>
      <p className="sim-note">
        Example: 10 km × {Math.abs(w) > 1e3 ? 'huge' : w.toFixed(3)} ={' '}
        {Math.abs(w) > 1e3 ? '…' : (10 * w).toFixed(2)} miles, but the right answer is 6.2. The mistake score averages the
        squared misses on 5, 10 and 20 km.
      </p>
    </div>
  )
}
