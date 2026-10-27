import type { TrackMeta } from '../types'

export const trustTrack: TrackMeta = {
  id: 'trust',
  code: 'TRU',
  title: 'Can You Really Trust AI?',
  description: 'How to tell a good answer from a confident wrong one, and how to test, protect and watch an AI system.',
  color: '#fb7185',
  level: 'Advanced',
  modules: [
    { id: 'confident-wrong', title: 'Why AI Can Sound Confident and Still Be Wrong' },
    { id: 'good-answer', title: 'How Do You Know Whether an AI Answer Is Good?' },
    { id: 'test-set', title: 'Building a Test Dataset for Your AI' },
    { id: 'judges', title: 'Humans vs AI Judges: Who Should Evaluate Answers?' },
    { id: 'rag-quality', title: 'Measuring the Quality of a RAG System' },
    { id: 'test-agent', title: 'How to Test an AI Agent' },
    { id: 'regression', title: 'Regression Testing: Catching Problems Before Users Do' },
    { id: 'hallucinations', title: 'Understanding Hallucinations and Their Causes' },
    { id: 'prompt-injection', title: 'Prompt Injection: When Untrusted Text Becomes an Attack' },
    { id: 'private-data', title: 'Keeping Private Data Safe' },
    { id: 'bias', title: 'Bias, Fairness and Responsible AI' },
    { id: 'guardrails', title: 'Guardrails: What Should AI Be Allowed to Do?' },
    { id: 'observability', title: 'Observability: Seeing What Your AI Is Doing' },
    { id: 'eval-tools', title: 'Tools for Evaluating and Monitoring AI' },
    { id: 'more-reliable', title: 'Making Your AI More Reliable, One Test at a Time' },
  ],
}
