/** Saturated card colours shared by the homepage and the course pages. */
export const CARD_FILL: Record<string, string> = {
  ai: '#12b5e5',
  llm: '#ed203d',
  gpu: '#fcba28',
  serving: '#0ba95b',
  'first-app': '#f9f4da',
  knowledge: '#f38ba3',
  agents: '#c4b5fd',
  senses: '#fc7428',
  trust: '#ffb086',
  foundations: '#d6bcfa',
}

export const cardFill = (id: string) => CARD_FILL[id] ?? '#fcba28'
