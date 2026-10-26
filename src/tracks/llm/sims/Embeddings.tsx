import { useState } from 'react'
import type { SimProps } from '../../types'

type Vec = [number, number]

/** Hand-made 2-D "embeddings". Within each group, left→right and down→up carry a consistent meaning. */
const WORDS: Record<string, { v: Vec; group: string }> = {
  man: { v: [-1, 0], group: 'people' },
  woman: { v: [1, 0], group: 'people' },
  king: { v: [-1, 3], group: 'people' },
  queen: { v: [1, 3], group: 'people' },
  prince: { v: [-1, 1.8], group: 'people' },
  princess: { v: [1, 1.8], group: 'people' },
  boy: { v: [-1, -2], group: 'people' },
  girl: { v: [1, -2], group: 'people' },
  dog: { v: [5, 1], group: 'animals' },
  cat: { v: [7, 1], group: 'animals' },
  puppy: { v: [5, -1], group: 'animals' },
  kitten: { v: [7, -1], group: 'animals' },
  apple: { v: [3, 6], group: 'food' },
  banana: { v: [4, 6.6], group: 'food' },
  pizza: { v: [5.3, 5.6], group: 'food' },
  bread: { v: [4.4, 4.9], group: 'food' },
}
const GROUP_COLORS: Record<string, string> = { people: '#60a5fa', animals: '#4ade80', food: '#facc15' }
const NAMES = Object.keys(WORDS)
const PRESETS: [string, string, string][] = [
  ['king', 'man', 'woman'],
  ['boy', 'man', 'woman'],
  ['puppy', 'dog', 'cat'],
  ['prince', 'king', 'queen'],
]

const dist = (a: Vec, b: Vec) => Math.hypot(a[0] - b[0], a[1] - b[1])

function nearest(v: Vec, exclude: string[]): { word: string; d: number }[] {
  return NAMES.filter((w) => !exclude.includes(w))
    .map((w) => ({ word: w, d: dist(WORDS[w].v, v) }))
    .sort((a, b) => a.d - b.d)
}

const W = 420
const H = 340
const X0 = -2.5
const X1 = 8.5
const Y0 = -3
const Y1 = 7.5
const sx = (x: number) => ((x - X0) / (X1 - X0)) * W
const sy = (y: number) => H - ((y - Y0) / (Y1 - Y0)) * H

export function Embeddings({ onTaskDone }: SimProps) {
  const [abc, setAbc] = useState<[string, string, string]>(['king', 'man', 'woman'])
  const [computed, setComputed] = useState(false)
  const [selected, setSelected] = useState('cat')

  const [a, b, c] = abc
  const result: Vec = [WORDS[a].v[0] - WORDS[b].v[0] + WORDS[c].v[0], WORDS[a].v[1] - WORDS[b].v[1] + WORDS[c].v[1]]
  const answer = nearest(result, [a, b, c])[0]
  const neighbours = nearest(WORDS[selected].v, [selected]).slice(0, 3)

  const choose = (next: [string, string, string]) => {
    setAbc(next)
    setComputed(false)
  }
  const compute = () => {
    setComputed(true)
    if (a === 'king' && b === 'man' && c === 'woman') onTaskDone()
  }

  return (
    <div className="sim">
      <div className="sim-row">
        <span className="sim-label">Word math:</span>
        {[0, 1, 2].map((k) => (
          <span key={k} className="analogy-slot">
            {k > 0 && <b>{k === 1 ? '−' : '+'}</b>}
            <select
              value={abc[k]}
              onChange={(e) => {
                const next = [...abc] as [string, string, string]
                next[k] = e.target.value
                choose(next)
              }}
            >
              {NAMES.map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </span>
        ))}
        <button className="btn primary" onClick={compute}>
          = ?
        </button>
      </div>
      <div className="pill-group">
        {PRESETS.map((p) => (
          <button key={p.join()} onClick={() => choose(p)} className={p.join() === abc.join() ? 'is-active' : ''}>
            {p[0]} − {p[1]} + {p[2]}
          </button>
        ))}
      </div>

      <svg width={W} height={H} className="embed-map" viewBox={`0 0 ${W} ${H}`}>
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="#f472b6" />
          </marker>
        </defs>
        {computed && (
          <>
            <line
              x1={sx(WORDS[b].v[0])}
              y1={sy(WORDS[b].v[1])}
              x2={sx(WORDS[a].v[0])}
              y2={sy(WORDS[a].v[1])}
              className="embed-arrow"
              markerEnd="url(#arrow)"
            />
            <line
              x1={sx(WORDS[c].v[0])}
              y1={sy(WORDS[c].v[1])}
              x2={sx(result[0])}
              y2={sy(result[1])}
              className="embed-arrow"
              markerEnd="url(#arrow)"
            />
            <circle cx={sx(result[0])} cy={sy(result[1])} r={14} className="embed-result" />
          </>
        )}
        {NAMES.map((n) => {
          const [x, y] = WORDS[n].v
          const role = computed && (n === a || n === b || n === c)
          return (
            <g key={n} className="embed-point" onClick={() => setSelected(n)}>
              <circle
                cx={sx(x)}
                cy={sy(y)}
                r={n === selected ? 7 : 5}
                fill={GROUP_COLORS[WORDS[n].group]}
                stroke={n === selected ? '#fff' : 'none'}
                strokeWidth={2}
              />
              <text x={sx(x) + 9} y={sy(y) + 4} className={role ? 'embed-label strong' : 'embed-label'}>
                {n}
              </text>
            </g>
          )
        })}
      </svg>

      {computed && (
        <div className="verdict-box gpu">
          {a} − {b} + {c} lands closest to <b>{answer.word}</b>. The arrow from “{b}” to “{a}” is the same arrow as
          from “{c}” to “{answer.word}”: the map has a consistent direction for that difference.
        </div>
      )}
      <div className="sim-note">
        Click any word: its nearest neighbours are <b>{neighbours.map((n) => n.word).join(', ')}</b> (for “{selected}”).
        Words with similar meanings end up close together.
      </div>
    </div>
  )
}
