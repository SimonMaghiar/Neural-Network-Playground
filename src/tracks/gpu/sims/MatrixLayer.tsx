import { useState } from 'react'
import type { SimProps } from '../../types'

const W = [
  [1, 2, 0],
  [0, 1, 3],
  [2, 0, 1],
  [1, 1, 1],
]
const BATCH = [
  [2, 1, 3],
  [1, 0, 2],
  [0, 3, 1],
  [4, 2, 0],
]

const dot = (row: number[], col: number[]) => row.reduce((s, w, k) => s + w * col[k], 0)

export function MatrixLayer({ onTaskDone }: SimProps) {
  const [batch, setBatch] = useState(false)
  const [sel, setSel] = useState<{ i: number; j: number }>({ i: 0, j: 0 })
  const [visited, setVisited] = useState<Set<number>>(() => new Set([0]))

  const inputs = batch ? BATCH : BATCH.slice(0, 1)
  const x = inputs[sel.j]
  const outputs = inputs.map((col) => W.map((row) => dot(row, col)))

  const select = (i: number, j: number) => {
    setSel({ i, j })
    const next = new Set(visited).add(i)
    setVisited(next)
    if (next.size === W.length) onTaskDone()
  }

  const nx = 40
  const ny = (k: number, count: number) => 22 + k * (190 / (count - 1))
  return (
    <div className="sim">
      <div className="sim-row">
        <div className="pill-group">
          <button className={!batch ? 'is-active' : ''} onClick={() => { setBatch(false); setSel({ i: sel.i, j: 0 }) }}>
            One input
          </button>
          <button className={batch ? 'is-active' : ''} onClick={() => setBatch(true)}>
            A batch of 4 inputs
          </button>
        </div>
        <span className="sim-note">Click a neuron on the left, or an answer on the right.</span>
      </div>

      <div className="matrix-sim">
        <svg width={260} height={268} className="mini-net">
          {W.map((row, i) =>
            row.map((w, k) => (
              <line
                key={`${i}-${k}`}
                x1={nx}
                y1={ny(k, 3)}
                x2={200}
                y2={ny(i, 4)}
                className={i === sel.i ? 'mini-edge active' : 'mini-edge'}
                strokeWidth={1 + w}
              />
            )),
          )}
          {x.map((v, k) => (
            <g key={k}>
              <rect x={nx - 18} y={ny(k, 3) - 15} width={36} height={30} rx={6} className="mini-input" />
              <text x={nx} y={ny(k, 3) + 5} textAnchor="middle" className="mini-text">
                {v}
              </text>
            </g>
          ))}
          {W.map((_, i) => (
            <g key={i} onClick={() => select(i, sel.j)} className="mini-click">
              <circle cx={215} cy={ny(i, 4)} r={18} className={i === sel.i ? 'mini-neuron active' : 'mini-neuron'} />
              <text x={215} y={ny(i, 4) + 5} textAnchor="middle" className="mini-text">
                {outputs[sel.j][i]}
              </text>
            </g>
          ))}
          <text x={nx} y={262} textAnchor="middle" className="mini-label">
            inputs
          </text>
          <text x={215} y={262} textAnchor="middle" className="mini-label">
            4 neurons
          </text>
        </svg>

        <div className="matrix-eq">
          <MatrixView title="weights (4 × 3)" data={W} highlightRow={sel.i} />
          <span className="matrix-op">×</span>
          <MatrixView
            title={batch ? 'inputs (3 × 4)' : 'input (3 × 1)'}
            data={[0, 1, 2].map((k) => inputs.map((col) => col[k]))}
            highlightCol={sel.j}
          />
          <span className="matrix-op">=</span>
          <MatrixView
            title={batch ? 'answers (4 × 4)' : 'answers (4 × 1)'}
            data={W.map((_, i) => outputs.map((col) => col[i]))}
            highlightCell={sel}
            onCell={(i, j) => select(i, j)}
          />
        </div>
      </div>

      <div className="calc-line big">
        Neuron {sel.i + 1}
        {batch ? `, input ${sel.j + 1}` : ''} = {W[sel.i].map((w, k) => `${w}×${x[k]}`).join(' + ')} ={' '}
        <b>{outputs[sel.j][sel.i]}</b>
      </div>
      <div className="big-stats">
        <div>
          <span>Multiply-adds in this layer</span>
          <b>
            4 × 3 × {inputs.length} = {4 * 3 * inputs.length}
          </b>
        </div>
        <div>
          <span>How many depend on each other?</span>
          <b>None</b>
        </div>
        <div>
          <span>Neurons explored</span>
          <b>{visited.size} / 4</b>
        </div>
      </div>
    </div>
  )
}

function MatrixView(props: {
  title: string
  data: number[][]
  highlightRow?: number
  highlightCol?: number
  highlightCell?: { i: number; j: number }
  onCell?: (i: number, j: number) => void
}) {
  const { title, data, highlightRow, highlightCol, highlightCell, onCell } = props
  return (
    <div className="matrix">
      <div className="matrix-title">{title}</div>
      <div className="matrix-grid" style={{ gridTemplateColumns: `repeat(${data[0].length}, 34px)` }}>
        {data.map((row, i) =>
          row.map((v, j) => {
            const hot =
              i === highlightRow || j === highlightCol || (highlightCell && highlightCell.i === i && highlightCell.j === j)
            return (
              <div
                key={`${i}-${j}`}
                className={`matrix-cell${hot ? ' hot' : ''}${onCell ? ' clickable' : ''}`}
                onClick={onCell && (() => onCell(i, j))}
              >
                {v}
              </div>
            )
          }),
        )}
      </div>
    </div>
  )
}
