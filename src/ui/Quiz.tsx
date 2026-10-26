import { useState } from 'react'
import { CircleCheck, CircleX } from 'lucide-react'
import type { QuizQuestion } from '../tracks/types'

interface Props {
  questions: QuizQuestion[]
  onComplete: () => void
}

/** Multiple-choice check. Wrong answers can be retried; explanations show after each pick. */
export function Quiz({ questions, onComplete }: Props) {
  const [picked, setPicked] = useState<(number | null)[]>(() => questions.map(() => null))

  const pick = (qi: number, oi: number) => {
    const next = picked.map((p, k) => (k === qi ? oi : p))
    setPicked(next)
    if (next.every((p, k) => p === questions[k].answer)) onComplete()
  }

  return (
    <div className="quiz">
      {questions.map((q, qi) => {
        const choice = picked[qi]
        const right = choice === q.answer
        return (
          <div className="quiz-q" key={qi}>
            <div className="quiz-question">
              <span className="quiz-num">{qi + 1}</span> {q.question}
            </div>
            <div className="quiz-options">
              {q.options.map((o, oi) => (
                <button
                  key={oi}
                  className={`quiz-option${choice === oi ? (right ? ' is-right' : ' is-wrong') : ''}`}
                  onClick={() => pick(qi, oi)}
                  disabled={right}
                >
                  {o}
                </button>
              ))}
            </div>
            {choice !== null && (
              <div className={`quiz-feedback ${right ? 'right' : 'wrong'}`}>
                {right ? <CircleCheck size={16} /> : <CircleX size={16} />}
                <span>{right ? q.explain : 'Not quite. Have another look and try again.'}</span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
