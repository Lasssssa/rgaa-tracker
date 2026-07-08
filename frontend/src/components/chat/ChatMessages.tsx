import { useEffect, useRef } from 'react'
import type { ChatMessage as ChatMessageType } from '../../types'
import ChatMessage from './ChatMessage'

interface ChatMessagesProps {
  messages: ChatMessageType[]
  pending: boolean
}

export default function ChatMessages({ messages, pending }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, pending])

  if (messages.length === 0 && !pending) {
    return (
      <div className="chat-messages">
        <p className="chat-empty">Posez une question pour démarrer la conversation.</p>
      </div>
    )
  }

  return (
    <div className="chat-messages">
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}
      {pending && (
        <div className="chat-message assistant">
          <div className="chat-bubble chat-typing" aria-label="En train d'écrire">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  )
}
