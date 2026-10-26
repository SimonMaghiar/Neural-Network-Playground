import { lazy } from 'react'
import { lessons } from '../../lessons'
import type { TrackMeta } from '../types'
import { foundationsLessonsDone } from './progress'

export const foundationsTrack: TrackMeta = {
  id: 'foundations',
  code: 'NN',
  title: 'Neural Network Foundations',
  description:
    'Build and train small neural networks yourself: see what a neuron is, how a network measures its mistakes, and how it learns by nudging its weights. Includes a free playground.',
  color: '#a78bfa',
  level: 'Beginner',
  modules: lessons.map((l, i) => ({ id: String(i), title: l.title })),
  page: lazy(() => import('./FoundationsTrack')),
  pageMeta: {
    '': {
      title: 'Neural Network Foundations: Build and Train a Neural Network',
      description:
        'A hands-on lab for beginners: see what a neuron is, how a neural network measures its mistakes, and how it learns by nudging its weights, step by step in your browser.',
    },
    playground: {
      title: 'Neural Network Playground: Train a Network in Your Browser',
      description:
        'Build a small neural network, pick a dataset and watch it learn in real time. Add layers and neurons, change activation functions and see every weight update.',
    },
  },
  modulesDone: foundationsLessonsDone,
}
