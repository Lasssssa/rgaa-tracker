import ChatInput from '../components/chat/ChatInput'
import ChatMessages from '../components/chat/ChatMessages'
import { useChat } from '../hooks/useChat'
import './ChatPage.css'

export default function ChatPage() {
  const { messages, pending, error, sendMessage } = useChat()

  return (
    <main className="chat-page">
      <header className="chat-header">
        <h1>Chat</h1>
        <p className="subtitle">Assistant RGAA (démo — réponses simulées)</p>
      </header>

      <ChatMessages messages={messages} pending={pending} />

      {error && <p className="page-error" role="alert">{error}</p>}

      <ChatInput disabled={pending} onSend={sendMessage} />
    </main>
  )
}
