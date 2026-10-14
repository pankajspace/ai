import { useState } from 'react'
import { API_BASE } from '../config'

export interface PrebuiltCalculatorResponse {
  query: string
  response: string
  tool_calls: string[]
  provider: string
}

export interface PrebuiltCalculatorCardProps {
  apiBase?: string
}

const PRESETS = [
  "What's 42 raised to the power of 9?",
  'Calculate the square root of 144 multiplied by 17.5',
  'What is 15% of 850 plus 250?',
]

export function PrebuiltCalculatorCard({ apiBase = API_BASE }: PrebuiltCalculatorCardProps = {}) {
  const [query, setQuery] = useState<string>(PRESETS[0])
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [result, setResult] = useState<PrebuiltCalculatorResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!query.trim()) return

    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`${apiBase}/api/prebuilt-calculator`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() }),
        signal: AbortSignal.timeout(25000),
      })

      if (!res.ok) {
        const errJson = await res.json().catch(() => null)
        throw new Error(errJson?.detail || `Server returned HTTP ${res.status}`)
      }
      const data: PrebuiltCalculatorResponse = await res.json()
      setResult(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to calculate expression')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="card card-half">
      <h2>
        <span className="card-title">🧮 Math Assistant</span>
        <span className="badge badge-healthy">Prebuilt Tool</span>
        <a className="info-link" href="info/prebuilt-calculator.html" data-tooltip="Explanation" aria-label="Explanation">&#x24D8;</a>
      </h2>
      <p>
        Leverages a pre-built mathematical tool and system prompt to solve arithmetic and algebraic calculations.
      </p>
      <form onSubmit={handleSubmit} className="form-row">
        <input
          type="text"
          placeholder="e.g. What's 42 raised to the power of 9?…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          required
        />

        <div className="preset-row">
          <span className="preset-label">Quick pick:</span>
          {PRESETS.map((p) => (
            <button
              type="button"
              key={p}
              className="preset-chip"
              onClick={() => setQuery(p)}
            >
              {p.slice(0, 30)}…
            </button>
          ))}
        </div>

        <span className="validation">{error}</span>

        <div className="card-actions">
          <button type="submit" disabled={submitting || !query.trim()}>
            {submitting && <span className="spinner" />}
            {submitting ? 'Computing…' : 'Compute Math'}
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

export default PrebuiltCalculatorCard

