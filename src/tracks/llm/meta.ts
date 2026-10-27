import type { TrackMeta } from '../types'

const soon = false

export const llmTrack: TrackMeta = {
  id: 'llm',
  code: 'LLM',
  title: 'How Does ChatGPT Actually Work?',
  description:
    'How a chatbot turns text into an answer: tokens, meaning, attention, and why the same question can get a different reply.',
  color: '#60a5fa',
  level: 'Beginner → Intermediate',
  modules: [
    { id: 'next-word', title: 'The Secret Behind LLMs: Predicting the Next Token' },
    { id: 'tokens', title: 'How AI Breaks Language Into Tokens' },
    { id: 'embeddings', title: 'From Words to Numbers: Understanding Embeddings' },
    { id: 'meaning-vectors', title: 'How AI Represents Meaning as Vectors', ready: soon },
    { id: 'word-order', title: 'Why Word Order Matters', ready: soon },
    { id: 'attention', title: 'Attention: How AI Connects Words Across a Sentence' },
    { id: 'multi-head', title: 'Multi-Head Attention: Looking at Language From Different Angles', ready: soon },
    { id: 'transformer', title: 'Inside the Transformer: The Engine Behind Modern LLMs' },
    { id: 'moe', title: 'Mixture of Experts: How AI Activates Only Part of a Model', ready: soon },
    { id: 'generate', title: 'How AI Generates an Answer, One Token at a Time', ready: soon },
    { id: 'sampling', title: 'Why the Same Prompt Can Produce Different Answers' },
    { id: 'pretraining', title: 'How LLMs Learn From the Internet and Other Data', ready: soon },
    { id: 'training', title: 'Fine-Tuning and RLHF: Teaching AI to Follow Instructions' },
    { id: 'kv-cache', title: 'Context Windows: How Much Can an LLM Read at Once?' },
    { id: 'context-memory', title: "Why Bigger Context Windows Don't Always Mean Better Memory", ready: soon },
    { id: 'hallucinations', title: 'Why AI Hallucinates', ready: soon },
    { id: 'quantization', title: 'Can We Make an AI Model Smaller Without Ruining It?' },
  ],
  loadContent: () => import('./content').then((m) => m.content),
}
