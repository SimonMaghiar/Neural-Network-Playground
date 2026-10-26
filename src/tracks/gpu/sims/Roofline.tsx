import { useState } from 'react'
import type { SimProps } from '../../types'

/** NVIDIA H100 SXM: ≈989 TFLOP/s dense BF16 tensor math, 3.35 TB/s HBM3 bandwidth. */
const PEAK = 989
const BANDWIDTH = 3.35
const X_MIN = 0.05
const X_MAX = 3000
const Y_MIN = 0.1
const Y_MAX = 3000

const workloads = [
  { name: 'Adding two long lists of numbers', intensity: 0.083 },
  { name: 'A chatbot writing a reply for 1 user', intensity: 1 },
  { name: 'A chatbot writing replies for 64 users at once', intensity: 64 },
  { name: 'Training: one huge matrix multiplication', intensity: 1000 },
]

const W = 520
const H = 280
const PAD = { l: 56, r: 16, t: 16, b: 40 }
const lx = (v: number) => PAD.l + ((Math.log10(v) - Math.log10(X_MIN)) / (Math.log10(X_MAX) - Math.log10(X_MIN))) * (W - PAD.l - PAD.r)
const ly = (v: number) => H - PAD.b - ((Math.log10(v) - Math.log10(Y_MIN)) / (Math.log10(Y_MAX) - Math.log10(Y_MIN))) * (H - PAD.t - PAD.b)
const achieved = (i: number) => Math.min(PEAK, BANDWIDTH * i)
const fromSlider = (s: number) => 10 ** (Math.log10(X_MIN) + (s / 1000) * (Math.log10(X_MAX) - Math.log10(X_MIN)))
const toSlider = (i: number) => ((Math.log10(i) - Math.log10(X_MIN)) / (Math.log10(X_MAX) - Math.log10(X_MIN))) * 1000

export function Roofline({ onTaskDone }: SimProps) {
  const [intensity, setIntensity] = useState(1)
  const [seen, setSeen] = useState({ low: false, full: false })

  const update = (i: number) => {
    setIntensity(i)
    const busy = achieved(i) / PEAK
    const next = { low: seen.low || busy < 0.01, full: seen.full || busy >= 0.999 }
    setSeen(next)
    if (next.low && next.full) onTaskDone()
  }

  const perf = achieved(intensity)
  const busy = perf / PEAK
  const ridge = PEAK / BANDWIDTH
  const memoryBound = intensity < ridge

  return (
    <div className="sim">
      <div className="sim-row">
        <span className="sim-label">Try a real workload:</span>
        <div className="pill-group">
          {workloads.map((w) => (
            <button
              key={w.name}
              className={Math.abs(Math.log10(w.intensity / intensity)) < 0.01 ? 'is-active' : ''}
              onClick={() => update(w.intensity)}
            >
              {w.name}
            </button>
          ))}
        </div>
      </div>
      <label className="slider wide">
        <span>
          Math per byte loaded from memory: <b>{intensity < 1 ? intensity.toFixed(2) : Math.round(intensity)}</b>{' '}
          operations per byte
        </span>
        <input
          type="range"
          min={0}
          max={1000}
          value={toSlider(intensity)}
          onChange={(e) => update(fromSlider(Number(e.target.value)))}
        />
      </label>

      <div className="roofline-wrap">
        <svg width={W} height={H} className="roofline">
          {[0.1, 1, 10, 100, 1000].map((v) => (
            <g key={`y${v}`}>
              <line x1={PAD.l} x2={W - PAD.r} y1={ly(v)} y2={ly(v)} className="grid-line" />
              <text x={PAD.l - 6} y={ly(v) + 4} textAnchor="end" className="axis-text">
                {v}
              </text>
            </g>
          ))}
          {[0.1, 1, 10, 100, 1000].map((v) => (
            <g key={`x${v}`}>
              <line x1={lx(v)} x2={lx(v)} y1={PAD.t} y2={H - PAD.b} className="grid-line" />
              <text x={lx(v)} y={H - PAD.b + 16} textAnchor="middle" className="axis-text">
                {v}
              </text>
            </g>
          ))}
          <polyline
            points={[X_MIN, ridge, X_MAX].map((v) => `${lx(v)},${ly(achieved(v))}`).join(' ')}
            className="roof"
          />
          <text x={lx(0.3)} y={ly(achieved(0.3)) - 10} className="roof-label" transform={`rotate(-27 ${lx(0.3)} ${ly(achieved(0.3)) - 10})`}>
            limited by memory speed
          </text>
          <text x={W - PAD.r - 4} y={ly(PEAK) - 10} textAnchor="end" className="roof-label">
            limited by math speed
          </text>
          <circle cx={lx(intensity)} cy={ly(perf)} r={7} className="roof-dot" />
          <text x={(PAD.l + W - PAD.r) / 2} y={H - 4} textAnchor="middle" className="axis-text">
            operations per byte loaded →
          </text>
          <text x={14} y={(PAD.t + H - PAD.b) / 2} textAnchor="middle" className="axis-text" transform={`rotate(-90 14 ${(PAD.t + H - PAD.b) / 2})`}>
            trillion operations / second
          </text>
        </svg>

        <div className="roofline-side">
          <div className="gauge">
            <div className="gauge-label">GPU math units busy</div>
            <div className="gauge-bar">
              <div style={{ width: `${Math.max(0.5, busy * 100)}%` }} />
            </div>
            <div className="gauge-value">{busy * 100 < 1 ? (busy * 100).toFixed(2) : Math.round(busy * 100)}%</div>
          </div>
          <div className={`verdict-box ${memoryBound ? 'cpu' : 'gpu'}`}>
            {memoryBound ? (
              <>
                <b>Waiting for memory.</b> Data arrives at {BANDWIDTH} TB/s, which only feeds {perf.toFixed(perf < 10 ? 2 : 0)}{' '}
                trillion operations per second. The chef stands idle {Math.round((1 - busy) * 100)}% of the time.
              </>
            ) : (
              <>
                <b>Math is the limit.</b> Every byte is reused enough times that the math units run at full speed (
                {PEAK} trillion operations per second).
              </>
            )}
          </div>
        </div>
      </div>
      <p className="sim-note">
        Numbers for an NVIDIA H100: about {PEAK} trillion AI operations per second, and {BANDWIDTH} TB/s of memory speed.
        Both axes are logarithmic.
      </p>
    </div>
  )
}
