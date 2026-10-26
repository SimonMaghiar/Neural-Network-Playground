import type { TrackMeta } from '../types'

export const appsTrack: TrackMeta = {
  id: 'apps',
  code: 'APP',
  title: 'What LLMs Are Used For',
  description:
    'Turning a model into useful products: prompting, searching your own documents, tools and agents, evaluation, and the risks to watch for.',
  color: '#facc15',
  level: 'Intermediate → Advanced',
  modules: [
    { id: 'prompting', title: 'Chatbots and prompting' },
    { id: 'rag', title: 'RAG: answering from your documents' },
    { id: 'tools', title: 'Tool use and function calling' },
    { id: 'agents', title: 'The agent loop' },
    { id: 'multimodal', title: 'Images, audio and multimodal models' },
    { id: 'evals', title: 'Measuring quality (evals)' },
    { id: 'limits', title: 'Hallucinations, bias and security' },
  ],
}
