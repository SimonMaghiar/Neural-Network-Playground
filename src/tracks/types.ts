import type { ComponentType, ReactNode } from 'react'

export interface SimProps {
  onTaskDone: () => void
}

export interface QuizQuestion {
  question: ReactNode
  options: ReactNode[]
  answer: number
  explain: ReactNode
}

export interface ModuleContent {
  /** One sentence: what the learner will understand after this module. */
  goal: string
  intro: ReactNode
  sim: ComponentType<SimProps>
  task: { text: ReactNode; done: ReactNode }
  takeaways: ReactNode[]
  quiz: QuizQuestion[]
  /** Optional technical detail for learners who want to go further. */
  deepDive: ReactNode
}
