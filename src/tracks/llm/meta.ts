import type { TrackMeta } from '../types'

export const llmTrack: TrackMeta = {
  id: 'llm',
  code: 'LLM',
  title: 'How LLMs Work',
  description:
    'How a chatbot turns your words into an answer: tokens, embeddings, attention, the transformer, sampling, training, the KV cache and quantization.',
  color: '#60a5fa',
  level: 'Intermediate',
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
  loadContent: () => import('./content').then((m) => m.content),
}
