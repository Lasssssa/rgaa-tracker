import { useState } from 'react'

interface ChatInputProps {
  disabled: boolean
  onSend: (text: string) => void
}

export default function ChatInput({ disabled, onSend }: ChatInputProps) {
  const [text, setText] = useState('')

  function submit() {
    const value = text.trim()
    if (!value || disabled) return
    onSend(value)
    setText('')
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      submit()
    }
  }

  return (
    <form
      className="chat-input"
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
    >
      <textarea
        value={text}
        rows={1}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Écrivez votre message…"
      />
      <button type="submit" className="btn-primary" disabled={disabled || !text.trim()}>
        Envoyer
      </button>
    </form>
  )
}
