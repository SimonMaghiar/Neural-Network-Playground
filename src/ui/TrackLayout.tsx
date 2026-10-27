import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, BookOpen, CircleCheck, FlaskConical, Lightbulb, Target, Trophy } from 'lucide-react'
import { href } from '../router'
import { modulePageMeta, useDocumentHead } from '../seo'
import { courses } from '../tracks/catalog'
import { saveModuleDone, useProgress } from '../tracks/progress'
import type { ListedTrack, TrackContent } from '../tracks/types'
import { CourseNav } from './CourseNav'
import { Quiz } from './Quiz'
import { SiteFooter } from './SiteFooter'

interface Props {
  track: ListedTrack
  content: TrackContent
  moduleId: string | undefined
}

export function TrackLayout({ track, content, moduleId }: Props) {
  const index = Math.max(0, track.modules.findIndex((m) => m.id === moduleId))
  const meta = track.modules[index]
  const mod = content[meta.id]
  const progress = useProgress()
  const done = new Set(progress[track.id] ?? [])
  useDocumentHead(modulePageMeta(track, index, mod))
  const [tasksDone, setTasksDone] = useState<Set<string>>(() => new Set())
  const main = useRef<HTMLElement>(null)
  const simPanel = useRef<HTMLElement>(null)

  useEffect(() => {
    main.current?.scrollTo(0, 0)
    simPanel.current?.scrollTo(0, 0)
  }, [meta.id])

  const markTask = useCallback(
    () => setTasksDone((prev) => (prev.has(meta.id) ? prev : new Set(prev).add(meta.id))),
    [meta.id],
  )
  const markModule = () => saveModuleDone(track.id, meta.id)

  const prev = track.modules[index - 1]
  const next = track.modules[index + 1]
  const nextTrack = courses.slice(courses.findIndex((c) => c.id === track.id) + 1).find((c) => c.loadContent)
  const Sim = mod.sim
  const taskDone = tasksDone.has(meta.id)

  return (
    <div className="app track-app" style={{ ['--track' as string]: track.color }}>
      <aside className="sidebar course-sidebar">
        <CourseNav trackId={track.id} moduleId={meta.id} progress={progress} />
        <p className="nav-note">Finish every check question to mark a module done. Progress stays in this browser.</p>
      </aside>

      <main className="module-main" ref={main}>
        <article className="module" key={meta.id}>
          <header className="module-head">
            <div className="module-kicker">
              <a href={href(track.id)}>
                {track.label}: {track.title}
              </a>{' '}
              · Module {index + 1} of {track.modules.length}
            </div>
            <h1>{meta.title}</h1>
            <p className="module-goal">
              <Target size={16} /> {mod.goal}
            </p>
          </header>

          <section className="module-intro">{mod.intro}</section>

          <p className="sim-pointer">
            <FlaskConical size={16} /> Now try it yourself in the simulation panel.
          </p>

          <section className="takeaways">
            <h2>
              <Lightbulb size={18} /> Key takeaways
            </h2>
            <ul>
              {mod.takeaways.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="section-title">
              <Trophy size={18} /> Check your understanding
            </h2>
            <Quiz questions={mod.quiz} onComplete={markModule} />
            {done.has(meta.id) && <div className="module-complete">Module complete! Great work.</div>}
          </section>

          <details className="deep-dive">
            <summary>
              <BookOpen size={16} /> Go deeper (more technical)
            </summary>
            <div className="deep-dive-body">{mod.deepDive}</div>
          </details>

          <nav className="module-nav">
            {prev ? (
              <a className="btn" href={href(`${track.id}/${prev.id}`)}>
                <ArrowLeft size={16} /> {prev.title}
              </a>
            ) : (
              <span />
            )}
            {next ? (
              <a className="btn primary" href={href(`${track.id}/${next.id}`)}>
                Next: {next.title} <ArrowRight size={16} />
              </a>
            ) : nextTrack ? (
              <a className="btn primary" href={href(`${nextTrack.id}/${nextTrack.modules[0].id}`)}>
                Next course: {nextTrack.title} <ArrowRight size={16} />
              </a>
            ) : (
              <a className="btn primary" href={href('')}>
                Back to the home page <ArrowRight size={16} />
              </a>
            )}
          </nav>
        </article>
        <SiteFooter compact />
      </main>

      <aside className="sim-panel" ref={simPanel}>
        <section className="sim-card" key={meta.id}>
          <div className="sim-card-head">
            <FlaskConical size={16} /> Try it yourself · {meta.title}
          </div>
          <div className={`task${taskDone ? ' is-done' : ''}`}>
            <div className="task-head">
              {taskDone ? <CircleCheck size={18} /> : <Target size={18} />}
              <span>{taskDone ? 'Done!' : 'Your task'}</span>
            </div>
            <p>{mod.task.text}</p>
            {taskDone && <p className="task-done">{mod.task.done}</p>}
          </div>
          <Sim onTaskDone={markTask} />
        </section>
      </aside>
    </div>
  )
}
