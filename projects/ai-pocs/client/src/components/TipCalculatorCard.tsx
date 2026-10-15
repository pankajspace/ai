import { useState } from 'react'
import { API_BASE } from '../config'

export interface TipCalculatorResponse {
  query: string
  response: string
  tool_calls: string[]
}

export interface TipCalculatorCardProps {
  apiBase?: string
}

const PRESETS = [
  "The bill is $85. What's a 20% tip, and how much does each person pay if we're splitting it 4 ways?",
  "What's a 15% tip on $42 for a solo diner?",
  "Bill is $120, we want to tip 18%, split between 3 people",
]

export function TipCalculatorCard({ apiBase = API_BASE }: TipCalculatorCardProps = {}) {
  const [query, setQuery] = useState<string>(PRESETS[0])
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [result, setResult] = useState<TipCalculatorResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!query.trim()) return

    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`${apiBase}/api/tip-calculator`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() }),
        signal: AbortSignal.timeout(25000),
      })

      if (!res.ok) {
        const errJson = await res.json().catch(() => null)
        throw new Error(errJson?.detail || `Server returned HTTP ${res.status}`)
      }
      const data: TipCalculatorResponse = await res.json()
      setResult(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to query Tip Calculator agent')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="card card-half">
      <h2>
        <span className="card-title">💵 Tip & Split Agent</span>
        <a className="info-link" href="info/tip-calculator.html" data-tooltip="Explanation" aria-label="Explanation">&#x24D8;</a>
      </h2>
      <p className="card-concept">
        Extracts structured numeric arguments (<code>bill_amount</code>, <code>tip_percent</code>, <code>split_ways</code>) from freeform text to call <code>calculate_tip</code>.
      </p>
      <p>
        Interprets natural language bill and tip queries without regex, invoking the tip calculator tool directly.
      </p>
      <form onSubmit={handleSubmit} className="form-row">
        <input
          type="text"
          placeholder="e.g. Bill is $90 with 18% tip split 3 ways…"
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
            {submitting ? 'Calculating…' : 'Calculate Tip'}
          </button>
        </div>
      </form>

      {result && (
        <div className="result visible">
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

export default TipCalculatorCard

