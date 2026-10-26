import type { CSSProperties } from 'react'
import { courses } from '../tracks/catalog'
import { useProgress } from '../tracks/progress'
import { isAvailable } from '../tracks/types'

const available = courses.filter(isAvailable)
const total = available.reduce((n, t) => n + t.modules.length, 0)

/** Slim bar along the bottom of the screen: share of all available course modules finished. */
export function CourseProgressBar({ color }: { color: string }) {
  const progress = useProgress()
  const done = available.reduce((n, t) => {
    const finished = new Set(progress[t.id] ?? [])
    return n + t.modules.filter((m) => finished.has(m.id)).length
  }, 0)
  const percent = total ? Math.round((done / total) * 100) : 0
  const label = `Course progress: ${done} of ${total} modules done (${percent}%)`

  return (
    <div
      className="course-progress"
      role="progressbar"
      aria-label="Course progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      aria-valuetext={label}
      title={label}
      style={{ '--bar': color } as CSSProperties}
    >
      <div className="course-progress-fill" style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
    </div>
  )
}
