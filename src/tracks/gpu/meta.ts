import type { TrackMeta } from '../types'

const soon = false

export const gpuTrack: TrackMeta = {
  id: 'gpu',
  code: 'GPU',
  title: 'Why Does AI Run on GPUs?',
  description:
    'Why AI needs so much simple arithmetic, how a GPU differs from a CPU, and why memory and number size decide what a model can run.',
  color: '#4ade80',
  level: 'Intermediate',
  modules: [
    { id: 'multiplication', title: 'Why AI Is So Computationally Expensive' },
    { id: 'cpu-vs-gpu', title: 'CPUs vs GPUs: A Few Experts vs an Army of Workers' },
    { id: 'matrices', title: 'The Math Behind AI: Matrix Multiplication' },
    { id: 'parallel', title: 'Parallel Computing: Thousands of Calculations at Once', ready: soon },
    { id: 'memory-wall', title: 'Why Moving Data Can Be Slower Than Computing' },
    { id: 'memory-hierarchy', title: 'Inside GPU Memory: Registers, Cache and VRAM' },
    { id: 'threads', title: 'How Thousands of GPU Threads Work Together' },
    { id: 'tiling', title: 'Tiling: The Trick That Makes Matrix Multiplication Faster' },
    { id: 'precision', title: 'Why AI Uses Different Number Precisions' },
    { id: 'tensor-cores', title: 'Tensor Cores: Hardware Built for AI', ready: soon },
    { id: 'sizing', title: 'How Much GPU Memory Does an AI Model Need?' },
    { id: 'train-vs-run', title: 'Why Training AI Is Harder Than Running It', ready: soon },
  ],
  loadContent: () => import('./content').then((m) => m.content),
}
