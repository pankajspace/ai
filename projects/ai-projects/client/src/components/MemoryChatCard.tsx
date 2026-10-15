import { useState } from 'react'
import { API_BASE } from '../config'

export interface ChatMessage {
  role: string
  content: string
}

export interface MemoryChatResponse {
  message: string
  response: string
  history: ChatMessage[]
}

export interface MemoryChatCardProps {
  apiBase?: string
}

const CHAT_PRESETS = [
  'My favorite color is navy blue.',
  'What is my favorite color?',
  'I am traveling to Kyoto next month.',
  'Which city did I say I am visiting?',
  'What else do you remember about me?',
]

export function MemoryChatCard({ apiBase = API_BASE }: MemoryChatCardProps = {}) {
  const [message, setMessage] = useState<string>('My favorite color is navy blue.')
  const [history, setHistory] = useState<ChatMessage[]>([])
  const [submittingChat, setSubmittingChat] = useState<boolean>(false)
  const [chatError, setChatError] = useState<string | null>(null)

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const trimmedMessage = message.trim()
    if (!trimmedMessage) return

    setSubmittingChat(true)
    setChatError(null)

    try {
      const res = await fetch(`${apiBase}/api/memory-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmedMessage,
          history,
        }),
        signal: AbortSignal.timeout(25000),
      })

      if (!res.ok) {
        const errJson = await res.json().catch(() => null)
        throw new Error(errJson?.detail || `Server returned HTTP ${res.status}`)
      }

      const data: MemoryChatResponse = await res.json()
      setHistory(data.history)
      setMessage('')
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'TimeoutError') {
        setChatError('Request timed out after 25 seconds. Please verify server connection and API credentials.')
      } else {
        setChatError(err instanceof Error ? err.message : 'Failed to send message to chat model')
      }
    } finally {
      setSubmittingChat(false)
    }
  }

  const handleClearHistory = () => {
    setHistory([])
    setChatError(null)
  }

  return (
    <div className="card card-half">
      <h2>
        <span className="card-title">🧠 Conversational Memory</span>
        <a className="info-link" href="info/memory-chat.html" data-tooltip="Explanation" aria-label="Explanation">&#x24D8;</a>
      </h2>
      <p className="card-concept">
        Injects prior user and assistant turns into the prompt context via <code>MessagesPlaceholder</code>.
      </p>
      <p>
        Multi-turn chat using LangChain LCEL with dynamic message history retention.
      </p>

      <form onSubmit={handleSendMessage} className="form-row">
        <input
          type="text"
          placeholder="Ask or say something (e.g. My favorite color is blue)…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />

        <div className="preset-row">
          <span className="preset-label">Quick pick:</span>
          {CHAT_PRESETS.map((preset) => (
            <button
              type="button"
              key={preset}
              className="preset-chip"
              onClick={() => setMessage(preset)}
            >
              {preset}
            </button>
          ))}
        </div>

        <span className="validation">{chatError}</span>

        <div className="card-actions">
          <button type="submit" disabled={submittingChat || !message.trim()}>
            {submittingChat && <span className="spinner" />}
            {submittingChat ? 'Thinking…' : 'Send Message'}
          </button>
          {history.length > 0 && (
            <button
              type="button"
              onClick={handleClearHistory}
              className="preset-chip"
              style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
            >
              Clear Memory ({history.length} msgs)
            </button>
          )}
        </div>
      </form>

      {history.length > 0 && (
        <div
          className="result visible"
          style={{
            maxHeight: '180px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            whiteSpace: 'normal',
          }}
        >
          {history.map((msg, idx) => {
            const isUser = msg.role.toLowerCase() === 'user' || msg.role.toLowerCase() === 'human'
            return (
              <div key={idx} style={{ lineHeight: '1.4' }}>
                <span
                  style={{
                    color: isUser ? 'var(--accent)' : '#81c784',
                    fontWeight: 600,
                    marginRight: '0.4rem',
                  }}
                >
                  {isUser ? 'You:' : 'Assistant:'}
                </span>
                <span>{msg.content}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default MemoryChatCard

