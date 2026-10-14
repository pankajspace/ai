import { useState } from 'react'
import { API_BASE } from '../config'

export interface FunctionToToolResponse {
  question: string
  response: string
  tool_calls: string[]
  provider: string
}

export interface FunctionToToolCardProps {
  apiBase?: string
}

const PRESETS = [
  'Is the staging server running? Check https://httpbin.org/get',
  'Can you verify if https://httpbin.org/status/200 is healthy?',
  'What is the status of https://httpbin.org/status/500?',
]

export function FunctionToToolCard({ apiBase = API_BASE }: FunctionToToolCardProps = {}) {
  const [question, setQuestion] = useState<string>('Is the staging server running? Check https://httpbin.org/get')
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [result, setResult] = useState<FunctionToToolResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!question.trim()) return

    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`${apiBase}/api/function-to-tool`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.trim() }),
        signal: AbortSignal.timeout(25000),
      })

      if (!res.ok) {
        const errJson = await res.json().catch(() => null)
        throw new Error(errJson?.detail || `Server returned HTTP ${res.status}`)
      }
      const data: FunctionToToolResponse = await res.json()
      setResult(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to query Function-to-Tool agent')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="card card-half">
      <h2>
        <span className="card-title">🔌 Function to Tool</span>
        <span className="badge badge-healthy">@tool Decorator</span>
        <a className="info-link" href="info/function-to-tool.html" data-tooltip="Explanation" aria-label="Explanation">&#x24D8;</a>
      </h2>
      <p>
        Exposes a Python function with docstrings and type hints as an agent tool to check live HTTP server health.
      </p>
      <form onSubmit={handleSubmit} className="form-row">
        <input
          type="text"
          placeholder="Ask to check a server URL…"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          required
        />

        <div className="preset-row">
          <span className="preset-label">Quick pick:</span>
          {PRESETS.map((p) => (
            <button
              type="button"
              key={p}
              className="preset-chip"
              onClick={() => setQuestion(p)}
            >
              {p.slice(0, 32)}…
            </button>
          ))}
        </div>

        <span className="validation">{error}</span>

        <div className="card-actions">
          <button type="submit" disabled={submitting || !question.trim()}>
            {submitting && <span className="spinner" />}
            {submitting ? 'Checking…' : 'Check URL Status'}
          </button>
        </div>
      </form>

      {result && (
        <div className="result visible">
          <div style={{ fontSize: '0.75rem', color: 'var(--accent)', marginBottom: '0.4rem' }}>
            Provider: {result.provider}
          </div>
          {result.tool_calls.map((c, i) => (
            <div key={i} style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              🔧 {c}
            </div>
          ))}
          <div style={{ marginTop: '0.4rem' }}>{result.response}</div>
        </div>
      )}
    </div>
  )
}

export default FunctionToToolCard

