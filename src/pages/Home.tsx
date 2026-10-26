import { ArrowRight, Clock, FlaskConical, GraduationCap } from 'lucide-react'
import { href } from '../router'
import { homeMeta, useDocumentHead } from '../seo'
import { courses, labs } from '../tracks/catalog'
import { useProgress } from '../tracks/progress'
import { isAvailable, type ListedTrack } from '../tracks/types'
import { SiteFooter } from '../ui/SiteFooter'
import { useHydrated } from '../ui/useHydrated'

const PREVIEW = 5

function TrackCard({ track, done }: { track: ListedTrack; done: number }) {
  const available = isAvailable(track)
  const count = track.modules.length
  const body = (
    <>
      <div className="track-card-top">
        <span className="track-badge">{track.code}</span>
        <div>
          <div className="track-number">{track.label}</div>
          <h2>{track.title}</h2>
        </div>
        <span className="track-count">
          {count} {track.section === 'lab' ? 'lessons' : 'modules'}
        </span>
      </div>
      <p className="track-desc">{track.description}</p>
      <div className="track-level">{track.level}</div>
      <ol className="track-modules">
        {track.modules.slice(0, PREVIEW).map((m) => (
          <li key={m.id}>{m.title}</li>
        ))}
        {count > PREVIEW && <li className="more">+ {count - PREVIEW} more</li>}
      </ol>
      <div className="track-card-foot">
        {available ? (
          <>
            <div className="track-progress-bar">
              <div style={{ width: `${(done / count) * 100}%` }} />
            </div>
            <span className="track-done">
              {done} / {count} done
            </span>
            <span className="track-cta">
              {done > 0 ? 'Continue' : track.section === 'lab' ? 'Open lab' : 'Start track'} <ArrowRight size={16} />
            </span>
          </>
        ) : (
          <span className="track-soon">
            <Clock size={14} /> Coming soon
          </span>
        )}
      </div>
    </>
  )
  const style = { ['--track' as string]: track.color }
  return available ? (
    <a className="track-card" href={href(track.id)} style={style}>
      {body}
    </a>
  ) : (
    <div className="track-card is-soon" style={style}>
      {body}
    </div>
  )
}

export function Home() {
  useDocumentHead(homeMeta())
  const progress = useProgress()
  const hydrated = useHydrated()
  const doneIn = (t: ListedTrack) => {
    if (t.modulesDone) return hydrated ? t.modulesDone() : 0
    return (progress[t.id] ?? []).length
  }
  const first = courses[0]

  return (
    <div className="home">
      <header className="hero">
        <div className="hero-kicker">An interactive course, from zero to advanced</div>
        <h1>
          From a single neuron <br />
          to the GPUs and LLMs behind modern AI
        </h1>
        <p>
          No math background needed. Every idea comes with something to play with: race a CPU against a GPU, watch
          attention pick the words that matter, work out how much hardware a real model needs, and train your own neural
          network in the lab.
        </p>
        <div className="hero-actions">
          <a className="btn primary big" href={href(`${first.id}/${first.modules[0].id}`)}>
            Start {first.label} <ArrowRight size={18} />
          </a>
          <a className="btn big" href={href(labs[0].id)}>
            <FlaskConical size={18} /> Open the {labs[0].title} lab
          </a>
        </div>
      </header>

      <section className="home-section" id="courses">
        <h2 className="home-section-title">
          <GraduationCap size={20} /> Courses
        </h2>
        <p className="home-section-desc">A step-by-step path. Each track builds on the ones before it.</p>
        <div className="path">
          {courses.map((t, i) => (
            <div key={t.id} className="path-step" style={{ ['--track' as string]: t.color }}>
              <span className="path-dot">{t.code}</span>
              <span className="path-name">{t.title}</span>
              {i < courses.length - 1 && <span className="path-line" />}
            </div>
          ))}
        </div>
        <div className="track-grid">
          {courses.map((t) => (
            <TrackCard key={t.id} track={t} done={doneIn(t)} />
          ))}
        </div>
      </section>

      <section className="home-section" id="lab">
        <h2 className="home-section-title">
          <FlaskConical size={20} /> Lab
        </h2>
        <p className="home-section-desc">
          Hands-on workshops where you build and train things yourself. Do them any time: before the courses as a warm-up,
          or alongside them.
        </p>
        <div className="track-grid">
          {labs.map((t) => (
            <TrackCard key={t.id} track={t} done={doneIn(t)} />
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
