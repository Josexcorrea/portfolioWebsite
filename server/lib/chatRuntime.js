import OpenAI from 'openai'
import { createCachedFileVectorStore } from './vectorStore.js'
import {
  buildSiteImplementationNotes,
  buildSystemPromptBase,
  buildTechStackSummary,
  DETAIL_MODE_PROMPT,
  OWNER_MODE_PROMPT,
} from './chatPrompts.js'

/**
 * Shared OpenAI client, RAG config, and vector store for Express and Vercel serverless.
 */
export function buildChatRuntime() {
  const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null
  const techStackSummary = buildTechStackSummary()
  const implementationNotes = buildSiteImplementationNotes()

  const config = {
    CHAT_MODEL: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    RAG_TOP_K: parseInt(process.env.RAG_TOP_K || '3', 10),
    RAG_TOP_K_DETAIL: parseInt(process.env.RAG_TOP_K_DETAIL || '12', 10),
    RAG_MIN_SCORE: parseFloat(process.env.RAG_MIN_SCORE || '0.25'),
    RAG_MIN_SCORE_DETAIL: parseFloat(process.env.RAG_MIN_SCORE_DETAIL || '0.18'),
    MAX_COMPLETION_TOKENS: parseInt(process.env.MAX_COMPLETION_TOKENS || '256', 10),
    /** When RAG returns chunks but not detail mode, floor completion length so quotes + answer fit. */
    MAX_COMPLETION_TOKENS_WITH_RAG: parseInt(process.env.MAX_COMPLETION_TOKENS_WITH_RAG || '384', 10),
    MAX_COMPLETION_TOKENS_DETAIL: parseInt(process.env.MAX_COMPLETION_TOKENS_DETAIL || '2048', 10),
    systemPromptBase: buildSystemPromptBase({
      techStackSummary,
      implementationNotes,
    }),
  }

  config.systemPromptDetailMode = DETAIL_MODE_PROMPT
  config.systemPromptOwnerMode = OWNER_MODE_PROMPT

  const store = createCachedFileVectorStore()

  return { openai, config, store }
}
