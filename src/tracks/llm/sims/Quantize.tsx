import { useState } from 'react'
import { mulberry32 } from '../../../nn/network'
import type { SimProps } from '../../types'
import { formatBytes } from '../../units'

const COUNT = 1024
const GROUP = 32
const BITS = [8, 4, 3, 2]
const OUTLIER = 12
const MODEL_PARAMS = 70e9

/** Bell-shaped weights (std ≈ 1), like a real layer, with two rare large outliers. */
const BASE = (() => {
  const rand = mulberry32(7)
  return Array.from({ length: COUNT }, () => {
    const u = Math.max(rand(), 1e-9)
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand())
  })
})()

function quantize(weights: number[], bits: number, groupSize: number): number[] {
  const levels = 2 ** (bits - 1) - 1
  const out: number[] = []
  for (let g = 0; g < weights.length; g += groupSize) {
    const group = weights.slice(g, g + groupSize)
    const scale = Math.max(...group.map(Math.abs)) / levels
    for (const w of group) out.push(Math.round(w / scale) * scale)
  }
  return out
}

const W = 520
const H = 170
const RANGE = 4
const BINS = 64

export function Quantize({ onTaskDone }: SimProps) {
  const [bits, setBits] = useState(8)
  const [grouped, setGrouped] = useState(false)
  const [outliers, setOutliers] = useState(true)
  const [seen, setSeen] = useState({ tensor: false, group: false })

  const weights = outliers ? BASE.map((w, i) => (i === 100 ? OUTLIER : i === 700 ? -OUTLIER : w)) : BASE
  const q = quantize(weights, bits, grouped ? GROUP : COUNT)
  const normal = weights.map((_, i) => i).filter((i) => Math.abs(weights[i]) < OUTLIER)
  const rmse = Math.sqrt(normal.reduce((s, i) => s + (q[i] - weights[i]) ** 2, 0) / normal.length)
  const zeroed = normal.filter((i) => q[i] === 0 && weights[i] !== 0).length / normal.length
  const bitsPerWeight = bits + (grouped ? 16 / GROUP : 0)

  const update = (b: number, g: boolean, o: boolean) => {
    setBits(b)
    setGrouped(g)
    setOutliers(o)
    const next = { tensor: seen.tensor || (b === 4 && !g && o), group: seen.group || (b === 4 && g && o) }
    setSeen(next)
    if (next.tensor && next.group) onTaskDone()
  }

  const histogram = (values: number[]) => {
    const counts = Array(BINS).fill(0)
    for (const v of values) {
      const b = Math.floor(((v + RANGE) / (2 * RANGE)) * BINS)
      if (b >= 0 && b < BINS) counts[b]++
    }
    return counts
  }
  const before = histogram(weights)
  const after = histogram(q)
  const maxCount = Math.max(...before, ...after)
  const levels = grouped ? [] : (() => {
    const scale = Math.max(...weights.map(Math.abs)) / (2 ** (bits - 1) - 1)
    const out: number[] = []
    for (let v = 0; v <= RANGE; v += scale) out.push(v, -v)
    return out.length > 200 ? [] : out
  })()
  const x = (v: number) => ((v + RANGE) / (2 * RANGE)) * W

  return (
    <div className="sim">
      <div className="sim-row">
        <span className="sim-label">Bits per weight:</span>
        <div className="pill-group">
          {BITS.map((b) => (
            <button key={b} className={b === bits ? 'is-active' : ''} onClick={() => update(b, grouped, outliers)}>
              {b}-bit ({2 ** b} values)
            </button>
          ))}
        </div>
      </div>
      <div className="sim-row">
        <span className="sim-label">Scale:</span>
        <div className="pill-group">
          <button className={!grouped ? 'is-active' : ''} onClick={() => update(bits, false, outliers)}>
            One scale for the whole layer
          </button>
          <button className={grouped ? 'is-active' : ''} onClick={() => update(bits, true, outliers)}>
            One scale per group of {GROUP}
          </button>
        </div>
        <label className="check">
          <input type="checkbox" checked={outliers} onChange={(e) => update(bits, grouped, e.target.checked)} /> Include 2
          outlier weights (±{OUTLIER})
        </label>
      </div>

      <svg width={W} height={H + 24} className="quant-chart" viewBox={`0 0 ${W} ${H + 24}`}>
        {levels.map((v, i) => (
          <line key={i} x1={x(v)} x2={x(v)} y1={0} y2={H} className="quant-level" />
        ))}
        {before.map((c, i) => (
          <rect key={`b${i}`} x={(i * W) / BINS} y={H - (c / maxCount) * H} width={W / BINS - 1} height={(c / maxCount) * H} className="quant-before" />
        ))}
        {after.map((c, i) => (
          <rect key={`a${i}`} x={(i * W) / BINS + 2} y={H - (c / maxCount) * H} width={W / BINS - 5} height={(c / maxCount) * H} className="quant-after" />
        ))}
        {[-3, -2, -1, 0, 1, 2, 3].map((v) => (
          <text key={v} x={x(v)} y={H + 16} textAnchor="middle" className="axis-text">
            {v}
          </text>
        ))}
      </svg>
      <div className="bit-legend">
        <span>
          <i className="swatch-box before" /> original weights
        </span>
        <span>
          <i className="swatch-box after" /> after rounding
        </span>
        {levels.length > 0 && (
          <span>
            <i className="swatch-box level" /> allowed values
          </span>
        )}
      </div>

      <div className="big-stats">
        <div>
          <span>Average rounding error</span>
          <b className={rmse > 0.3 ? 'warn' : rmse < 0.1 ? 'good' : ''}>{rmse.toFixed(3)}</b>
        </div>
        <div>
          <span>Weights rounded to 0</span>
          <b className={zeroed > 0.3 ? 'warn' : ''}>{Math.round(zeroed * 100)}%</b>
        </div>
        <div>
          <span>A 70B model needs</span>
          <b>{formatBytes((MODEL_PARAMS * bitsPerWeight) / 8)}</b>
        </div>
      </div>
      <p className="sim-note">
        Error is measured on the normal weights (typical size about 1). Group scales cost a little extra memory: one
        16-bit scale per {GROUP} weights adds 0.5 bits per weight.
      </p>
    </div>
  )
}
