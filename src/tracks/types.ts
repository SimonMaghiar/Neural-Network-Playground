import type { ComponentType, ReactNode } from 'react'

export interface SimProps {
  onTaskDone: () => void
}

export interface QuizQuestion {
  question: ReactNode
  options: ReactNode[]
  answer: number
  explain: ReactNode
}

export interface ModuleContent {
  /** One sentence: what the learner will understand after this module. */
  goal: string
  intro: ReactNode
  sim: ComponentType<SimProps>
  task: { text: ReactNode; done: ReactNode }
  takeaways: ReactNode[]
  quiz: QuizQuestion[]
  /** Optional technical detail for learners who want to go further. */
  deepDive: ReactNode
}

/** All module content of one track, keyed by module id. */
export type TrackContent = Record<string, ModuleContent>

export interface TrackPageProps {
  /** Route segments, e.g. ['gpu', 'tiling']. */
  route: string[]
}

export interface ModuleMeta {
  id: string
  title: string
}

/**
 * Everything the home page needs to know about a track. Kept light: the heavy
 * content is only fetched through `loadContent` or `page` when the track is opened.
 */
export interface TrackMeta {
  id: string
  code: string
  title: string
  description: string
  color: string
  level: string
  modules: ModuleMeta[]
  /** Standard tracks: module content rendered by the shared track layout. */
  loadContent?: () => Promise<TrackContent>
  /** Tracks with a custom page instead of the shared layout. */
  page?: ComponentType<TrackPageProps>
  /** Custom-page tracks: search title and description of each path the page serves ('' is the track root). */
  pageMeta?: Record<string, { title: string; description: string }>
  /** Number of finished modules, for tracks that track progress their own way. */
  modulesDone?: () => number
}

export type Section = 'course' | 'lab'

/** A track as listed in the catalog: where it appears and how it is labelled ("Track 2", "Lab"). */
export interface ListedTrack extends TrackMeta {
  section: Section
  label: string
}

export const isAvailable = (t: TrackMeta) => Boolean(t.loadContent || t.page)
