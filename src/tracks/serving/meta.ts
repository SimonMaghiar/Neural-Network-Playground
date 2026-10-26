import type { TrackMeta } from '../types'

export const servingTrack: TrackMeta = {
  id: 'serving',
  code: 'API',
  title: 'Running LLMs at Scale',
  description:
    'What it takes to serve millions of users: batching, memory management, speed tricks, and the metrics that decide cost.',
  color: '#f472b6',
  level: 'Advanced',
  modules: [
    { id: 'inference', title: 'From model to API' },
    { id: 'batching', title: 'Batching: static vs continuous' },
    { id: 'paged-attention', title: 'KV-cache memory and PagedAttention' },
    { id: 'prefill-decode', title: 'Prefill vs decode' },
    { id: 'speculative', title: 'Speculative decoding' },
    { id: 'metrics', title: 'Speed metrics: TTFT and tokens/s' },
    { id: 'cost', title: 'The cost of a request' },
  ],
}
