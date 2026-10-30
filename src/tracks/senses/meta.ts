import type { TrackMeta } from '../types'

export const sensesTrack: TrackMeta = {
  id: 'senses',
  code: 'SEE',
  title: 'AI Beyond Text: Seeing, Hearing and Creating',
  description: 'How models understand and create images, speech and video, not only text.',
  color: '#22d3ee',
  level: 'Intermediate',
  modules: [
    { id: 'beyond-text', title: 'What Happens When AI Goes Beyond Text?' },
    { id: 'images-as-numbers', title: 'How Computers Turn Images Into Numbers' },
    { id: 'understand-pictures', title: "How AI Understands What's in a Picture" },
    { id: 'images-from-words', title: 'How AI Generates Images From Words' },
    { id: 'diffusion', title: 'Diffusion Models: Creating Images From Noise' },
    { id: 'speech-to-text', title: 'How AI Converts Speech Into Text' },
    { id: 'text-to-speech', title: 'How AI Generates Human-Like Speech' },
    { id: 'voice', title: 'How Real-Time Voice Assistants Work' },
    { id: 'video', title: 'How AI Understands Video' },
    { id: 'multimodal', title: 'Combining Text, Images and Audio in One Model' },
  ],
}
