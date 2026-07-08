import type { ChatMessage } from '../types'

/**
 * Mock chat backend. Replace `sendMessage` with a real call to the LLM
 * endpoint (e.g. POST /chat with the message history) when it is available;
 * the signature is kept intentionally simple so callers do not change.
 */

const MOCK_LATENCY_MS = 700

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function mockReply(history: ChatMessage[]): string {
  const last = [...history].reverse().find((m) => m.role === 'user')
  const question = last?.content.trim() ?? ''
  return (
    `Réponse simulée : j'ai bien reçu « ${question} ». ` +
    `Ce chatbot n'est pas encore connecté à un LLM — les réponses sont fictives pour l'instant.`
  )
}

export const chatApi = {
  async sendMessage(history: ChatMessage[]): Promise<string> {
    await delay(MOCK_LATENCY_MS)
    return mockReply(history)
  },
}
