import { findInfoPage, infoPages, type InfoPage } from './pages/info'
import { href } from './router'
import { findTrack, tracks } from './tracks/catalog'
import { isReady, type ListedTrack } from './tracks/types'

export type Page =
  | { kind: 'home' }
  /** A track with its own page component; `sub` is the path below the track, '' for its root. */
  | { kind: 'custom'; track: ListedTrack; sub: string }
  /** A standard track: its overview, or one module when `moduleIndex` is set. */
  | { kind: 'track'; track: ListedTrack; moduleIndex: number | null }
  /** About, Glossary, Privacy and the other site pages. */
  | { kind: 'info'; info: InfoPage }
  | { kind: 'notFound' }

const subPaths = (track: ListedTrack) => (track.pageMeta ? Object.keys(track.pageMeta) : [''])

export function resolveRoute(route: string[]): Page {
  if (route.length === 0) return { kind: 'home' }
  const info = findInfoPage(route[0])
  if (info) return route.length === 1 ? { kind: 'info', info } : { kind: 'notFound' }
  const track = findTrack(route[0])
  if (!track || route.length > 2) return { kind: 'notFound' }
  const sub = route[1] ?? ''
  if (track.page) return subPaths(track).includes(sub) ? { kind: 'custom', track, sub } : { kind: 'notFound' }
  if (track.loadContent) {
    if (!sub) return { kind: 'track', track, moduleIndex: null }
    const moduleIndex = track.modules.findIndex((m) => m.id === sub && isReady(m))
    if (moduleIndex >= 0) return { kind: 'track', track, moduleIndex }
  }
  return { kind: 'notFound' }
}

/** Every public page of the site, in sitemap order. */
export function allPaths(): string[] {
  const paths = ['/']
  for (const t of tracks) {
    if (t.page) paths.push(...subPaths(t).map((sub) => href(sub ? `${t.id}/${sub}` : t.id)))
    else if (t.loadContent) paths.push(href(t.id), ...t.modules.filter(isReady).map((m) => href(`${t.id}/${m.id}`)))
  }
  paths.push(...infoPages.map((p) => href(p.id)))
  return paths
}
