import type { ChatMessage as ChatMessageType } from '../../types'

interface ChatMessageProps {
  message: ChatMessageType
}

export default function ChatMessage({ message }: ChatMessageProps) {
  return (
    <div className={`chat-message ${message.role}`}>
      <div className="chat-bubble">{message.content}</div>
    </div>
  )
}
