import { useState } from 'react'
import { API_BASE } from '../config'

export interface RedisAgentToolCall {
  tool: string
  args: Record<string, unknown>
  result: Record<string, unknown>
}

export interface RedisAgentResponse {
  session_id: string
  message: string
  answer: string
  tool_calls: RedisAgentToolCall[]
  stored_messages_count: number
  storage_backend: string
}

export interface RedisAgentCardProps {
  apiBase?: string
}

const REDIS_PRESETS = [
  'What is 23*47, and what time is it right now?',
  'Multiply the previous math answer by 2 and remember my name is Asha.',
  'What is my name and what was the final number we calculated?',
]

export function RedisAgentCard({ apiBase = API_BASE }: RedisAgentCardProps = {}) {
  const [sessionId, setSessionId] = useState<string>('demo')
  const [message, setMessage] = useState<string>(REDIS_PRESETS[0])
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [result, setResult] = useState<RedisAgentResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSend = async (e?: React.FormEvent, resetSession = false) => {
    if (e) e.preventDefault()
    if (!resetSession && !message.trim()) return

    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch(`${apiBase}/api/redis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId.trim() || 'demo',
          message: resetSession ? '' : message.trim(),
          reset_session: resetSession,
        }),
        signal: AbortSignal.timeout(25000),
      })

      if (!res.ok) {
        const errJson = await res.json().catch(() => null)
        throw new Error(errJson?.detail || `Server returned HTTP ${res.status}`)
      }

      const data: RedisAgentResponse = await res.json()
      setResult(data)
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'TimeoutError') {
        setError('Request timed out after 25 seconds.')
      } else {
        setError(err instanceof Error ? err.message : 'Failed to run Redis support agent')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="card card-half">
      <h2>
        <span className="card-title">⚡ Redis Support Agent Memory</span>
        <a className="info-link" href="info/redis.html" data-tooltip="Explanation" aria-label="Explanation">&#x24D8;</a>
      </h2>
      <p className="card-concept">
        Persists multi-turn conversation history per <code>session_id</code> with TTL expiry and equips an OpenAI function-calling agent with <code>calculator</code> and <code>get_datetime</code> tools.
      </p>
      <p>
        Test stateful multi-turn agent memory across turns with math calculation and live UTC/IST clock tools.
      </p>

      <form onSubmit={(e) => handleSend(e, false)} className="form-row">
        <div className="input-row">
          <div className="input-group" style={{ flex: 1 }}>
            <label htmlFor="redis-message">Message the agent</label>
            <input
              id="redis-message"
              type="text"
              placeholder="Ask a math, time, or follow-up question…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>
          <div className="input-group" style={{ flex: '0 0 110px' }}>
            <label htmlFor="redis-session">Session ID</label>
            <input
              id="redis-session"
              type="text"
              placeholder="demo"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              aria-label="Session ID"
            />
          </div>
        </div>

        <div className="preset-row">
          <span className="preset-label">Multi-turn sequence:</span>
          {REDIS_PRESETS.map((preset) => (
            <button
              type="button"
              key={preset}
              className={`preset-chip ${message === preset ? 'active' : ''}`}
              onClick={() => setMessage(preset)}
            >
              {preset}
            </button>
          ))}
        </div>

        <span className="validation">{error}</span>

        <div className="card-actions">
          <button type="submit" disabled={submitting || !message.trim()}>
            {submitting && <span className="spinner" />}
            {submitting ? 'Running Agent…' : 'Send to Agent'}
          </button>
          <button
            type="button"
            className="preset-chip"
            style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
            disabled={submitting}
            onClick={() => handleSend(undefined, true)}
          >
            Reset Memory
          </button>
        </div>
      </form>

      {result && (
        <div className="result visible">
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
            <span>
              Session: <code>{result.session_id}</code> ({result.storage_backend})
            </span>
            <span>{result.stored_messages_count} messages stored</span>
          </div>

          <div style={{ marginBottom: '0.5rem' }}>
            <strong>Agent Response:</strong>
            <div style={{ marginTop: '4px', color: 'var(--text)' }}>
              {result.answer}
            </div>
          </div>

          {result.tool_calls && result.tool_calls.length > 0 && (
            <div style={{ marginTop: '0.6rem', borderTop: '1px solid var(--border)', paddingTop: '0.4rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>
                Tools Invoked ({result.tool_calls.length}):
              </div>
              {result.tool_calls.map((tc, idx) => (
                <div
                  key={idx}
                  style={{
                    fontSize: '0.75rem',
                    background: 'rgba(0,0,0,0.25)',
                    padding: '4px 8px',
                    borderRadius: '3px',
                    marginBottom: '4px',
                    borderLeft: '2px solid var(--accent)',
                  }}
                >
                  <code>{tc.tool}({JSON.stringify(tc.args)})</code> &rarr; <code>{JSON.stringify(tc.result)}</code>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default RedisAgentCard


