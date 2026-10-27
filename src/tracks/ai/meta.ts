import type { TrackMeta } from '../types'

const soon = false

export const aiTrack: TrackMeta = {
  id: 'ai',
  code: 'AI',
  title: 'How Do Machines Learn?',
  description:
    'What AI is, how it differs from ordinary software, what a neuron does, and how a network learns from its mistakes.',
  color: '#2dd4bf',
  level: 'Beginner',
  modules: [
    { id: 'big-question', title: 'The Big Question: What Is Artificial Intelligence?', ready: soon },
    { id: 'what-is-ai', title: "Traditional Software vs AI: What's the Difference?" },
    { id: 'ml-dl-llms', title: 'Machine Learning, Deep Learning and LLMs: The AI Family Tree' },
    { id: 'learning-types', title: 'Supervised vs Unsupervised vs Reinforcement Learning', ready: soon },
    { id: 'training-data', title: 'Where Does AI Get Its Training Data?', ready: soon },
    { id: 'data-patterns', title: 'How Machines Discover Patterns in Data' },
    { id: 'neuron', title: 'Meet the Artificial Neuron' },
    { id: 'neuron-decision', title: 'How a Neuron Makes a Decision', ready: soon },
    { id: 'hidden-layers', title: 'Connecting Neurons: Building a Neural Network' },
    { id: 'learning-mistakes', title: 'How AI Learns From Its Mistakes', ready: soon },
    { id: 'learning', title: 'Gradient Descent: Finding Better Weights' },
    { id: 'backpropagation', title: 'Backpropagation: How Neural Networks Know What to Change', ready: soon },
    { id: 'training-vs-inference', title: 'Training vs Inference: Learning vs Using' },
    { id: 'overfitting', title: 'When AI Memorizes Instead of Learning', ready: soon },
    { id: 'better-data', title: 'Why Better Data Can Beat a Bigger Model', ready: soon },
    { id: 'what-models-remember', title: 'What Does an AI Model Actually Remember?', ready: soon },
    { id: 'toward-llms', title: 'From Neural Networks to Language Models', ready: soon },
  ],
  loadContent: () => import('./content').then((m) => m.content),
}
