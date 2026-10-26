import { useState } from 'react'
import { BookOpen, MessagesSquare, ThumbsUp } from 'lucide-react'
import type { SimProps } from '../../types'

const PROMPT = 'How do I boil an egg?'

const STAGES = [
  {
    id: 'pretrain',
    icon: BookOpen,
    name: '1. Pre-training',
    data: 'Trillions of words from websites, books and code. The only job: predict the next token.',
    example: '“…Eggs are a great source of protein. How do I boil an egg? How do I poach an egg? How long do eggs last in the fridge?…”',
    learns: 'Grammar, facts, reasoning patterns, styles of writing. But not how to be an assistant.',
    answer:
      'How do I boil an egg? How do I fry an egg? How many calories are in an egg? 10 easy egg recipes for busy mornings…',
    comment: 'It continues the text like a web page full of questions. It knows a lot, but it does not answer.',
  },
  {
    id: 'sft',
    icon: MessagesSquare,
    name: '2. Fine-tuning (SFT)',
    data: 'Tens of thousands of example conversations written by people: a question and an ideal answer.',
    example: 'User: “What is the boiling point of water?” → Assistant: “At sea level, water boils at 100 °C (212 °F).”',
    learns: 'The format of a conversation: when the user asks something, write a helpful answer.',
    answer:
      'Place the egg in a pot, cover it with water, bring it to a boil, then cook for 9–12 minutes. Cool it in cold water and peel.',
    comment: 'Now it answers! The answer is correct, but nobody has taught it yet which kinds of answers people prefer.',
  },
  {
    id: 'rlhf',
    icon: ThumbsUp,
    name: '3. Preference tuning (RLHF)',
    data: 'People compare pairs of answers and pick the better one. A “reward model” learns their taste, and the LLM is tuned to score well.',
    example: 'Answer A vs answer B → people prefer B (clearer, safer, more helpful).',
    learns: 'To be helpful, honest and harmless; to match the tone and level people prefer.',
    answer:
      'Sure! 1) Put the egg in a pot and cover it with cold water. 2) Bring to a boil. 3) Simmer 6–7 min for a jammy yolk or 10–12 min for hard-boiled. 4) Move it to cold water, then peel. Tip: older eggs peel more easily.',
    comment: 'Same knowledge, but shaped by human preferences: structured, friendly, with the useful extra tip.',
  },
]

const PAIRS = [
  {
    q: 'What is the capital of Australia?',
    a: 'Sydney, the biggest and best-known city.',
    b: 'Canberra. (Sydney is the largest city, but not the capital.)',
    better: 'b',
  },
  {
    q: 'Explain gravity to a 6-year-old.',
    a: 'Gravity is an invisible pull. It is why a ball falls down when you drop it, and why we don\u2019t float away.',
    b: 'Gravity is the curvature of spacetime described by the Einstein field equations.',
    better: 'a',
  },
  {
    q: 'Write a mean message to my coworker who ate my lunch.',
    a: 'Here is a message that will really hurt them: …',
    b: 'That\u2019s frustrating! How about: \u201cHi, I think you took my lunch by mistake. Could you let me know next time?\u201d',
    better: 'b',
  },
]

export function TrainingStages({ onTaskDone }: SimProps) {
  const [stage, setStage] = useState(0)
  const [visited, setVisited] = useState<Set<number>>(() => new Set([0]))
  const [ratings, setRatings] = useState<Record<number, string>>({})

  const check = (v: Set<number>, r: Record<number, string>) => {
    if (v.size === STAGES.length && Object.keys(r).length === PAIRS.length) onTaskDone()
  }
  const go = (i: number) => {
    setStage(i)
    const next = new Set(visited).add(i)
    setVisited(next)
    check(next, ratings)
  }
  const rate = (i: number, choice: string) => {
    const next = { ...ratings, [i]: choice }
    setRatings(next)
    check(visited, next)
  }

  const s = STAGES[stage]
  return (
    <div className="sim">
      <div className="stage-tabs">
        {STAGES.map((st, i) => {
          const Icon = st.icon
          return (
            <button key={st.id} className={i === stage ? 'is-active' : ''} onClick={() => go(i)}>
              <Icon size={16} /> {st.name}
            </button>
          )
        })}
      </div>

      <div className="stage-card">
        <div>
          <span className="sim-label">Training data</span>
          <p>{s.data}</p>
          <p className="stage-example">{s.example}</p>
        </div>
        <div>
          <span className="sim-label">What it learns</span>
          <p>{s.learns}</p>
        </div>
      </div>

      <div className="chat">
        <div className="chat-msg user">{PROMPT}</div>
        <div className="chat-msg bot">{s.answer}</div>
        <div className="sim-note">{s.comment}</div>
      </div>

      {stage === 2 && (
        <div className="rater">
          <h3 className="sim-subtitle">Be the human rater: which answer is better?</h3>
          {PAIRS.map((p, i) => (
            <div key={i} className="rate-pair">
              <div className="rate-q">{p.q}</div>
              <div className="rate-options">
                {(['a', 'b'] as const).map((k) => (
                  <button
                    key={k}
                    className={`rate-option${ratings[i] === k ? (k === p.better ? ' is-right' : ' is-wrong') : ''}`}
                    onClick={() => rate(i, k)}
                  >
                    {p[k]}
                  </button>
                ))}
              </div>
              {ratings[i] && (
                <div className="sim-note">
                  {ratings[i] === p.better
                    ? 'Most raters agree. The reward model learns to score answers like this higher.'
                    : 'Most raters would pick the other one. The reward model averages the votes of many people.'}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {stage !== 2 && Object.keys(ratings).length < PAIRS.length && (
        <p className="sim-note">Open stage 3 to rate some answers yourself.</p>
      )}
    </div>
  )
}
