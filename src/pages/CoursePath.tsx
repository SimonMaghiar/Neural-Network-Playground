import { Fragment, type ReactNode } from 'react'
import { ArrowRight } from 'lucide-react'
import { href } from '../router'
import { cardFill } from '../tracks/colors'
import { isAvailable, isReady, type ListedTrack } from '../tracks/types'

const PER_ROW = 5
const FIRST_ROW = 3

interface Tile {
  id: string
  label: string
  title: string
  href?: string
  display: boolean
}

function shortLabel(title: string): string {
  const colon = title.indexOf(':')
  let text = (colon > 0 ? title.slice(0, colon) : title).replace(/\?+$/, '').trim()
  if (text.length > 42) {
    const cut = text.split(/,| and /i)[0].trim()
    if (cut.length >= 10 && cut.length < text.length) text = cut
  }
  return text
}

function tilesFor(track: ListedTrack): Tile[] {
  const available = isAvailable(track)
  return track.modules.map((m, i) => {
    const ready = available && isReady(m)
    return {
      id: m.id,
      label: shortLabel(m.title),
      title: m.title,
      href: ready ? href(`${track.id}/${m.id}`) : undefined,
      display: i % 2 === 0,
    }
  })
}

function rowsFor(tiles: Tile[]): Tile[][] {
  if (tiles.length === 0) return []
  const rows: Tile[][] = [tiles.slice(0, FIRST_ROW)]
  for (let i = FIRST_ROW; i < tiles.length; i += PER_ROW) rows.push(tiles.slice(i, i + PER_ROW))
  return rows
}

function TileView({ tile }: { tile: Tile }) {
  const className = `road-tile${tile.display ? ' is-display' : ''}`
  if (tile.href) {
    return (
      <a className={className} href={tile.href} title={tile.title}>
        {tile.label}
      </a>
    )
  }
  return (
    <span className={`${className} is-locked`} title={tile.title}>
      {tile.label}
    </span>
  )
}

function Ribbon({
  tiles,
  side,
  number,
  start,
  courseHref,
}: {
  tiles: Tile[]
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
      {tiles.map((tile) => (
        <TileView key={tile.id} tile={tile} />
      ))}
    </div>
  )
}

function RoadStop({
  track,
  index,
  top,
  bottom,
  first,
  showCopy,
  done,
}: {
  track: ListedTrack
  index: number
  top: Tile[]
  bottom: Tile[] | null
  first: boolean
  showCopy: boolean
  done: number
}) {
  const available = isAvailable(track)
  const published = track.modules.filter(isReady).length
  const listed = track.modules.length
  const number = String(index + 1).padStart(2, '0')
  const courseHref = available ? href(track.id) : undefined
  const style = { ['--card' as string]: cardFill(track.id) }

  const ribbon = (
    <Ribbon tiles={top} side="top" number={showCopy ? number : undefined} start={first} courseHref={courseHref} />
  )

  if (!bottom) {
    return (
      <article className="road-stop is-cap" style={style}>
        {ribbon}
        {showCopy && (
          <Copy track={track} available={available} published={published} listed={listed} done={done} courseHref={courseHref} />
        )}
      </article>
    )
  }

  return (
    <article className={showCopy ? 'road-stop' : 'road-stop is-continue'} style={style}>
      {ribbon}
      <div className="road-turn-top" aria-hidden="true" />
      {showCopy ? (
        <Copy track={track} available={available} published={published} listed={listed} done={done} courseHref={courseHref} />
      ) : (
        <div className="road-pocket" />
      )}
      <div className="road-turn-mid" aria-hidden="true" />
      <Ribbon tiles={bottom} side="bottom" />
      <div className="road-turn-bot" aria-hidden="true" />
    </article>
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

export function CoursePath({ tracks, doneById }: { tracks: ListedTrack[]; doneById: Record<string, number> }) {
  const stops: { key: string; node: ReactNode }[] = []
  tracks.forEach((track, index) => {
    const rows = rowsFor(tilesFor(track))
    for (let p = 0; p < rows.length; p += 2) {
      const top = rows[p] ?? []
      const bottom = rows[p + 1] ?? null
      const showCopy = p === 0
      stops.push({
        key: `${track.id}-${p}`,
        node: (
          <RoadStop
            track={track}
            index={index}
            top={top}
            bottom={bottom}
            first={index === 0 && p === 0}
            showCopy={showCopy}
            done={doneById[track.id] ?? 0}
          />
        ),
      })
    }
  })

  return (
    <div className="road" aria-label="Course path">
      {stops.map((stop, i) => (
        <Fragment key={stop.key}>
          {i > 0 && <div className="road-join" aria-hidden="true" />}
          {stop.node}
        </Fragment>
      ))}
    </div>
  )
}
