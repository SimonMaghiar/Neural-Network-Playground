import type { TrackMeta } from '../types'

export const servingTrack: TrackMeta = {
  id: 'serving',
  code: 'API',
  title: 'How Does AI Serve Millions of People?',
  description: 'What happens after you press send: how one reply is generated for many people at once, and what it costs.',
  color: '#f472b6',
  level: 'Advanced',
  modules: [
    { id: 'after-send', title: 'What Happens After You Press Send?' },
    { id: 'prefill-decode', title: 'Prefill vs Decode: The Two Phases of LLM Inference' },
    { id: 'fast-then-slow', title: 'Why AI Responds Quickly but Generates Slowly' },
    { id: 'latency-throughput', title: "Latency vs Throughput: Speed Isn't Just One Number" },
    { id: 'batching', title: 'Batching: How One GPU Handles Multiple Users' },
    { id: 'continuous-batching', title: 'Continuous Batching: Keeping GPUs Busy' },
    { id: 'kv-cache', title: "KV Cache: Why AI Doesn't Recalculate Everything" },
    { id: 'paged-attention', title: 'PagedAttention: Managing AI Memory Efficiently' },
    { id: 'speculative', title: 'Speculative Decoding: Can a Small Model Speed Up a Big One?' },
    { id: 'many-gpus', title: "When One GPU Isn't Enough" },
    { id: 'serving-engine', title: 'Inside an LLM Serving Engine' },
    { id: 'cost', title: 'How Much Does One AI Response Actually Cost?' },
    { id: 'faster-cheaper', title: 'Why Some AI Models Are Faster and Cheaper Than Others' },
  ],
}
