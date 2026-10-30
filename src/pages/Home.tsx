import { ArrowRight } from 'lucide-react'
import { CoursePath } from './CoursePath'
import { HeroDeck } from './HeroDeck'
import { href } from '../router'
import { homeMeta, useDocumentHead } from '../seo'
import { cardFill } from '../tracks/colors'
import { courses, labs } from '../tracks/catalog'
import { useProgress } from '../tracks/progress'
import { isAvailable, isReady, type ListedTrack } from '../tracks/types'
import { SiteFooter } from '../ui/SiteFooter'
import { useHydrated } from '../ui/useHydrated'

function SectionDoodle({ kind }: { kind: 'courses' | 'lab' }) {
  return (
    <svg className="section-doodle" viewBox="0 0 96 64" aria-hidden="true">
      <g fill="#f9f4da" stroke="#231f20" strokeWidth="3" strokeLinejoin="round">
        <path d="M6 34c10-16 18-16 24 0-8 8-16 8-24 0z" />
        <path d="M90 34c-10-16-18-16-24 0 8 8 16 8 24 0z" />
      </g>
      <rect
        x="34"
        y="12"
        width="28"
        height="40"
        rx="7"
        fill={kind === 'courses' ? '#0ba95b' : '#c4b5fd'}
        stroke="#231f20"
        strokeWidth="3"
      />
      <text x="48" y="38" textAnchor="middle" fill="#231f20" fontFamily="Paytone One, sans-serif" fontSize="14">
        {kind === 'courses' ? 'AI' : 'NN'}
      </text>
    </svg>
  )
}

function TrackCard({ track, done, index }: { track: ListedTrack; done: number; index?: number }) {
  const available = isAvailable(track)
  const published = track.modules.filter(isReady)
  const listed = track.modules.length
  const count = available ? published.length : listed
  const unit = track.section === 'lab' ? 'lessons' : 'modules'
  const body = (
    <>
      <div className="track-poster">
        {index != null && <span className="track-poster-index">{String(index).padStart(2, '0')}</span>}
        <span className="track-poster-code">{track.code}</span>
        {!available && <span className="track-stamp">Soon</span>}
      </div>
      <h2>{track.title}</h2>
      <div className="track-level">
        {track.label} · {track.level} · {listed} {unit}
      </div>
      <p className="track-desc">{track.description}</p>
      <div className="track-card-foot">
        {available ? (
          <>
            <div className="track-progress-bar">
              <div style={{ width: `${count ? (done / count) * 100 : 0}%` }} />
            </div>
            <span className="track-done">
              {done} / {count} done
            </span>
            <span className="track-cta">
              {done > 0 ? 'Continue' : track.section === 'lab' ? 'Open' : 'Start'} <ArrowRight size={15} />
            </span>
          </>
        ) : (
          <span className="track-done">{listed} {unit} planned</span>
        )}
      </div>
    </>
  )
  const style = { ['--card' as string]: cardFill(track.id) }
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
  const firstLesson = first.modules.find(isReady) ?? first.modules[0]

  return (
    <div className="home">
      <header className="hero">
        <div>
          <h1>
            From one neuron
            <span>to modern AI</span>
          </h1>
          <p>
            Interactive courses in plain language. Race a CPU against a GPU, watch attention pick the words that matter,
            and train a network of your own. No math background needed. Every idea has something to{' '}
            <em className="ink-yellow">play</em> with.
          </p>
          <div className="hero-actions">
            <a className="btn primary big" href={href(`${first.id}/${firstLesson.id}`)}>
              Start {first.label}
            </a>
            <a className="btn big" href={href(labs[0].id)}>
              Open the lab
            </a>
          </div>
        </div>
        <HeroDeck />
      </header>

      <section className="home-section" id="courses">
        <div className="section-head">
          <SectionDoodle kind="courses" />
          <h2 className="section-stamp">Adventures</h2>
          <p className="section-lead">Nine tracks, in order. Each one builds on the last.</p>
        </div>
        <CoursePath tracks={courses} doneById={Object.fromEntries(courses.map((t) => [t.id, doneIn(t)]))} />
      </section>

      <section className="home-section" id="lab">
        <div className="section-head">
          <SectionDoodle kind="lab" />
          <h2 className="section-stamp" style={{ ['--stamp' as string]: '#c4b5fd' }}>
            Lab
          </h2>
          <p className="section-lead">
            A hands-on workshop. Warm up here, or come back any time you want to train a network yourself.
          </p>
        </div>
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
