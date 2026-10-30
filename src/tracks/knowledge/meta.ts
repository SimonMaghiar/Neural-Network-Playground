import type { TrackMeta } from '../types'

export const knowledgeTrack: TrackMeta = {
  id: 'knowledge',
  code: 'RAG',
  title: 'How Do You Give AI Its Own Knowledge?',
  description: 'How to let a model search your documents, and when fine-tuning is the better tool.',
  color: '#c084fc',
  level: 'Intermediate → Advanced',
  modules: [
    { id: 'dont-know', title: "Why LLMs Don't Know Everything" },
    { id: 'meaning-search', title: 'How AI Searches by Meaning Instead of Keywords' },
    { id: 'doc-embeddings', title: 'Embeddings: Turning Documents Into Searchable Vectors' },
    { id: 'similarity', title: 'Measuring Similarity Between Ideas' },
    { id: 'vector-db', title: 'What Is a Vector Database?' },
    { id: 'vector-search', title: 'How Vector Search Finds the Closest Matches' },
    { id: 'vector-tools', title: 'Meet FAISS, Chroma, Pinecone and Qdrant' },
    { id: 'rag', title: 'RAG: Giving AI Access to External Knowledge' },
    { id: 'documents', title: 'How to Turn Documents Into AI-Readable Data' },
    { id: 'chunking', title: 'Chunking: Why Document Size Matters' },
    { id: 'pipeline', title: 'Inside a Complete RAG Pipeline' },
    { id: 'hybrid', title: 'Hybrid Search and Reranking: Finding Better Answers' },
    { id: 'rag-vs-finetune', title: 'RAG vs Fine-Tuning: Which Should You Use?' },
    { id: 'lora', title: 'LoRA: How to Fine-Tune AI Without Retraining Everything' },
  ],
}
