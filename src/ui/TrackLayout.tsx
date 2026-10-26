import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, BookOpen, Circle, CircleCheck, FlaskConical, Lightbulb, Target, Trophy } from 'lucide-react'
import { href } from '../router'
import type { TrackMeta } from '../tracks/catalog'
import { loadProgress, saveModuleDone } from '../tracks/progress'
import type { ModuleContent } from '../tracks/types'
import { Quiz } from './Quiz'

interface Props {
  track: TrackMeta
  content: Record<string, ModuleContent>
  moduleId: string | undefined
}

export function TrackLayout({ track, content, moduleId }: Props) {
  const index = Math.max(0, track.modules.findIndex((m) => m.id === moduleId))
  const meta = track.modules[index]
  const mod = content[meta.id]
  const [done, setDone] = useState(() => new Set(loadProgress()[track.id] ?? []))
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
  const markModule = () => setDone(new Set(saveModuleDone(track.id, meta.id)[track.id]))

  const prev = track.modules[index - 1]
  const next = track.modules[index + 1]
  const Sim = mod.sim
  const taskDone = tasksDone.has(meta.id)

  return (
    <div className="app track-app" style={{ ['--track' as string]: track.color }}>
      <aside className="sidebar">
        <a className="back-link" href={href('')}>
          <ArrowLeft size={14} /> All tracks
        </a>
        <div className="brand">
          <span className="track-code">{track.code}</span>
          {track.title}
        </div>
        <div className="track-progress">
          <div className="track-progress-bar">
            <div style={{ width: `${(done.size / track.modules.length) * 100}%` }} />
          </div>
          <span>
            {done.size} of {track.modules.length} modules done
          </span>
        </div>
        <nav className="module-list">
          {track.modules.map((m, i) => (
            <a key={m.id} href={href(`${track.id}/${m.id}`)} className={i === index ? 'is-current' : ''}>
              {done.has(m.id) ? <CircleCheck size={16} className="ok" /> : <Circle size={16} />}
              <span className="module-num">{i + 1}</span>
              <span>{m.title}</span>
            </a>
          ))}
        </nav>
        <p className="hint">
          A module counts as done when you answer all of its check questions correctly. Your progress is saved in this
          browser.
        </p>
      </aside>

      <main className="module-main" ref={main}>
        <article className="module" key={meta.id}>
          <header className="module-head">
            <div className="module-kicker">
              Track {track.number} · Module {index + 1} of {track.modules.length}
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
            ) : (
              <a className="btn primary" href={href('')}>
                Back to all tracks <ArrowRight size={16} />
              </a>
            )}
          </nav>
        </article>
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
