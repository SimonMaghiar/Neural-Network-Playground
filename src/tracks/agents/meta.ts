import type { TrackMeta } from '../types'

export const agentsTrack: TrackMeta = {
  id: 'agents',
  code: 'AGT',
  title: 'From Chatbots to AI Agents',
  description: 'How a model uses tools, repeats a loop of thinking and acting, and stays under your control.',
  color: '#fb923c',
  level: 'Intermediate → Advanced',
  modules: [
    { id: 'agent-vs-chatbot', title: 'What Makes an AI Agent Different From a Chatbot?' },
    { id: 'tools', title: 'How AI Can Use Tools and Call Functions' },
    { id: 'choose-tool', title: 'How an LLM Chooses the Right Tool' },
    { id: 'agent-loop', title: 'The Agent Loop: Think, Act, Observe, Repeat' },
    { id: 'react', title: 'ReAct: Combining Reasoning With Actions' },
    { id: 'memory', title: 'How Agents Remember Information' },
    { id: 'agent-context', title: "Managing an Agent's Context" },
    { id: 'frameworks', title: 'Agent Frameworks: When Do You Actually Need One?' },
    { id: 'mcp', title: 'MCP: A Universal Way to Connect AI to Tools' },
    { id: 'mcp-parts', title: 'Inside MCP Clients and Servers' },
    { id: 'multi-agent', title: 'Multi-Agent Systems: When Multiple AIs Work Together' },
    { id: 'control', title: 'Keeping AI Agents Under Control' },
  ],
}
