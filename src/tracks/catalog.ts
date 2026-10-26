import { aiTrack } from './ai/meta'
import { appsTrack } from './apps/meta'
import { foundationsTrack } from './foundations/meta'
import { gpuTrack } from './gpu/meta'
import { llmTrack } from './llm/meta'
import { servingTrack } from './serving/meta'
import type { ListedTrack } from './types'

/**
 * To add a track, create its folder with a `meta.ts` and list it below.
 * Courses are numbered by their position here; labs are hands-on workshops outside the numbered path.
 */
export const courses: ListedTrack[] = [aiTrack, gpuTrack, llmTrack, servingTrack, appsTrack].map((t, i) => ({
  ...t,
  section: 'course',
  label: `Track ${i + 1}`,
}))

export const labs: ListedTrack[] = [foundationsTrack].map((t) => ({ ...t, section: 'lab', label: 'Lab' }))

export const tracks: ListedTrack[] = [...courses, ...labs]

export const findTrack = (id: string | undefined) => tracks.find((t) => t.id === id)
