import { useState } from 'react'
import { API_BASE } from '../config'

export interface CustomInventoryResponse {
  question: string
  response: string
  tool_calls: string[]
  provider: string
}

export interface CustomInventoryCardProps {
  apiBase?: string
}

const PRESETS = [
  'Is PROD-123 in stock?',
  'Do we have PROD-456 available in our inventory?',
  'Check inventory for PROD-789',
  'Can I order 5 units of PROD-123 right now?',
]

export function CustomInventoryCard({ apiBase = API_BASE }: CustomInventoryCardProps = {}) {
  const [question, setQuestion] = useState<string>(PRESETS[0])
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [result, setResult] = useState<CustomInventoryResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!question.trim()) return

    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`${apiBase}/api/custom-inventory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.trim() }),
        signal: AbortSignal.timeout(25000),
      })

      if (!res.ok) {
        const errJson = await res.json().catch(() => null)
        throw new Error(errJson?.detail || `Server returned HTTP ${res.status}`)
      }
      const data: CustomInventoryResponse = await res.json()
      setResult(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to query Custom Inventory agent')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="card card-half">
      <h2>
        <span className="card-title">📦 Custom Inventory Tool</span>
        <span className="badge badge-healthy">Domain Tool</span>
      </h2>
      <p>
        Queries proprietary catalog data using a custom domain tool (<code>check_inventory</code>) for product stock.
      </p>
      <form onSubmit={handleSubmit} className="form-row">
        <input
          type="text"
          placeholder="e.g. Is PROD-123 in stock?…"
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
              {p.slice(0, 26)}…
            </button>
          ))}
        </div>

        <span className="validation">{error}</span>

        <div className="card-actions">
          <button type="submit" disabled={submitting || !question.trim()}>
            {submitting && <span className="spinner" />}
            {submitting ? 'Querying…' : 'Check Inventory'}
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

export default CustomInventoryCard

