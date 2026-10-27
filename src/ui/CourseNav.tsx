import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Check, ChevronDown, Clock } from 'lucide-react'
import { href } from '../router'
import { courses } from '../tracks/catalog'
import { isAvailable } from '../tracks/types'

interface Props {
  trackId: string
  moduleId: string
  /** Finished module ids per track. */
  progress: Record<string, string[]>
}

const availableCourses = courses.filter(isAvailable)
const totalModules = availableCourses.reduce((n, t) => n + t.modules.length, 0)

/** Every course and its modules, drawn as a path so learners can see where they are. */
export function CourseNav({ trackId, moduleId, progress }: Props) {
  const [open, setOpen] = useState(() => new Set([trackId]))
  const nav = useRef<HTMLElement>(null)

  useEffect(() => {
    nav.current?.querySelector('[aria-current="page"]')?.scrollIntoView({ block: 'nearest' })
  }, [moduleId])

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const doneModules = availableCourses.reduce((n, t) => {
    const finished = new Set(progress[t.id] ?? [])
    return n + t.modules.filter((m) => finished.has(m.id)).length
  }, 0)

  return (
    <nav className="course-nav" ref={nav} aria-label="Courses">
      <div className="path-head">
        <span className="path-head-label">Courses</span>
        <span className="path-head-count">
          {doneModules}/{totalModules}
        </span>
      </div>
      <div className="path-meter" aria-hidden="true">
        {availableCourses.map((t) => {
          const finished = new Set(progress[t.id] ?? [])
          const count = t.modules.filter((m) => finished.has(m.id)).length
          return (
            <span key={t.id} style={{ flexGrow: t.modules.length, ['--track' as string]: t.color } as CSSProperties}>
              <i style={{ width: `${(count / t.modules.length) * 100}%` }} />
            </span>
          )
        })}
      </div>

      {courses.map((t) => {
        const available = isAvailable(t)
        const done = new Set(progress[t.id] ?? [])
        const expanded = open.has(t.id)
        const current = t.id === trackId
        const share = available ? (done.size / t.modules.length) * 100 : 0
        return (
          <section
            key={t.id}
            className={`nav-track${current ? ' is-current' : ''}${available ? '' : ' is-soon'}`}
            style={{ ['--track' as string]: t.color, ['--p' as string]: share } as CSSProperties}
          >
            <button className="nav-track-head" onClick={() => toggle(t.id)} aria-expanded={expanded}>
              <span className="nav-track-code">{t.code}</span>
              <span className="nav-track-text">
                <span className="nav-track-title">{t.title}</span>
                <span className="nav-track-meta">
                  <span className="nav-track-label">{t.label}</span>
                  {available ? (
                    <span className="nav-track-count">
                      {done.size}/{t.modules.length}
                    </span>
                  ) : (
                    <span className="nav-soon">
                      <Clock size={11} /> soon
                    </span>
                  )}
                </span>
              </span>
              <ChevronDown size={15} className={`nav-chevron${expanded ? ' is-open' : ''}`} />
            </button>
            {expanded && (
              <ol className="nav-path">
                {t.modules.map((m, i) => {
                  const finished = done.has(m.id)
                  const here = current && m.id === moduleId
                  const node = (
                    <>
                      <span className={`nav-node${finished ? ' is-done' : ''}${here ? ' is-current' : ''}`}>
                        {finished ? <Check size={13} strokeWidth={2.75} /> : i + 1}
                      </span>
                      <span className="nav-step">{m.title}</span>
                    </>
                  )
                  return (
                    <li key={m.id} className={finished ? 'is-done' : ''}>
                      {available ? (
                        <a
                          href={href(`${t.id}/${m.id}`)}
                          className={`${here ? 'is-current' : ''}${finished ? ' is-done' : ''}`}
                          aria-current={here ? 'page' : undefined}
                          aria-label={`${i + 1}. ${m.title}${finished ? ', done' : ''}`}
                        >
                          {node}
                        </a>
                      ) : (
                        <span className="nav-module-soon">{node}</span>
                      )}
                    </li>
                  )
                })}
              </ol>
            )}
          </section>
        )
      })}
    </nav>
  )
}
