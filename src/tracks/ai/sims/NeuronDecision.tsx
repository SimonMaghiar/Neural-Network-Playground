import { useState } from 'react'
import { CircleCheck, CircleX } from 'lucide-react'
import type { SimProps } from '../../types'
import { signColor } from '../../../ui/format'

const INPUTS = ['Sunshine', 'Friends coming', 'Homework left']

const DAYS = [
  { name: 'Saturday', values: [9, 7, 2], want: true },
  { name: 'Tuesday', values: [3, 2, 8], want: false },
]

const signed = (v: number) => (v < 0 ? `−${Math.abs(v)}` : String(v))
const show = (v: number) => (v < 0 ? `(${signed(v)})` : String(v))
const round = (v: number) => Math.round(v * 100) / 100

export function NeuronDecision({ onTaskDone }: SimProps) {
  const [weights, setWeights] = useState([0, 0, 0])
  const [bias, setBias] = useState(0)
  const [day, setDay] = useState(0)

  const total = (values: number[], w = weights, b = bias) => round(values.reduce((s, v, k) => s + v * w[k], 0) + b)
  const solved = (w: number[], b: number) => DAYS.every((d) => total(d.values, w, b) > 0 === d.want)

  const setWeight = (k: number, v: number) => {
    const next = weights.map((w, i) => (i === k ? v : w))
    setWeights(next)
    if (solved(next, bias)) onTaskDone()
  }
  const changeBias = (v: number) => {
    setBias(v)
    if (solved(weights, v)) onTaskDone()
  }

  const current = DAYS[day]
  const sum = total(current.values)

  return (
    <div className="sim">
      <div className="sim-row">
        <span className="sim-label">Show the neuron on:</span>
        <div className="pill-group">
          {DAYS.map((d, i) => (
            <button key={d.name} className={i === day ? 'is-active' : ''} onClick={() => setDay(i)}>
              {d.name}
            </button>
          ))}
        </div>
      </div>

      <svg viewBox="0 0 420 210" width={420} height={210} className="ai-chart">
        {INPUTS.map((name, k) => {
          const y = 40 + k * 65
          const w = weights[k]
          return (
            <g key={name}>
              <line
                x1={120}
                y1={y}
                x2={300}
                y2={105}
                stroke={w === 0 ? '#2b3142' : signColor(w)}
                strokeWidth={1.5 + Math.abs(w) * 5}
              />
              <rect x={14} y={y - 20} width={106} height={40} rx={8} className="mini-input" />
              <text x={67} y={y - 3} textAnchor="middle" className="ai-svg-small">
                {name}
              </text>
              <text x={67} y={y + 13} textAnchor="middle" className="ai-svg-value">
                {current.values[k]}
              </text>
              <text x={205} y={y + (105 - y) / 2 - 6} textAnchor="middle" className="ai-svg-weight">
                × {w}
              </text>
            </g>
          )
        })}
        <circle cx={320} cy={105} r={36} className="mini-neuron active" />
        <text x={320} y={100} textAnchor="middle" className="ai-svg-small">
          total
        </text>
        <text x={320} y={118} textAnchor="middle" className="ai-svg-value">
          {signed(sum)}
        </text>
        <text x={320} y={165} textAnchor="middle" className="ai-svg-small">
          bias {bias >= 0 ? '+' : '−'}
          {Math.abs(bias)}
        </text>
        <text x={320} y={195} textAnchor="middle" className={sum > 0 ? 'ai-svg-go' : 'ai-svg-stay'}>
          {sum > 0 ? 'Go to the beach!' : 'Stay home'}
        </text>
      </svg>

      <div className="ai-sliders">
        {INPUTS.map((name, k) => (
          <label key={name} className="slider wide">
            <span>
              Weight for {name.toLowerCase()}: <b>{weights[k]}</b>
            </span>
            <input
              type="range"
              min={-1}
              max={1}
              step={0.1}
              value={weights[k]}
              onChange={(e) => setWeight(k, round(Number(e.target.value)))}
            />
          </label>
        ))}
        <label className="slider wide">
          <span>
            Bias (a starting amount, added at the end): <b>{bias}</b>
          </span>
          <input type="range" min={-5} max={5} step={0.5} value={bias} onChange={(e) => changeBias(Number(e.target.value))} />
        </label>
      </div>

      <div className="ai-days">
        {DAYS.map((d) => {
          const t = total(d.values)
          const right = t > 0 === d.want
          return (
            <div key={d.name} className={right ? 'ai-right' : 'ai-wrong'}>
              {right ? <CircleCheck size={15} /> : <CircleX size={15} />} <b>{d.name}</b> (should be{' '}
              {d.want ? 'go' : 'stay home'}):{' '}
              <span className="mono">
                {d.values.map((v, k) => `${v} × ${show(weights[k])}`).join(' + ')} + {show(bias)} = {signed(t)}
              </span>{' '}
              → {t > 0 ? 'go' : 'stay home'}
            </div>
          )
        })}
      </div>
      <p className="sim-note">The neuron says "go" when the total is above 0. Blue lines are positive weights, orange lines negative.</p>
    </div>
  )
}
