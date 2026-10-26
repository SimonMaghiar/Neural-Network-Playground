import { lazy, type ComponentType } from 'react'

/** A site page outside the courses: About, Glossary, Contact, Privacy, Terms. */
export interface InfoPage {
  /** URL path segment, e.g. `about` → `/about/`. Must not clash with a track id. */
  id: string
  title: string
  /** Title for search results, when it should differ from the page heading. */
  seoTitle?: string
  description: string
  /** One or two sentences shown under the heading. */
  lead: string
  body: ComponentType
}

export const infoPages: InfoPage[] = [
  {
    id: 'about',
    title: 'About Neural Playground',
    seoTitle: 'About',
    description:
      'Neural Playground teaches how modern AI works, from GPUs to large language models, with plain explanations, interactive simulations and short quizzes.',
    lead: 'Why this site exists, who it is for and how the courses work.',
    body: lazy(() => import('./About')),
  },
  {
    id: 'glossary',
    title: 'AI Glossary',
    seoTitle: 'AI Glossary: Neural Network, GPU and LLM Terms',
    description:
      'Plain-language definitions of AI terms: neurons, weights, training, GPUs, memory bandwidth, tokens, embeddings, attention, transformers, the KV cache and more.',
    lead: 'Every technical term used in the courses, explained in plain words.',
    body: lazy(() => import('./Glossary')),
  },
  {
    id: 'contact',
    title: 'Contact',
    description: 'How to reach the Neural Playground team with feedback, corrections or ideas for new courses.',
    lead: 'Found a mistake, have an idea or just want to say hello? We would love to hear from you.',
    body: lazy(() => import('./Contact')),
  },
  {
    id: 'privacy',
    title: 'Privacy Policy',
    description: 'What data Neural Playground stores, where it is kept and how you can delete it.',
    lead: 'Short version: there are no accounts, no cookies and no tracking. Your progress stays in your own browser.',
    body: lazy(() => import('./Privacy')),
  },
  {
    id: 'terms',
    title: 'Terms of Use',
    description: 'The rules for using Neural Playground and its courses, simulations and content.',
    lead: 'The rules for using this website and its content.',
    body: lazy(() => import('./Terms')),
  },
]

export const findInfoPage = (id: string | undefined) => infoPages.find((p) => p.id === id)
