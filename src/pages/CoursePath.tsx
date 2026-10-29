import { Fragment, type ReactNode } from 'react'
import { ArrowRight } from 'lucide-react'
import { href } from '../router'
import { cardFill } from '../tracks/colors'
import { isAvailable, isReady, type ListedTrack } from '../tracks/types'

type IconName =
  | 'neuron'
  | 'sliders'
  | 'spark'
  | 'stack'
  | 'target'
  | 'tokens'
  | 'eye'
  | 'chat'
  | 'grid'
  | 'chip'
  | 'coin'
  | 'plug'
  | 'key'
  | 'search'
  | 'wrench'
  | 'loop'
  | 'image'
  | 'wave'
  | 'shield'
  | 'rocket'
  | 'check'

interface Mark {
  id: string
  label: string
  icon: IconName
  display?: boolean
}

/** Decorative squares for one track. Not the lesson list. */
const MARKS: Record<string, Mark[]> = {
  ai: [
    { id: 'neuron', label: 'Neuron', icon: 'neuron', display: true },
    { id: 'weights', label: 'Weights', icon: 'sliders' },
    { id: 'learn', label: 'Learn', icon: 'spark', display: true },
    { id: 'layers', label: 'Layers', icon: 'stack' },
    { id: 'data', label: 'Data', icon: 'tokens', display: true },
    { id: 'mistake', label: 'Mistake', icon: 'target' },
  ],
  llm: [
    { id: 'token', label: 'Token', icon: 'tokens', display: true },
    { id: 'meaning', label: 'Meaning', icon: 'spark' },
    { id: 'attention', label: 'Attention', icon: 'eye', display: true },
    { id: 'next', label: 'Next word', icon: 'chat' },
    { id: 'context', label: 'Context', icon: 'stack', display: true },
    { id: 'sample', label: 'Sample', icon: 'sliders' },
  ],
  gpu: [
    { id: 'cores', label: 'Cores', icon: 'grid', display: true },
    { id: 'memory', label: 'Memory', icon: 'chip' },
    { id: 'matmul', label: 'Matmul', icon: 'grid', display: true },
    { id: 'precision', label: 'Precision', icon: 'sliders' },
    { id: 'tile', label: 'Tiling', icon: 'stack', display: true },
    { id: 'vram', label: 'VRAM', icon: 'chip' },
  ],
  serving: [
    { id: 'send', label: 'Send', icon: 'chat', display: true },
    { id: 'batch', label: 'Batch', icon: 'stack' },
    { id: 'queue', label: 'Queue', icon: 'tokens', display: true },
    { id: 'cache', label: 'Cache', icon: 'chip' },
    { id: 'latency', label: 'Latency', icon: 'wave', display: true },
    { id: 'cost', label: 'Cost', icon: 'coin' },
  ],
  'first-app': [
    { id: 'api', label: 'API', icon: 'plug', display: true },
    { id: 'prompt', label: 'Prompt', icon: 'chat' },
    { id: 'model', label: 'Model', icon: 'chip', display: true },
    { id: 'stream', label: 'Stream', icon: 'wave' },
    { id: 'json', label: 'JSON', icon: 'stack', display: true },
    { id: 'bot', label: 'Chatbot', icon: 'neuron' },
  ],
  knowledge: [
    { id: 'search', label: 'Search', icon: 'search', display: true },
    { id: 'embed', label: 'Embed', icon: 'spark' },
    { id: 'chunk', label: 'Chunk', icon: 'stack', display: true },
    { id: 'docs', label: 'Docs', icon: 'stack' },
    { id: 'vector', label: 'Vector', icon: 'target', display: true },
    { id: 'rag', label: 'RAG', icon: 'search' },
  ],
  agents: [
    { id: 'tool', label: 'Tools', icon: 'wrench', display: true },
    { id: 'loop', label: 'Loop', icon: 'loop' },
    { id: 'act', label: 'Act', icon: 'spark', display: true },
    { id: 'memory', label: 'Memory', icon: 'chip' },
    { id: 'mcp', label: 'MCP', icon: 'plug', display: true },
    { id: 'guard', label: 'Control', icon: 'shield' },
  ],
  senses: [
    { id: 'see', label: 'See', icon: 'eye', display: true },
    { id: 'image', label: 'Image', icon: 'image' },
    { id: 'voice', label: 'Voice', icon: 'wave', display: true },
    { id: 'pixels', label: 'Pixels', icon: 'grid' },
    { id: 'video', label: 'Video', icon: 'image', display: true },
    { id: 'noise', label: 'Noise', icon: 'spark' },
  ],
  trust: [
    { id: 'test', label: 'Test', icon: 'check', display: true },
    { id: 'wrong', label: 'Wrong', icon: 'target' },
    { id: 'guard', label: 'Guard', icon: 'shield', display: true },
    { id: 'bias', label: 'Bias', icon: 'sliders' },
    { id: 'safe', label: 'Private', icon: 'key', display: true },
    { id: 'watch', label: 'Watch', icon: 'eye' },
  ],
  product: [
    { id: 'ship', label: 'Ship', icon: 'rocket', display: true },
    { id: 'key', label: 'Keys', icon: 'key' },
    { id: 'cost', label: 'Cost', icon: 'coin', display: true },
    { id: 'deploy', label: 'Deploy', icon: 'rocket' },
    { id: 'logs', label: 'Logs', icon: 'stack', display: true },
    { id: 'retry', label: 'Retry', icon: 'loop' },
  ],
}

function Icon({ name }: { name: IconName }) {
  const stroke = '#231f20'
  const fill = 'var(--card)'
  return (
    <svg className="road-icon" viewBox="0 0 48 48" aria-hidden="true">
      {name === 'neuron' && (
        <>
          <circle cx="12" cy="14" r="5" fill={fill} stroke={stroke} strokeWidth="2.5" />
          <circle cx="36" cy="12" r="5" fill={fill} stroke={stroke} strokeWidth="2.5" />
          <circle cx="14" cy="36" r="5" fill={fill} stroke={stroke} strokeWidth="2.5" />
          <path d="M16 16 L20 22 M32 15 L28 21 M18 33 L22 28" fill="none" stroke={stroke} strokeWidth="2.5" />
          <circle cx="24" cy="24" r="8" fill={fill} stroke={stroke} strokeWidth="2.5" />
          <circle cx="21" cy="23" r="1.2" fill={stroke} />
          <circle cx="27" cy="23" r="1.2" fill={stroke} />
          <path d="M21 27c1.4 1.4 4.6 1.4 6 0" fill="none" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
        </>
      )}
      {name === 'sliders' && (
        <>
          <path d="M10 16h28 M10 24h28 M10 32h28" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="18" cy="16" r="4" fill={fill} stroke={stroke} strokeWidth="2.5" />
          <circle cx="30" cy="24" r="4" fill={fill} stroke={stroke} strokeWidth="2.5" />
          <circle cx="16" cy="32" r="4" fill={fill} stroke={stroke} strokeWidth="2.5" />
        </>
      )}
      {name === 'spark' && (
        <path
          d="M24 6l3 12 12 3-12 3-3 12-3-12-12-3 12-3z"
          fill={fill}
          stroke={stroke}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      )}
      {name === 'stack' && (
        <>
          <rect x="10" y="10" width="22" height="8" rx="2" fill={fill} stroke={stroke} strokeWidth="2.5" />
          <rect x="14" y="20" width="22" height="8" rx="2" fill="#f9f4da" stroke={stroke} strokeWidth="2.5" />
          <rect x="12" y="30" width="22" height="8" rx="2" fill={fill} stroke={stroke} strokeWidth="2.5" />
        </>
      )}
      {name === 'target' && (
        <>
          <circle cx="24" cy="24" r="14" fill="none" stroke={stroke} strokeWidth="2.5" />
          <circle cx="24" cy="24" r="8" fill={fill} stroke={stroke} strokeWidth="2.5" />
          <circle cx="24" cy="24" r="2.5" fill={stroke} />
        </>
      )}
      {name === 'tokens' && (
        <>
          <rect x="6" y="16" width="12" height="16" rx="3" fill={fill} stroke={stroke} strokeWidth="2.5" />
          <rect x="18" y="16" width="12" height="16" rx="3" fill="#f9f4da" stroke={stroke} strokeWidth="2.5" />
          <rect x="30" y="16" width="12" height="16" rx="3" fill={fill} stroke={stroke} strokeWidth="2.5" />
        </>
      )}
      {name === 'eye' && (
        <>
          <path d="M6 24c6-10 30-10 36 0-6 10-30 10-36 0z" fill="#f9f4da" stroke={stroke} strokeWidth="2.5" />
          <circle cx="24" cy="24" r="6" fill={fill} stroke={stroke} strokeWidth="2.5" />
          <circle cx="24" cy="24" r="2" fill={stroke} />
        </>
      )}
      {name === 'chat' && (
        <path
          d="M10 12h22a4 4 0 0 1 4 4v12a4 4 0 0 1-4 4H20l-8 8v-8h-2a4 4 0 0 1-4-4V16a4 4 0 0 1 4-4z"
          fill={fill}
          stroke={stroke}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      )}
      {name === 'grid' && (
        <>
          {Array.from({ length: 9 }, (_, i) => (
            <rect
              key={i}
              x={8 + (i % 3) * 12}
              y={8 + Math.floor(i / 3) * 12}
              width="9"
              height="9"
              rx="1.5"
              fill={i % 2 === 0 ? fill : '#f9f4da'}
              stroke={stroke}
              strokeWidth="2"
            />
          ))}
        </>
      )}
      {name === 'chip' && (
        <>
          <rect x="14" y="14" width="20" height="20" rx="3" fill={fill} stroke={stroke} strokeWidth="2.5" />
          <path d="M20 8v6 M28 8v6 M20 34v6 M28 34v6 M8 20h6 M8 28h6 M34 20h6 M34 28h6" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
        </>
      )}
      {name === 'coin' && (
        <>
          <circle cx="24" cy="24" r="14" fill={fill} stroke={stroke} strokeWidth="2.5" />
          <path d="M24 16v16 M20 20h6a4 4 0 0 1 0 8h-6" fill="none" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
        </>
      )}
      {name === 'plug' && (
        <>
          <path d="M18 8v10 M30 8v10" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
          <rect x="14" y="16" width="20" height="12" rx="3" fill={fill} stroke={stroke} strokeWidth="2.5" />
          <path d="M24 28v8 M18 36h12" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
        </>
      )}
      {name === 'key' && (
        <path
          d="M20 22a8 8 0 1 1 2 5l-8 8h-4v-4l8-8a8 8 0 0 1 2-1z"
          fill={fill}
          stroke={stroke}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      )}
      {name === 'search' && (
        <>
          <circle cx="22" cy="22" r="10" fill={fill} stroke={stroke} strokeWidth="2.5" />
          <path d="M30 30l8 8" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
        </>
      )}
      {name === 'wrench' && (
        <path
          d="M30 10a8 8 0 0 0-6 12L10 36l4 4 14-14a8 8 0 0 0 10-12l-6 6-4-4z"
          fill={fill}
          stroke={stroke}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      )}
      {name === 'loop' && (
        <>
          <path d="M32 14a12 12 0 1 0 4 12" fill="none" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M28 14h10v8" fill="none" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
      {name === 'image' && (
        <>
          <rect x="8" y="12" width="32" height="24" rx="3" fill={fill} stroke={stroke} strokeWidth="2.5" />
          <circle cx="18" cy="20" r="3" fill="#f9f4da" stroke={stroke} strokeWidth="2" />
          <path d="M10 32l8-8 6 6 4-4 10 8" fill="none" stroke={stroke} strokeWidth="2.5" strokeLinejoin="round" />
        </>
      )}
      {name === 'wave' && (
        <path
          d="M6 24c4-8 6-8 8 0s4 8 8 0 4-8 8 0 4 8 8 0"
          fill="none"
          stroke={stroke}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      )}
      {name === 'shield' && (
        <path
          d="M24 8l14 6v10c0 8-6 14-14 16C16 38 10 32 10 24V14z"
          fill={fill}
          stroke={stroke}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      )}
      {name === 'rocket' && (
        <path
          d="M24 6c8 6 10 14 10 22l-6 4-4-6-4 6-6-4c0-8 2-16 10-22z"
          fill={fill}
          stroke={stroke}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      )}
      {name === 'check' && (
        <>
          <rect x="8" y="8" width="32" height="32" rx="6" fill={fill} stroke={stroke} strokeWidth="2.5" />
          <path d="M16 24l6 6 12-14" fill="none" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
    </svg>
  )
}

function TileView({ mark }: { mark: Mark }) {
  return (
    <span className={`road-tile${mark.display ? ' is-display' : ''}`}>
      <Icon name={mark.icon} />
      {mark.label}
    </span>
  )
}

function Ribbon({
  marks,
  side,
  number,
  start,
  courseHref,
}: {
  marks: Mark[]
  side: 'top' | 'bottom'
  number?: string
  start?: boolean
  courseHref?: string
}) {
  return (
    <div className={side === 'top' ? 'road-top' : 'road-bottom'}>
      {start && <span className="road-flag">Start</span>}
      {number &&
        (courseHref ? (
          <a className="road-num" href={courseHref} aria-label={`Course ${number}`}>
            <span>{number}</span>
          </a>
        ) : (
          <span className="road-num">
            <span>{number}</span>
          </span>
        ))}
      {marks.map((mark) => (
        <TileView key={mark.id} mark={mark} />
      ))}
    </div>
  )
}

function Copy({
  track,
  available,
  published,
  listed,
  done,
  courseHref,
}: {
  track: ListedTrack
  available: boolean
  published: number
  listed: number
  done: number
  courseHref?: string
}) {
  return (
    <div className="road-pocket">
      <div className="road-copy">
        <p className="road-kicker">
          {track.label} · {track.level} · {listed} modules
        </p>
        <h3>{track.title}</h3>
        <p>{track.description}</p>
        {available && published > 0 && (
          <div className="road-bar" aria-hidden="true">
            <span style={{ width: `${Math.min(100, (done / published) * 100)}%` }} />
          </div>
        )}
        <div className="road-actions">
          {available && courseHref ? (
            <a className="btn primary" href={courseHref}>
              {done > 0 ? 'Continue' : 'Start'} <ArrowRight size={16} />
            </a>
          ) : (
            <span className="road-soon">Soon</span>
          )}
          <span className="road-count">{available ? `${done} / ${published} done` : `${listed} modules planned`}</span>
        </div>
      </div>
      <div className="road-pieces" aria-hidden="true">
        <span className="piece piece-a" />
        <span className="piece piece-b" />
        <span className="piece piece-c" />
      </div>
    </div>
  )
}

function RoadStop({ track, index, done }: { track: ListedTrack; index: number; done: number }) {
  const available = isAvailable(track)
  const published = track.modules.filter(isReady).length
  const marks = MARKS[track.id] ?? []
  const mid = Math.ceil(marks.length / 2)
  const courseHref = available ? href(track.id) : undefined
  const style = { ['--card' as string]: cardFill(track.id) }

  return (
    <article className="road-stop" style={style}>
      <Ribbon
        marks={marks.slice(0, mid)}
        side="top"
        number={String(index + 1).padStart(2, '0')}
        start={index === 0}
        courseHref={courseHref}
      />
      <div className="road-turn-top" aria-hidden="true" />
      <Copy
        track={track}
        available={available}
        published={published}
        listed={track.modules.length}
        done={done}
        courseHref={courseHref}
      />
      <div className="road-turn-mid" aria-hidden="true" />
      <Ribbon marks={marks.slice(mid)} side="bottom" />
      <div className="road-turn-bot" aria-hidden="true" />
    </article>
  )
}

export function CoursePath({ tracks, doneById }: { tracks: ListedTrack[]; doneById: Record<string, number> }) {
  const stops: ReactNode[] = tracks.map((track, index) => (
    <Fragment key={track.id}>
      {index > 0 && <div className="road-join" aria-hidden="true" />}
      <RoadStop track={track} index={index} done={doneById[track.id] ?? 0} />
    </Fragment>
  ))

  return (
    <div className="road" aria-label="Course path">
      {stops}
    </div>
  )
}
