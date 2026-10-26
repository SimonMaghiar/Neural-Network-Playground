import type { TrackMeta } from '../types'

export const gpuTrack: TrackMeta = {
  id: 'gpu',
  code: 'GPU',
  title: 'Why AI Runs on GPUs',
  description:
    'Why a graphics chip became the engine of AI: parallel workers, matrix multiplication, memory bottlenecks, number precision and how much hardware big models need.',
  color: '#4ade80',
  level: 'Beginner → Intermediate',
  modules: [
    { id: 'multiplication', title: 'AI is mostly multiplication' },
    { id: 'cpu-vs-gpu', title: 'CPU vs GPU: experts vs an army' },
    { id: 'matrices', title: 'Neural networks are matrix multiplication' },
    { id: 'memory-wall', title: 'Memory is the real bottleneck' },
    { id: 'memory-hierarchy', title: 'The memory hierarchy' },
    { id: 'threads', title: 'Threads, warps and SMs' },
    { id: 'tiling', title: 'Tiling: reuse data before you drop it' },
    { id: 'precision', title: 'Number precision and tensor cores' },
    { id: 'sizing', title: 'How many GPUs does a model need?' },
  ],
  loadContent: () => import('./content').then((m) => m.content),
}
