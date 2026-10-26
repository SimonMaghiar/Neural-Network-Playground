import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Circle, CircleCheck, Clock } from 'lucide-react'
import { href } from '../router'
import { courses } from '../tracks/catalog'
import { isAvailable } from '../tracks/types'

interface Props {
  trackId: string
  moduleId: string
  /** Finished module ids per track. */
  progress: Record<string, string[]>
}

/** Every course and its modules, so learners always see where they are in the whole path. */
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

  return (
    <nav className="course-nav" ref={nav}>
      {courses.map((t) => {
        const available = isAvailable(t)
        const done = new Set(progress[t.id] ?? [])
        const expanded = open.has(t.id)
        const current = t.id === trackId
        return (
          <section
            key={t.id}
            className={`nav-track${current ? ' is-current' : ''}${available ? '' : ' is-soon'}`}
            style={{ ['--track' as string]: t.color }}
          >
            <button className="nav-track-head" onClick={() => toggle(t.id)} aria-expanded={expanded}>
              <span className="nav-track-code">{t.code}</span>
              <span className="nav-track-text">
                <span className="nav-track-label">
                  {t.label}
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
                <span className="nav-track-title">{t.title}</span>
              </span>
              <ChevronDown size={16} className={`nav-chevron${expanded ? ' is-open' : ''}`} />
            </button>
            {available && (
              <div className="nav-track-bar">
                <div style={{ width: `${(done.size / t.modules.length) * 100}%` }} />
              </div>
            )}
            {expanded && (
              <ol className="nav-modules">
                {t.modules.map((m, i) => {
                  const inner = (
                    <>
                      {done.has(m.id) ? <CircleCheck size={15} className="ok" /> : <Circle size={15} />}
                      <span className="module-num">{i + 1}</span>
                      <span>{m.title}</span>
                    </>
                  )
                  return (
                    <li key={m.id}>
                      {available ? (
                        <a
                          href={href(`${t.id}/${m.id}`)}
                          className={current && m.id === moduleId ? 'is-current' : ''}
                          aria-current={current && m.id === moduleId ? 'page' : undefined}
                        >
                          {inner}
                        </a>
                      ) : (
                        <span className="nav-module-soon">{inner}</span>
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
