import { useState } from 'react'
import type { SimProps } from '../../types'
import { pct, softmax } from '../math'

type Ending = 'tired' | 'wide'
const words = (end: Ending) => ['The', 'animal', "didn't", 'cross', 'the', 'street', 'because', 'it', 'was', 'too', end]
const IT = 7

/**
 * Hand-picked relevance scores (what a trained model computes as query · key).
 * scores[q][k] = how relevant word k is when updating word q.
 */
function scores(end: Ending): number[][] {
  const n = 11
  const s = Array.from({ length: n }, (_, q) =>
    Array.from({ length: n }, (_, k): number => (k === q ? 1.5 : Math.abs(k - q) === 1 ? 0.8 : 0)),
  )
  const tiredAnimal = end === 'tired'
  s[IT][1] = tiredAnimal ? 3.2 : 0.6
  s[IT][5] = tiredAnimal ? 0.6 : 3.2
  s[IT][10] = 1.6
  s[10][1] = tiredAnimal ? 2.8 : 0.4
  s[10][5] = tiredAnimal ? 0.4 : 2.8
  s[10][IT] = 1.8
  s[3][1] = 2.2
  s[3][5] = 2.2
  s[2][3] = 2.4
  s[5][4] = 1.8
  s[1][0] = 1.8
  s[6][2] = 1.2
  return s
}

export function Attention({ onTaskDone }: SimProps) {
  const [end, setEnd] = useState<Ending>('tired')
  const [query, setQuery] = useState(1)
  const [seen, setSeen] = useState<Set<Ending>>(() => new Set())

  const tokens = words(end)
  const raw = scores(end)[query]
  const weights = softmax(raw)
  const top = weights.indexOf(Math.max(...weights.filter((_, k) => k !== query)))

  const update = (q: number, e: Ending) => {
    setQuery(q)
    setEnd(e)
    if (q === IT) {
      const next = new Set(seen).add(e)
      setSeen(next)
      if (next.size === 2) onTaskDone()
    }
  }

  return (
    <div className="sim">
      <div className="sim-row">
        <span className="sim-label">Sentence ending:</span>
        <div className="pill-group">
          {(['tired', 'wide'] as Ending[]).map((e) => (
            <button key={e} className={e === end ? 'is-active' : ''} onClick={() => update(query, e)}>
              … because it was too {e}
            </button>
          ))}
        </div>
      </div>
      <div className="sim-label">Click a word to see which words it pays attention to:</div>
      <div className="attn-sentence">
        {tokens.map((t, k) => (
          <button
            key={k}
            className={`attn-word${k === query ? ' is-query' : ''}`}
            style={k === query ? undefined : { background: `rgba(96, 165, 250, ${Math.min(1, weights[k] * 2.2)})` }}
            onClick={() => update(k, end)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="verdict-box gpu">
        When reading <b>“{tokens[query]}”</b>, the model looks mostly at <b>“{tokens[top]}”</b> ({pct(weights[top])} of
        its attention, apart from itself). It then mixes in information from each word in these proportions.
      </div>

      <table className="attn-table">
        <thead>
          <tr>
            <th>Word</th>
            <th>Relevance score</th>
            <th>Attention (after softmax)</th>
          </tr>
        </thead>
        <tbody>
          {tokens.map((t, k) => (
            <tr key={k} className={k === query ? 'is-query' : ''}>
              <td>{t}</td>
              <td className="mono">{raw[k].toFixed(1)}</td>
              <td>
                <div className="prob-inline">
                  <span className="prob-bar">
                    <span style={{ width: `${weights[k] * 100}%` }} />
                  </span>
                  <span className="mono">{pct(weights[k])}</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="sim-note">
        Scores here are hand-picked to show the idea. In a real model, each word's score comes from multiplying a learned
        “question” vector (query) with every word's “label” vector (key).
      </p>
    </div>
  )
}
