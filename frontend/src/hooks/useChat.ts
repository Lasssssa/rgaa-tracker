import { useCallback, useState } from 'react'
import { chatApi } from '../api'
import type { ChatMessage } from '../types'

function createMessage(
  role: ChatMessage['role'],
  content: string,
): ChatMessage {
  return { id: crypto.randomUUID(), role, content }
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = useCallback(
    async (text: string) => {
      const content = text.trim()
      if (!content || pending) return

      const userMessage = createMessage('user', content)
      const history = [...messages, userMessage]
      setMessages(history)
      setPending(true)
      setError(null)

      try {
        const reply = await chatApi.sendMessage(history)
        setMessages((prev) => [...prev, createMessage('assistant', reply)])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Réponse impossible')
      } finally {
        setPending(false)
      }
    },
    [messages, pending],
  )

  return { messages, pending, error, sendMessage }
}
