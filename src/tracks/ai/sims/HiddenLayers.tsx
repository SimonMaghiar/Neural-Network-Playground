import { useState } from 'react'
import type { SimProps } from '../../types'
import { formatCount } from '../../units'

const RADIUS = 0.6
const sigmoid = (z: number) => 1 / (1 + Math.exp(-z))

/** Deterministic pseudo-random dots in the square [-1, 1]²; "inside" means within the circle. */
function makePoints() {
  let seed = 7
  const rand = () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }
  return Array.from({ length: 140 }, () => {
    const x = rand() * 2 - 1
    const y = rand() * 2 - 1
    return { x, y, inside: Math.hypot(x, y) < RADIUS }
  })
}
const POINTS = makePoints()

/** One neuron = one straight line: it says "inside" for everything on one side of it. */
interface Line {
  angle: number
  offset: number
}
const side = (l: Line, x: number, y: number) => l.offset - (x * Math.cos(l.angle) + y * Math.sin(l.angle))

/** The best a single neuron can do with a line that actually crosses the circle. */
const SINGLE: Line = (() => {
  let best = { line: { angle: 0, offset: 0 }, right: -1 }
  for (let a = 0; a < 360; a += 15) {
    for (let o = -0.5; o <= 0.5; o += 0.05) {
      const line = { angle: (a * Math.PI) / 180, offset: o }
      const right = POINTS.filter((p) => side(line, p.x, p.y) > 0 === p.inside).length
      if (right > best.right) best = { line, right }
    }
  }
  return best.line
})()

/** Hidden neurons each draw a line facing the centre; the output neuron says "inside" only when all of them agree. */
function polygon(n: number, apothem: number): Line[] {
  return Array.from({ length: n }, (_, i) => ({ angle: (2 * Math.PI * i) / n + Math.PI / 2, offset: apothem }))
}

const NETWORKS = [
  { id: 'none', label: 'No hidden layer', hidden: [] as Line[], params: 3 },
  { id: 'three', label: 'Hidden layer: 3 neurons', hidden: polygon(3, 0.47), params: 3 * 3 + 4 },
  { id: 'eight', label: 'Hidden layer: 8 neurons', hidden: polygon(8, 0.585), params: 8 * 3 + 9 },
]

function predict(net: (typeof NETWORKS)[number], x: number, y: number): number {
  if (!net.hidden.length) return sigmoid(14 * side(SINGLE, x, y))
  const hidden = net.hidden.map((l) => sigmoid(30 * side(l, x, y)))
  const sum = hidden.reduce((a, b) => a + b, 0)
  return sigmoid(10 * (sum - (net.hidden.length - 0.5)))
}

const REAL = [
  { name: 'A small handwriting reader', params: 100_000 },
  { name: 'A photo recogniser (ResNet-50, 2015)', params: 25e6 },
  { name: 'GPT-3 (2020)', params: 175e9 },
]

const SIZE = 280
const CELLS = 35
const px = (v: number) => ((v + 1) / 2) * SIZE

export function HiddenLayers({ onTaskDone }: SimProps) {
  const [netId, setNetId] = useState('none')
  const net = NETWORKS.find((n) => n.id === netId)!
  const right = POINTS.filter((p) => predict(net, p.x, p.y) > 0.5 === p.inside).length
  const accuracy = Math.round((right / POINTS.length) * 100)
  const lines = net.hidden.length ? net.hidden : [SINGLE]

  const choose = (id: string) => {
    setNetId(id)
    const next = NETWORKS.find((n) => n.id === id)!
    const r = POINTS.filter((p) => predict(next, p.x, p.y) > 0.5 === p.inside).length
    if (r / POINTS.length >= 0.95) onTaskDone()
  }

  const cell = SIZE / CELLS
  return (
    <div className="sim">
      <div className="sim-row">
        <span className="sim-label">Network:</span>
        <div className="pill-group">
          {NETWORKS.map((n) => (
            <button key={n.id} className={n.id === netId ? 'is-active' : ''} onClick={() => choose(n.id)}>
              {n.label}
            </button>
          ))}
        </div>
      </div>

      <div className="ai-two-col">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width={SIZE} height={SIZE} className="ai-chart ai-map">
          {Array.from({ length: CELLS * CELLS }, (_, i) => {
            const cx = i % CELLS
            const cy = Math.floor(i / CELLS)
            const p = predict(net, ((cx + 0.5) / CELLS) * 2 - 1, 1 - ((cy + 0.5) / CELLS) * 2)
            return (
              <rect
                key={i}
                x={cx * cell}
                y={cy * cell}
                width={cell + 0.5}
                height={cell + 0.5}
                fill={`rgba(45, 212, 191, ${(p * 0.35).toFixed(2)})`}
              />
            )
          })}
          {lines.map((l, i) => {
            const nx = Math.cos(l.angle)
            const ny = Math.sin(l.angle)
            const [x0, y0] = [nx * l.offset - ny * 2, ny * l.offset + nx * 2]
            const [x1, y1] = [nx * l.offset + ny * 2, ny * l.offset - nx * 2]
            return <line key={i} x1={px(x0)} y1={SIZE - px(y0)} x2={px(x1)} y2={SIZE - px(y1)} className="ai-neuron-line" />
          })}
          {POINTS.map((p, i) => (
            <circle
              key={i}
              cx={px(p.x)}
              cy={SIZE - px(p.y)}
              r={3.5}
              className={`ai-dot-point ${p.inside ? 'inside' : 'outside'}${predict(net, p.x, p.y) > 0.5 === p.inside ? '' : ' miss'}`}
            />
          ))}
        </svg>

        <div className="ai-net-side">
          <NetDiagram hidden={net.hidden.length} />
          <div className="big-stats column">
            <div>
              <span>Dots sorted correctly</span>
              <b className={accuracy >= 95 ? 'good' : accuracy < 80 ? 'warn' : ''}>{accuracy}%</b>
            </div>
            <div>
              <span>Parameters (weights + biases)</span>
              <b>{net.params}</b>
            </div>
          </div>
        </div>
      </div>
      <p className="sim-note">
        Green dots should end up in the shaded "inside" area, grey dots outside. Ringed dots are mistakes. Each faint line
        is one neuron's straight line.
      </p>

      <h4 className="sim-subtitle">Real networks, for comparison</h4>
      <div className="ai-real">
        {REAL.map((r) => (
          <div key={r.name}>
            <span>{r.name}</span>
            <b>{formatCount(r.params)} parameters</b>
          </div>
        ))}
      </div>
    </div>
  )
}

function NetDiagram({ hidden }: { hidden: number }) {
  const W = 200
  const H = 120
  const col = (count: number, x: number) =>
    Array.from({ length: count }, (_, i) => ({ x, y: count === 1 ? H / 2 : 14 + (i * (H - 28)) / (count - 1) }))
  const inputs = col(2, 22)
  const mid = col(hidden, 100)
  const out = col(1, 178)
  const edges = hidden
    ? [...inputs.flatMap((a) => mid.map((b) => [a, b])), ...mid.map((a) => [a, out[0]])]
    : inputs.map((a) => [a, out[0]])
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="ai-net">
      {edges.map(([a, b], i) => (
        <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="mini-edge" />
      ))}
      {[...inputs, ...mid, ...out].map((n, i) => (
        <circle key={i} cx={n.x} cy={n.y} r={hidden > 6 && i >= 2 && i < 2 + hidden ? 5 : 8} className="mini-neuron" />
      ))}
      <text x={22} y={H - 1} textAnchor="middle" className="axis-text">
        x, y
      </text>
      {hidden > 0 && (
        <text x={100} y={H - 1} textAnchor="middle" className="axis-text">
          hidden
        </text>
      )}
      <text x={178} y={H - 1} textAnchor="middle" className="axis-text">
        inside?
      </text>
    </svg>
  )
}
