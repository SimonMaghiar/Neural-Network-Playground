import { useState } from 'react'
import { Dices } from 'lucide-react'
import type { SimProps } from '../../types'
import { pct, sampleIndex, softmax } from '../math'

const CANDIDATES = [
  { word: 'tea', score: 3.0 },
  { word: 'coffee', score: 2.8 },
  { word: 'water', score: 1.8 },
  { word: 'cocoa', score: 1.5 },
  { word: 'milk', score: 1.2 },
  { word: 'soup', score: 0.3 },
  { word: 'sand', score: -1.5 },
  { word: 'paint', score: -2.0 },
  { word: 'socks', score: -2.5 },
]
const DRAWS = 20

/** Applies temperature (0 = always the top word) and top-p (keep the smallest set of words covering p). */
function distribution(temperature: number, topP: number): number[] {
  const scores = CANDIDATES.map((c) => c.score)
  if (temperature === 0) return scores.map((_, i) => (i === 0 ? 1 : 0))
  const probs = softmax(scores, temperature)
  const order = probs.map((p, i) => ({ p, i })).sort((a, b) => b.p - a.p)
  const keep = new Set<number>()
  let total = 0
  for (const { p, i } of order) {
    keep.add(i)
    total += p
    if (total >= topP) break
  }
  const kept = probs.map((p, i) => (keep.has(i) ? p : 0))
  const sum = kept.reduce((a, b) => a + b, 0)
  return kept.map((p) => p / sum)
}

export function Sampling({ onTaskDone }: SimProps) {
  const [temperature, setTemperature] = useState(1)
  const [topP, setTopP] = useState(1)
  const [draws, setDraws] = useState<number[] | null>(null)
  const [tried, setTried] = useState({ cold: false, hot: false })

  const probs = distribution(temperature, topP)
  const tally = draws && CANDIDATES.map((_, i) => draws.filter((d) => d === i).length)

  const sample = () => {
    setDraws(Array.from({ length: DRAWS }, () => sampleIndex(probs)))
    const next = { cold: tried.cold || temperature === 0, hot: tried.hot || (temperature >= 1.5 && topP === 1) }
    setTried(next)
    if (next.cold && next.hot) onTaskDone()
  }

  return (
    <div className="sim">
      <div className="sentence-box">
        After a long day at work, I like to drink a cup of <span className="caret" />
      </div>
      <label className="slider wide">
        <span>
          Temperature: <b>{temperature.toFixed(1)}</b>{' '}
          {temperature === 0 ? '(always the most likely word)' : temperature < 0.7 ? '(safe, predictable)' : temperature > 1.3 ? '(wild, creative)' : '(balanced)'}
        </span>
        <input
          type="range"
          min={0}
          max={2}
          step={0.1}
          value={temperature}
          onChange={(e) => {
            setTemperature(Number(e.target.value))
            setDraws(null)
          }}
        />
      </label>
      <label className="slider wide">
        <span>
          Top-p: <b>{topP.toFixed(2)}</b> (only keep the most likely words that together cover {Math.round(topP * 100)}%)
        </span>
        <input
          type="range"
          min={0.1}
          max={1}
          step={0.05}
          value={topP}
          onChange={(e) => {
            setTopP(Number(e.target.value))
            setDraws(null)
          }}
        />
      </label>

      <div className="prob-list">
        {CANDIDATES.map((c, i) => (
          <div key={c.word} className={`prob-row static${probs[i] === 0 ? ' is-cut' : ''}`}>
            <span className="prob-word">{c.word}</span>
            <span className="prob-bar">
              <span style={{ width: `${probs[i] * 100}%` }} />
            </span>
            <span className="prob-value">{probs[i] === 0 ? 'cut' : pct(probs[i])}</span>
            <span className="prob-tally">{tally && tally[i] > 0 ? `×${tally[i]}` : ''}</span>
          </div>
        ))}
      </div>

      <div className="sim-row">
        <button className="btn primary" onClick={sample}>
          <Dices size={16} /> Pick the next word {DRAWS} times
        </button>
        {draws && (
          <span className="muted">
            Picked: {draws.slice(0, 8).map((d) => CANDIDATES[d].word).join(', ')}…
          </span>
        )}
      </div>
      <p className="sim-note">
        The model's raw scores never change. Temperature and top-p only change how we pick from them.
      </p>
    </div>
  )
}
