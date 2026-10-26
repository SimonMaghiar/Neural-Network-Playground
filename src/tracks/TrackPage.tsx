import { use } from 'react'
import { TrackOverview } from '../pages/TrackOverview'
import { TrackLayout } from '../ui/TrackLayout'
import type { ListedTrack, TrackContent, TrackMeta } from './types'

const loaded = new Map<string, Promise<TrackContent>>()

function contentFor(track: TrackMeta): Promise<TrackContent> {
  let promise = loaded.get(track.id)
  if (!promise) {
    promise = track.loadContent!()
    loaded.set(track.id, promise)
  }
  return promise
}

/**
 * Renders any standard track: its overview, or one module in the shared layout.
 * The content is fetched on first visit, then cached. Needs a Suspense boundary.
 */
export function TrackPage({ track, moduleIndex }: { track: ListedTrack; moduleIndex: number | null }) {
  const content = use(contentFor(track))
  if (moduleIndex === null) return <TrackOverview track={track} content={content} />
  return <TrackLayout track={track} content={content} moduleId={track.modules[moduleIndex].id} />
}
