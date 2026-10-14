import { useState } from 'react'
import { API_BASE } from '../config'

export interface McpAgentResponse {
  question: string
  response: string
  tool_called: string | null
  tool_arguments: Record<string, any> | null
  tool_result: Record<string, any> | null
  provider: string
}

export interface McpAgentCardProps {
  apiBase?: string
}

const PRESETS = [
  'What is the score in India vs West Indies?',
  'How many runs does West Indies need to win?',
  'How many runs has Shubman Gill scored this series?',
  "What is Shai Hope's highest score in the series?",
  'What is 2 + 2?',
]

const CRICKET_DATA = [
  { match: 'IND vs WI', detail: 'IND 287/6 · WI 198/5 (Req 90 off 70b)', query: 'What is the score in India vs West Indies?' },
  { match: 'Shubman Gill', detail: '164 runs, 3 inngs, HS 150', query: 'How many runs has Shubman Gill scored this series?' },
  { match: 'Shai Hope', detail: '131 runs, 2 inngs, HS 78', query: "What is Shai Hope's highest score in the series?" },
]

export function McpAgentCard({ apiBase = API_BASE }: McpAgentCardProps = {}) {
  const [question, setQuestion] = useState<string>(PRESETS[0])
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [result, setResult] = useState<McpAgentResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!question.trim()) return

    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`${apiBase}/api/mcp-agent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.trim() }),
        signal: AbortSignal.timeout(25000),
      })

      if (!res.ok) {
        const errJson = await res.json().catch(() => null)
        throw new Error(errJson?.detail || `Server returned HTTP ${res.status}`)
      }
      const data: McpAgentResponse = await res.json()
      setResult(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to query MCP Agent')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="card card-half">
      <h2>
        <span className="card-title">🏏 FastMCP Cricket Agent</span>
        <span className="badge badge-healthy">MCP + LLM</span>
      </h2>
      <p>
        The LLM decides which FastMCP tool to call and extracts arguments, formulating verified cricket answers.
      </p>

      <details className="data-preview" open>
        <summary>FastMCP Server Knowledge (Match & Player Stats)</summary>
        <div className="data-preview-grid">
          {CRICKET_DATA.map((c) => (
            <span
              key={c.match}
              className="data-tag"
              style={{ cursor: 'pointer' }}
              title={`Click to ask about ${c.match}`}
              onClick={() => setQuestion(c.query)}
            >
              <code>{c.match}</code>: <strong>{c.detail}</strong>
            </span>
          ))}
        </div>
      </details>

      <form onSubmit={handleSubmit} className="form-row">
        <input
          type="text"
          placeholder="e.g. What is the score in India vs West Indies?…"
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
              {p.slice(0, 30)}…
            </button>
          ))}
        </div>

        <span className="validation">{error}</span>

        <div className="card-actions">
          <button type="submit" disabled={submitting || !question.trim()}>
            {submitting && <span className="spinner" />}
            {submitting ? 'Querying FastMCP Agent…' : 'Ask Cricket Agent'}
          </button>
        </div>
      </form>

      {result && (
        <div className="result visible">
          <div style={{ fontSize: '0.75rem', color: 'var(--accent)', marginBottom: '0.4rem' }}>
            Provider: {result.provider}
          </div>
          {result.tool_called ? (
            <div style={{ background: 'var(--bg-elevated-2)', padding: '0.4rem', borderRadius: '4px', marginBottom: '0.4rem', fontSize: '0.8rem' }}>
              🔧 Tool: <code>{result.tool_called}</code> &bull; Args: <code>{JSON.stringify(result.tool_arguments)}</code>
            </div>
          ) : (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-faint)', marginBottom: '0.4rem' }}>
              (No tool needed &bull; Direct Answer)
            </div>
          )}
          <div style={{ marginTop: '0.3rem' }}>{result.response}</div>
        </div>
      )}
    </div>
  )
}

export default McpAgentCard

