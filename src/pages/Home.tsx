import { ArrowRight } from 'lucide-react'
import { href } from '../router'
import { homeMeta, useDocumentHead } from '../seo'
import { courses, labs } from '../tracks/catalog'
import { useProgress } from '../tracks/progress'
import { isAvailable, isReady, type ListedTrack } from '../tracks/types'
import { SiteFooter } from '../ui/SiteFooter'
import { useHydrated } from '../ui/useHydrated'

/** Solid card colours for the homepage. Course pages keep each track's own colour. */
const CARD_FILL: Record<string, string> = {
  ai: '#12b5e5',
  llm: '#ed203d',
  gpu: '#fcba28',
  serving: '#0ba95b',
  'first-app': '#f9f4da',
  knowledge: '#f38ba3',
  agents: '#c4b5fd',
  senses: '#fc7428',
  trust: '#ffb086',
  product: '#d2ef4e',
  foundations: '#d6bcfa',
}

const fillOf = (id: string) => CARD_FILL[id] ?? '#fcba28'

function HeroArt() {
  return (
    <svg className="hero-art" viewBox="0 0 460 460" role="img" aria-label="A card with a neuron and a sticker that says will it learn">
      <g fill="#fcba28" stroke="#231f20" strokeWidth="3" strokeLinejoin="round">
        <polygon points="28,78 52,78 40,108 62,108 24,156 40,118 18,118" />
        <polygon points="400,300 424,300 412,330 434,330 396,378 412,340 390,340" />
      </g>
      <g transform="translate(248,48)">
        <rect x="78" y="18" width="42" height="320" rx="12" fill="#0ba95b" stroke="#231f20" strokeWidth="4" />
        <rect x="52" y="28" width="42" height="320" rx="12" fill="#fcba28" stroke="#231f20" strokeWidth="4" />
        <rect x="26" y="38" width="42" height="320" rx="12" fill="#f38ba3" stroke="#231f20" strokeWidth="4" />
        <rect x="0" y="48" width="42" height="320" rx="12" fill="#ed203d" stroke="#231f20" strokeWidth="4" />
      </g>
      <rect x="28" y="36" width="292" height="380" rx="24" fill="#f9f4da" stroke="#231f20" strokeWidth="5" />
      <rect x="48" y="56" width="252" height="214" rx="16" fill="#7b5ea7" stroke="#231f20" strokeWidth="4" />
      <g stroke="#231f20" strokeWidth="4" fill="none" strokeLinecap="round">
        <line x1="92" y1="112" x2="150" y2="163" />
        <line x1="92" y1="163" x2="150" y2="163" />
        <line x1="92" y1="214" x2="150" y2="163" />
        <line x1="198" y1="163" x2="246" y2="163" />
      </g>
      <circle cx="78" cy="112" r="14" fill="#12b5e5" stroke="#231f20" strokeWidth="4" />
      <circle cx="78" cy="163" r="14" fill="#fcba28" stroke="#231f20" strokeWidth="4" />
      <circle cx="78" cy="214" r="14" fill="#f38ba3" stroke="#231f20" strokeWidth="4" />
      <circle cx="174" cy="163" r="36" fill="#12b5e5" stroke="#231f20" strokeWidth="4" />
      <circle cx="162" cy="156" r="4" fill="#231f20" />
      <circle cx="186" cy="156" r="4" fill="#231f20" />
      <path d="M160 172c6 10 22 10 28 0" fill="none" stroke="#231f20" strokeWidth="3" strokeLinecap="round" />
      <circle cx="258" cy="163" r="16" fill="#fcba28" stroke="#231f20" strokeWidth="4" />
      <g transform="translate(108,292) rotate(-7)">
        <rect width="168" height="78" rx="12" fill="#fcba28" stroke="#231f20" strokeWidth="4" />
        <text
          x="84"
          y="32"
          textAnchor="middle"
          fill="#231f20"
          fontFamily="Paytone One, sans-serif"
          fontSize="18"
        >
          WILL IT
        </text>
        <text
          x="84"
          y="58"
          textAnchor="middle"
          fill="#231f20"
          fontFamily="Paytone One, sans-serif"
          fontSize="24"
        >
          LEARN?
        </text>
      </g>
    </svg>
  )
}

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
  const style = { ['--card' as string]: fillOf(track.id) }
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

function Board({ tracks }: { tracks: ListedTrack[] }) {
  return (
    <div className="board" aria-label="Course path">
      {tracks.map((t, i) => {
        const available = isAvailable(t)
        const inner = (
          <>
            <span className="board-num">{String(i + 1).padStart(2, '0')}</span>
            {t.code}
          </>
        )
        const style = { ['--card' as string]: fillOf(t.id) }
        return available ? (
          <a key={t.id} className="board-stop" href={href(t.id)} style={style} title={t.title}>
            {inner}
          </a>
        ) : (
          <div key={t.id} className="board-stop is-soon" style={style} title={`${t.title} (coming soon)`}>
            {inner}
          </div>
        )
      })}
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
        <HeroArt />
      </header>

      <section className="home-section" id="courses">
        <div className="section-head">
          <SectionDoodle kind="courses" />
          <h2 className="section-stamp">Courses</h2>
          <p className="section-lead">Ten tracks, in order. Each one builds on the last.</p>
        </div>
        <Board tracks={courses} />
        <div className="track-grid">
          {courses.map((t, i) => (
            <TrackCard key={t.id} track={t} done={doneIn(t)} index={i + 1} />
          ))}
        </div>
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
