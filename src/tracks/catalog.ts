export type TrackId = 'foundations' | 'gpu' | 'llm' | 'serving' | 'apps'

export interface TrackMeta {
  id: TrackId
  number: number
  code: string
  title: string
  description: string
  color: string
  level: string
  available: boolean
  modules: { id: string; title: string }[]
}

export const gpuModules = [
  { id: 'multiplication', title: 'AI is mostly multiplication' },
  { id: 'cpu-vs-gpu', title: 'CPU vs GPU: experts vs an army' },
  { id: 'matrices', title: 'Neural networks are matrix multiplication' },
  { id: 'memory-wall', title: 'Memory is the real bottleneck' },
  { id: 'memory-hierarchy', title: 'The memory hierarchy' },
  { id: 'threads', title: 'Threads, warps and SMs' },
  { id: 'tiling', title: 'Tiling: reuse data before you drop it' },
  { id: 'precision', title: 'Number precision and tensor cores' },
  { id: 'sizing', title: 'How many GPUs does a model need?' },
]

export const tracks: TrackMeta[] = [
  {
    id: 'foundations',
    number: 1,
    code: 'NN',
    title: 'Neural Network Foundations',
    description:
      'Start here. What a neuron is, how a network measures its mistakes, and how it learns by nudging its weights, all hands-on.',
    color: '#a78bfa',
    level: 'Beginner',
    available: true,
    modules: [],
  },
  {
    id: 'gpu',
    number: 2,
    code: 'GPU',
    title: 'Why AI Runs on GPUs',
    description:
      'Why a graphics chip became the engine of AI: parallel workers, matrix multiplication, memory bottlenecks, number precision and how much hardware big models need.',
    color: '#4ade80',
    level: 'Beginner → Intermediate',
    available: true,
    modules: gpuModules,
  },
  {
    id: 'llm',
    number: 3,
    code: 'LLM',
    title: 'How LLMs Work',
    description:
      'How a chatbot turns your words into an answer: tokens, embeddings, attention, the transformer, sampling and training.',
    color: '#60a5fa',
    level: 'Intermediate',
    available: false,
    modules: [
      { id: 'next-word', title: 'Predicting the next word' },
      { id: 'tokens', title: 'Tokenization: text to numbers' },
      { id: 'embeddings', title: 'Embeddings: meaning as a map' },
      { id: 'attention', title: 'Attention: which words matter' },
      { id: 'transformer', title: 'The transformer block' },
      { id: 'sampling', title: 'Temperature and sampling' },
      { id: 'training', title: 'Pre-training, fine-tuning and RLHF' },
      { id: 'kv-cache', title: 'KV cache and context length' },
      { id: 'quantization', title: 'Quantization: shrinking models' },
    ],
  },
  {
    id: 'serving',
    number: 4,
    code: 'API',
    title: 'Running LLMs at Scale',
    description:
      'What it takes to serve millions of users: batching, memory management, speed tricks, and the metrics that decide cost.',
    color: '#f472b6',
    level: 'Advanced',
    available: false,
    modules: [
      { id: 'inference', title: 'From model to API' },
      { id: 'batching', title: 'Batching: static vs continuous' },
      { id: 'paged-attention', title: 'KV-cache memory and PagedAttention' },
      { id: 'prefill-decode', title: 'Prefill vs decode' },
      { id: 'speculative', title: 'Speculative decoding' },
      { id: 'metrics', title: 'Speed metrics: TTFT and tokens/s' },
      { id: 'cost', title: 'The cost of a request' },
    ],
  },
  {
    id: 'apps',
    number: 5,
    code: 'APP',
    title: 'What LLMs Are Used For',
    description:
      'Turning a model into useful products: prompting, searching your own documents, tools and agents, evaluation, and the risks to watch for.',
    color: '#facc15',
    level: 'Intermediate → Advanced',
    available: false,
    modules: [
      { id: 'prompting', title: 'Chatbots and prompting' },
      { id: 'rag', title: 'RAG: answering from your documents' },
      { id: 'tools', title: 'Tool use and function calling' },
      { id: 'agents', title: 'The agent loop' },
      { id: 'multimodal', title: 'Images, audio and multimodal models' },
      { id: 'evals', title: 'Measuring quality (evals)' },
      { id: 'limits', title: 'Hallucinations, bias and security' },
    ],
  },
]
