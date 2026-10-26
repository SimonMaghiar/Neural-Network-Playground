import { useState } from 'react'
import { CircleCheck, CircleX } from 'lucide-react'
import type { SimProps } from '../../types'

type Ring = 'none' | 'ai' | 'ml' | 'dl' | 'llm'

const RINGS: { id: Ring; label: string }[] = [
  { id: 'none', label: 'Not AI' },
  { id: 'ai', label: 'AI, no learning' },
  { id: 'ml', label: 'Machine learning' },
  { id: 'dl', label: 'Deep learning' },
  { id: 'llm', label: 'LLM' },
]

const SYSTEMS: { name: string; ring: Ring; why: string }[] = [
  {
    name: 'A calculator app',
    ring: 'none',
    why: 'It follows exact instructions written by a programmer. Nothing about it looks intelligent, and it learns nothing.',
  },
  {
    name: 'A 1990s chess computer that follows strategies written by chess experts',
    ring: 'ai',
    why: 'It plays like a clever human, so it is AI. But every rule was written by people: it never learned from examples.',
  },
  {
    name: 'A house-price estimator that found its pattern in 10,000 past sales',
    ring: 'ml',
    why: 'It learned from examples, so it is machine learning. A simple pattern (a few numbers) is enough, no deep network needed.',
  },
  {
    name: 'A spam filter that learns word scores from the emails you mark as spam',
    ring: 'ml',
    why: 'Like the filter in Module 1: it learns from labelled examples, using a simple score per word rather than a deep network.',
  },
  {
    name: 'Face unlock on your phone',
    ring: 'dl',
    why: 'Recognising a face from pixels is far too complex for simple patterns. It uses a deep neural network trained on millions of photos.',
  },
  {
    name: 'An app that turns your speech into text',
    ring: 'dl',
    why: 'Sound waves to words is a job for a deep neural network with many layers, trained on many hours of recorded speech.',
  },
  {
    name: 'ChatGPT',
    ring: 'llm',
    why: 'A Large Language Model: a huge deep neural network trained on enormous amounts of text to predict the next word.',
  },
]

/** Nested circles, biggest first; each sits at the bottom of the one around it. */
const CIRCLES = [
  { id: 'ai', r: 128, label: 'AI' },
  { id: 'ml', r: 96, label: 'Machine learning' },
  { id: 'dl', r: 64, label: 'Deep learning' },
  { id: 'llm', r: 32, label: 'LLMs' },
] as const
const BOTTOM = 270
const CX = 150

export function AiFamily({ onTaskDone }: SimProps) {
  const [answers, setAnswers] = useState<Record<number, Ring>>({})

  const answer = (i: number, ring: Ring) => {
    const next = { ...answers, [i]: ring }
    setAnswers(next)
    if (SYSTEMS.every((s, k) => next[k] === s.ring)) onTaskDone()
  }

  const correct = SYSTEMS.filter((s, i) => answers[i] === s.ring).length
  const placed = SYSTEMS.map((s, i) => ({ ...s, i })).filter((s) => answers[s.i] === s.ring)

  return (
    <div className="sim">
      <div className="ai-family">
        <svg viewBox="0 0 300 280" width={300} height={280} className="ai-rings" role="img" aria-label="AI contains machine learning, which contains deep learning, which contains LLMs">
          {CIRCLES.map((c, k) => (
            <g key={c.id}>
              <circle cx={CX} cy={BOTTOM - c.r} r={c.r} className={`ai-ring ring-${k}`} />
              <text x={CX} y={BOTTOM - 2 * c.r + 16} textAnchor="middle" className="ai-ring-label">
                {c.label}
              </text>
            </g>
          ))}
          {placed.map((s) => {
            const ring = CIRCLES.find((c) => c.id === s.ring)
            const sameRing = placed.filter((p) => p.ring === s.ring)
            const k = sameRing.indexOf(s)
            const y = ring ? BOTTOM - 2 * ring.r + 30 + (ring.id === 'llm' ? 6 : 8) : 24
            const x = ring ? CX + (k - (sameRing.length - 1) / 2) * 24 : 22 + k * 24
            return (
              <g key={s.i}>
                <circle cx={x} cy={y} r={10} className="ai-dot" />
                <text x={x} y={y + 4} textAnchor="middle" className="ai-dot-text">
                  {s.i + 1}
                </text>
              </g>
            )
          })}
        </svg>
        <p className="sim-note">
          Each circle sits inside a bigger one: every LLM is a deep learning system, all deep learning is machine
          learning, and all machine learning is AI. Correctly sorted systems appear in their circle.
        </p>
      </div>

      <ol className="ai-sort-list">
        {SYSTEMS.map((s, i) => {
          const picked = answers[i]
          const right = picked === s.ring
          return (
            <li key={s.name}>
              <div className="ai-sort-name">
                <span className="ai-sort-num">{i + 1}</span> {s.name}
              </div>
              <div className="pill-group">
                {RINGS.map((r) => (
                  <button
                    key={r.id}
                    className={picked === r.id ? 'is-active' : ''}
                    onClick={() => answer(i, r.id)}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
              {picked && (
                <p className={`ai-feedback ${right ? 'ai-right' : 'ai-wrong'}`}>
                  {right ? <CircleCheck size={14} /> : <CircleX size={14} />}{' '}
                  {right ? s.why : 'Not quite. Ask yourself: did it learn from examples? With a deep network? Is it about language?'}
                </p>
              )}
            </li>
          )
        })}
      </ol>

      <div className="big-stats">
        <div>
          <span>Sorted correctly</span>
          <b className={correct === SYSTEMS.length ? 'good' : ''}>
            {correct} / {SYSTEMS.length}
          </b>
        </div>
      </div>
    </div>
  )
}
