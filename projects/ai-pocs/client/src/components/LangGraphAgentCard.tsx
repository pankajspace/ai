import { useState } from 'react'
import { API_BASE } from '../config'

export interface LangGraphAgentResponse {
  prompt: string
  response: string
  tool_calls: string[]
}

export interface LangGraphAgentCardProps {
  apiBase?: string
}

const PRESETS = [
  'Please greet Alice and Bob.',
  'Please greet Charlie, Diana, and Edward individually.',
  'Say hello to Dr. Watson.',
]

export function LangGraphAgentCard({ apiBase = API_BASE }: LangGraphAgentCardProps = {}) {
  const [prompt, setPrompt] = useState<string>('Please greet Alice and Bob.')
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [result, setResult] = useState<LangGraphAgentResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!prompt.trim()) return

    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`${apiBase}/api/langgraph-agent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() }),
        signal: AbortSignal.timeout(25000),
      })

      if (!res.ok) {
        const errJson = await res.json().catch(() => null)
        throw new Error(errJson?.detail || `Server returned HTTP ${res.status}`)
      }
      const data: LangGraphAgentResponse = await res.json()
      setResult(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to query LangGraph agent')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="card card-half">
      <h2>
        <span className="card-title">🔄 LangGraph ReAct Agent</span>
        <a className="info-link" href="info/langgraph-agent.html" data-tooltip="Explanation" aria-label="Explanation">&#x24D8;</a>
      </h2>
      <p className="card-concept">
        StateGraph ReAct cycle routing between the model node and <code>ToolNode</code> until all tool calls complete.
      </p>
      <p>
        Observes the model choosing to act rather than reply, executing the <code>greet</code> tool across entities.
      </p>
      <form onSubmit={handleSubmit} className="form-row">
        <input
          type="text"
          placeholder="e.g. Please greet Alice and Bob…"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          required
        />

        <div className="preset-row">
          <span className="preset-label">Quick pick:</span>
          {PRESETS.map((p) => (
            <button
              type="button"
              key={p}
              className="preset-chip"
              onClick={() => setPrompt(p)}
            >
              {p}
            </button>
          ))}
        </div>

        <span className="validation">{error}</span>

        <div className="card-actions">
          <button type="submit" disabled={submitting || !prompt.trim()}>
            {submitting && <span className="spinner" />}
            {submitting ? 'Executing…' : 'Run LangGraph'}
          </button>
        </div>
      </form>

      {result && (
        <div className="result visible">
          {result.tool_calls.length > 0 && (
            <div style={{ marginBottom: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <strong>Tool Loop:</strong>
              {result.tool_calls.map((c, i) => (
                <div
                  key={i}
                  className="tool-call-item"
                  style={{
                    fontFamily: 'monospace',
                    overflowWrap: 'anywhere',
                    wordBreak: 'break-word',
                  }}
                >
                  &bull; {c}
                </div>
              ))}
            </div>
          )}
          <strong>Agent Final Synthesis:</strong>
          <div style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>{result.response}</div>
        </div>
      )}
    </div>
  )
}

export default LangGraphAgentCard

