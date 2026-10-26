import { ArrowRight, Clock, FlaskConical } from 'lucide-react'
import { lessons } from '../lessons'
import { href } from '../router'
import { tracks, type TrackMeta } from '../tracks/catalog'
import { foundationsLessonsDone } from '../tracks/foundationsProgress'
import { loadProgress } from '../tracks/progress'

const PREVIEW = 5

function TrackCard({ track, modules, done }: { track: TrackMeta; modules: string[]; done: number }) {
  const startPath = track.id === 'foundations' ? 'foundations' : `${track.id}/${track.modules[0]?.id ?? ''}`
  const body = (
    <>
      <div className="track-card-top">
        <span className="track-badge">{track.code}</span>
        <div>
          <div className="track-number">Track {track.number}</div>
          <h2>{track.title}</h2>
        </div>
        <span className="track-count">{modules.length} modules</span>
      </div>
      <p className="track-desc">{track.description}</p>
      <div className="track-level">{track.level}</div>
      <ol className="track-modules">
        {modules.slice(0, PREVIEW).map((m) => (
          <li key={m}>{m}</li>
        ))}
        {modules.length > PREVIEW && <li className="more">+ {modules.length - PREVIEW} more</li>}
      </ol>
      <div className="track-card-foot">
        {track.available ? (
          <>
            <div className="track-progress-bar">
              <div style={{ width: `${(done / modules.length) * 100}%` }} />
            </div>
            <span className="track-done">
              {done} / {modules.length} done
            </span>
            <span className="track-cta">
              {done > 0 ? 'Continue' : 'Start track'} <ArrowRight size={16} />
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
  return track.available ? (
    <a className="track-card" href={href(startPath)} style={style}>
      {body}
    </a>
  ) : (
    <div className="track-card is-soon" style={style}>
      {body}
    </div>
  )
}

export function Home() {
  const progress = loadProgress()
  const foundationsDone = foundationsLessonsDone()

  return (
    <div className="home">
      <header className="hero">
        <div className="hero-kicker">An interactive course, from zero to advanced</div>
        <h1>
          From a single neuron <br />
          to the GPUs and LLMs behind modern AI
        </h1>
        <p>
          No math background needed. Every idea comes with something to play with: train a neuron, race a CPU against a
          GPU, find the memory bottleneck, and work out how much hardware a real model needs.
        </p>
        <div className="hero-actions">
          <a className="btn primary big" href={href('foundations')}>
            Start from the beginning <ArrowRight size={18} />
          </a>
          <a className="btn big" href={href('playground')}>
            <FlaskConical size={18} /> Open the free playground
          </a>
        </div>
      </header>

      <section className="path">
        {tracks.map((t, i) => (
          <div key={t.id} className="path-step" style={{ ['--track' as string]: t.color }}>
            <span className="path-dot">{t.code}</span>
            <span className="path-name">{t.title}</span>
            {i < tracks.length - 1 && <span className="path-line" />}
          </div>
        ))}
      </section>

      <section className="track-grid">
        {tracks.map((t) => {
          const isFoundations = t.id === 'foundations'
          const modules = isFoundations ? lessons.map((l) => l.title) : t.modules.map((m) => m.title)
          const done = isFoundations ? foundationsDone : (progress[t.id] ?? []).length
          return <TrackCard key={t.id} track={t} modules={modules} done={done} />
        })}
      </section>

      <footer className="home-foot">
        © {new Date().getFullYear()} smbondrnet. All rights reserved. Spec figures are approximate and for learning
        purposes.
      </footer>
    </div>
  )
}
