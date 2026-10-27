import type { TrackMeta } from '../types'

export const productTrack: TrackMeta = {
  id: 'product',
  code: 'PRO',
  title: 'From AI Prototype to Real Product',
  description: 'How to turn a working prototype into an application you can deploy, monitor and afford.',
  color: '#a3e635',
  level: 'Advanced',
  modules: [
    { id: 'production', title: 'What Does a Production AI Application Look Like?' },
    { id: 'architecture-parts', title: 'How Frontends, Backends and AI Models Work Together' },
    { id: 'when-not', title: 'When Should You NOT Use AI?' },
    { id: 'architecture', title: 'Designing Your AI Application Architecture' },
    { id: 'secrets', title: 'Protecting API Keys and User Accounts' },
    { id: 'failures', title: 'Rate Limits, Retries and Handling Failures' },
    { id: 'instant', title: 'Making AI Responses Feel Instant' },
    { id: 'history', title: 'Managing Conversation History and Context' },
    { id: 'faster-cheaper', title: 'How to Make AI Applications Faster and Cheaper' },
    { id: 'deploy', title: 'Deploying Your AI Application to the Cloud' },
    { id: 'monitoring', title: 'Monitoring Performance, Errors and Costs' },
    { id: 'versioning', title: 'Versioning Prompts, Models and Evaluations' },
    { id: 'which-approach', title: 'Prompting vs RAG vs Fine-Tuning: Making the Right Choice' },
    { id: 'coding-assistants', title: 'Using AI Coding Assistants to Build Faster' },
    { id: 'final-project', title: 'Final Project: Build and Launch Your Own AI Application' },
  ],
}
