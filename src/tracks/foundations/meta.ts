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
  modulesDone: foundationsLessonsDone,
}
