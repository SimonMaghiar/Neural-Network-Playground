import type { TrackMeta } from '../types'

export const trustTrack: TrackMeta = {
  id: 'trust',
  code: 'TRU',
  title: 'Can You Really Trust AI?',
  description: 'Why a confident answer can still be wrong, how to judge one, and how untrusted text can turn into an attack.',
  color: '#fb7185',
  level: 'Advanced',
  modules: [
    { id: 'confident-wrong', title: 'Why AI Can Sound Confident and Still Be Wrong' },
    { id: 'good-answer', title: 'How Do You Know Whether an AI Answer Is Good?' },
    { id: 'prompt-injection', title: 'Prompt Injection: When Untrusted Text Becomes an Attack' },
  ],
}
