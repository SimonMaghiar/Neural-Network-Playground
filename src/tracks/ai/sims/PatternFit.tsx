import { useState } from 'react'
import type { SimProps } from '../../types'

type Point = { size: number; price: number }

/** The hidden "truth" behind the toy data: prices in thousands of euros. */
const truePrice = (size: number) => 1.8 * size + 40

const SIZES = [45, 52, 60, 68, 75, 82, 90, 96, 104, 110, 118, 125, 132, 140, 148, 155, 163, 170, 180, 190]
const NOISE = [12, -8, 20, -15, 5, -22, 10, -5, 25, -12, 8, -18, 15, -6, -25, 18, -10, 22, -14, 6]
const HOUSES: Point[] = SIZES.map((s, i) => ({ size: s, price: truePrice(s) + NOISE[i] }))
const NEW_HOUSES: Point[] = [50, 85, 120, 165, 200].map((s, i) => ({ size: s, price: truePrice(s) + [6, -9, 11, -4, 8][i] }))

const DATASETS = [
  { id: 2, label: '2 examples', houses: [HOUSES[2], HOUSES[14]] },
  { id: 5, label: '5 examples', houses: [0, 5, 10, 15, 19].map((i) => HOUSES[i]) },
  { id: 20, label: 'All 20 examples', houses: HOUSES },
]

/** The straight line that is closest to all the points (least squares). */
function fitLine(points: Point[]) {
  const n = points.length
  const mx = points.reduce((s, p) => s + p.size, 0) / n
  const my = points.reduce((s, p) => s + p.price, 0) / n
  const sxy = points.reduce((s, p) => s + (p.size - mx) * (p.price - my), 0)
  const sxx = points.reduce((s, p) => s + (p.size - mx) ** 2, 0)
  const slope = sxy / sxx
  return { slope, intercept: my - slope * mx }
}

const W = 420
const H = 260
const PAD = { l: 44, r: 12, t: 12, b: 34 }
const X0 = 30
const X1 = 210
const Y0 = 50
const Y1 = 450
const sx = (x: number) => PAD.l + ((x - X0) / (X1 - X0)) * (W - PAD.l - PAD.r)
const sy = (y: number) => H - PAD.b - ((y - Y0) / (Y1 - Y0)) * (H - PAD.t - PAD.b)
const euro = (k: number) => `€${Math.round(k)}k`

export function PatternFit({ onTaskDone }: SimProps) {
  const [datasetId, setDatasetId] = useState(2)
  const [visited, setVisited] = useState<Set<number>>(() => new Set([2]))
  const [size, setSize] = useState(160)

  const data = DATASETS.find((d) => d.id === datasetId)!
  const { slope, intercept } = fitLine(data.houses)
  const predict = (s: number) => slope * s + intercept
  const errors = NEW_HOUSES.map((h) => Math.abs(predict(h.size) - h.price))
  const avgError = errors.reduce((a, b) => a + b, 0) / errors.length

  const choose = (id: number) => {
    setDatasetId(id)
    const next = new Set(visited).add(id)
    setVisited(next)
    if (next.has(2) && next.has(20)) onTaskDone()
  }

  return (
    <div className="sim">
      <div className="sim-row">
        <span className="sim-label">Learn the pattern from:</span>
        <div className="pill-group">
          {DATASETS.map((d) => (
            <button key={d.id} className={d.id === datasetId ? 'is-active' : ''} onClick={() => choose(d.id)}>
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="ai-chart">
        {[100, 200, 300, 400].map((y) => (
          <g key={y}>
            <line x1={PAD.l} x2={W - PAD.r} y1={sy(y)} y2={sy(y)} className="grid-line" />
            <text x={PAD.l - 6} y={sy(y) + 4} textAnchor="end" className="axis-text">
              {euro(y)}
            </text>
          </g>
        ))}
        {[50, 100, 150, 200].map((x) => (
          <text key={x} x={sx(x)} y={H - PAD.b + 16} textAnchor="middle" className="axis-text">
            {x} m²
          </text>
        ))}
        <text x={W - PAD.r} y={H - 4} textAnchor="end" className="axis-text">
          house size
        </text>

        <line x1={sx(X0)} y1={sy(predict(X0))} x2={sx(X1)} y2={sy(predict(X1))} className="ai-fit-line" />
        {data.houses.map((h) => (
          <circle key={h.size} cx={sx(h.size)} cy={sy(h.price)} r={5} className="ai-point" />
        ))}
        {NEW_HOUSES.map((h) => (
          <g key={h.size}>
            <line x1={sx(h.size)} x2={sx(h.size)} y1={sy(h.price)} y2={sy(predict(h.size))} className="ai-error-line" />
            <circle cx={sx(h.size)} cy={sy(h.price)} r={5} className="ai-point new" />
          </g>
        ))}
        <circle cx={sx(size)} cy={sy(predict(size))} r={7} className="ai-guess" />
      </svg>
      <div className="ai-legend">
        <span>
          <i className="ai-point-key" /> examples it learned from
        </span>
        <span>
          <i className="ai-point-key new" /> new houses (real price)
        </span>
        <span>
          <i className="ai-line-key" /> the pattern it found
        </span>
      </div>

      <label className="slider wide">
        <span>
          Predict the price of a new house of <b>{size} m²</b>
        </span>
        <input type="range" min={40} max={200} step={5} value={size} onChange={(e) => setSize(Number(e.target.value))} />
      </label>

      <div className="big-stats">
        <div>
          <span>Pattern it found</span>
          <b>
            €{(slope * 1000).toFixed(0)} per m² + {euro(intercept)}
          </b>
        </div>
        <div>
          <span>Prediction for {size} m²</span>
          <b>{euro(predict(size))}</b>
        </div>
        <div>
          <span>Average miss on the 5 new houses</span>
          <b className={avgError < 15 ? 'good' : 'warn'}>{euro(avgError)}</b>
        </div>
      </div>
    </div>
  )
}
