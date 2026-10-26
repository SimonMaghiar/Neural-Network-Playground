import { use } from 'react'
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

/** Renders any standard track: its content is fetched on first visit, then cached. Needs a Suspense boundary. */
export function TrackPage({ track, route }: { track: ListedTrack; route: string[] }) {
  const content = use(contentFor(track))
  return <TrackLayout track={track} content={content} moduleId={route[1]} />
}
