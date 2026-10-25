import { ChevronLeft, ChevronRight, Circle, CircleCheck, FlaskConical, Lightbulb, Target } from 'lucide-react'
import { stepKey, type Lesson } from '../lessons'

interface Props {
  lessons: Lesson[]
  lessonIndex: number
  stepIndex: number
  completed: Set<string>
  onGo: (lesson: number, step: number) => void
  onFinish: () => void
}

export function LessonPanel({ lessons, lessonIndex, stepIndex, completed, onGo, onFinish }: Props) {
  const lesson = lessons[lessonIndex]
  const step = lesson.steps[stepIndex]
  const done = !step.task || completed.has(stepKey(lessonIndex, stepIndex))
  const isLast = lessonIndex === lessons.length - 1 && stepIndex === lesson.steps.length - 1
  const lessonDone = (i: number) => lessons[i].steps.every((s, k) => !s.task || completed.has(stepKey(i, k)))

  const next = () => {
    if (isLast) onFinish()
    else if (stepIndex < lesson.steps.length - 1) onGo(lessonIndex, stepIndex + 1)
    else onGo(lessonIndex + 1, 0)
  }
  const back = () => {
    if (stepIndex > 0) onGo(lessonIndex, stepIndex - 1)
    else if (lessonIndex > 0) onGo(lessonIndex - 1, lessons[lessonIndex - 1].steps.length - 1)
  }

  return (
    <div className="lesson-panel">
      <div className="lesson-progress">
        {lessons.map((l, i) => (
          <button
            key={l.id}
            className={`progress-dot${i === lessonIndex ? ' is-current' : ''}${lessonDone(i) && i < lessonIndex ? ' is-done' : ''}`}
            onClick={() => onGo(i, 0)}
            title={`Lesson ${i + 1}: ${l.title}`}
            aria-label={`Lesson ${i + 1}: ${l.title}`}
          />
        ))}
      </div>
      <div className="lesson-kicker">
        Lesson {lessonIndex + 1} of {lessons.length} · {lesson.title}
      </div>
      <h2 className="lesson-title">{step.title}</h2>
      {lesson.steps.length > 1 && (
        <div className="lesson-steps">
          Step {stepIndex + 1} of {lesson.steps.length}
        </div>
      )}

      <div className="lesson-body">{step.body}</div>

      {step.task && (
        <div className={`task${done ? ' is-done' : ''}`}>
          <div className="task-head">
            {done ? <CircleCheck size={18} /> : <Target size={18} />}
            <span>{done ? 'Done!' : 'Your task'}</span>
          </div>
          <p>{step.task.text}</p>
          {!done && step.task.hint && (
            <p className="task-hint">
              <Lightbulb size={14} /> {step.task.hint}
            </p>
          )}
          {done && <p className="task-done">{step.task.done}</p>}
        </div>
      )}

      <div className="lesson-nav">
        <button onClick={back} disabled={lessonIndex === 0 && stepIndex === 0}>
          <ChevronLeft size={16} /> Back
        </button>
        <button className="primary" onClick={next} disabled={!done}>
          {isLast ? (
            <>
              <FlaskConical size={16} /> Open the free playground
            </>
          ) : (
            <>
              Next <ChevronRight size={16} />
            </>
          )}
        </button>
      </div>
      {!done && (
        <button className="link-btn" onClick={next}>
          Skip this task
        </button>
      )}

      <details className="lesson-index">
        <summary>All lessons</summary>
        <ol>
          {lessons.map((l, i) => (
            <li key={l.id}>
              <button className={i === lessonIndex ? 'is-current' : ''} onClick={() => onGo(i, 0)}>
                {lessonDone(i) && i !== lessonIndex ? <CircleCheck size={14} /> : <Circle size={14} />} {l.title}
              </button>
            </li>
          ))}
        </ol>
      </details>
    </div>
  )
}
