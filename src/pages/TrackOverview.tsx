import { ArrowRight, Circle, CircleCheck, ListOrdered } from 'lucide-react'
import { href } from '../router'
import { trackPageMeta, useDocumentHead } from '../seo'
import { useProgress } from '../tracks/progress'
import { isReady, type ListedTrack, type TrackContent } from '../tracks/types'
import { SiteFooter } from '../ui/SiteFooter'

/** The landing page of a course: what it covers and where to start. */
export function TrackOverview({ track, content }: { track: ListedTrack; content: TrackContent }) {
  useDocumentHead(trackPageMeta(track, content))
  const done = new Set(useProgress()[track.id] ?? [])
  const ready = track.modules.filter(isReady)
  const resume = ready.find((m) => !done.has(m.id))
  const start = resume ?? ready[0]
  const cta = !resume ? 'Review the course' : done.size > 0 ? `Continue: ${resume.title}` : 'Start the course'

  return (
    <div className="home overview" style={{ ['--track' as string]: track.color }}>
      <header className="hero">
        <div className="hero-kicker">
          {track.label} · {track.level} · {track.modules.length} modules
        </div>
        <h1>{track.title}</h1>
        <p>{track.description}</p>
        <div className="hero-actions">
          <a className="btn primary big" href={href(`${track.id}/${start.id}`)}>
            {cta} <ArrowRight size={18} />
          </a>
        </div>
      </header>

      <section className="home-section overview-section">
        <h2 className="home-section-title">
          <ListOrdered size={20} /> What you will learn
        </h2>
        <p className="home-section-desc">
          Every module explains one idea in plain words, lets you try it in an interactive simulation, then checks your
          understanding with a short quiz.
        </p>
        <ol className="overview-modules">
          {track.modules.map((m, i) => {
            const playable = isReady(m)
            const body = (
              <>
                <span className="overview-num">{i + 1}</span>
                <span className="overview-text">
                  <h3>{m.title}</h3>
                  <p>{playable ? content[m.id]?.goal : 'Coming soon'}</p>
                </span>
                {done.has(m.id) ? <CircleCheck size={18} className="ok" /> : <Circle size={18} />}
              </>
            )
            return (
              <li key={m.id}>
                {playable ? (
                  <a href={href(`${track.id}/${m.id}`)}>{body}</a>
                ) : (
                  <div className="is-soon">{body}</div>
                )}
              </li>
            )
          })}
        </ol>
      </section>

      <SiteFooter />
    </div>
  )
}
