import type { TrackMeta } from '../types'

export const aiTrack: TrackMeta = {
  id: 'ai',
  code: 'AI',
  title: 'AI and Neural Network Foundations',
  description:
    'Start here: what AI really is, how machines learn patterns from data, what a neuron does, how a network learns from its mistakes, and the difference between training a model and using it.',
  color: '#2dd4bf',
  level: 'Beginner',
  modules: [
    { id: 'what-is-ai', title: 'What is AI? How it differs from traditional software' },
    { id: 'ml-dl-llms', title: 'Machine learning, deep learning and LLMs' },
    { id: 'data-patterns', title: 'Data, patterns and predictions' },
    { id: 'neuron', title: 'Meet the neuron: inputs, weights and bias' },
    { id: 'learning', title: 'How networks learn: loss and gradient descent' },
    { id: 'hidden-layers', title: 'Hidden layers and deep neural networks' },
    { id: 'training-vs-inference', title: 'Training vs inference' },
  ],
  loadContent: () => import('./content').then((m) => m.content),
}
