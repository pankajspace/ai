import { useState } from 'react'
import { API_BASE } from '../config'

export interface StrategyOutput {
  strategy_name: string
  raw_output: string
  is_valid_json: boolean
  parsed_data: Record<string, any> | null
  parse_error: string | null
}

export interface VarianceDeterminismResponse {
  strategies: StrategyOutput[]
}

export interface VarianceDeterminismCardProps {
  apiBase?: string
}

const PRESETS = [
  'The new smartphone is amazing, the camera quality is top-notch but the battery life is a bit disappointing. I love the sleek design though! Rating: 4 out of 5 stars.',
  'The laptop has blazing performance and great build quality, but the trackpad feels sticky and the battery lasts only 3 hours under load. Rating: 3/5.',
]

export function VarianceDeterminismCard({ apiBase = API_BASE }: VarianceDeterminismCardProps = {}) {
  const [reviewText, setReviewText] = useState<string>(PRESETS[0])
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [result, setResult] = useState<VarianceDeterminismResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!reviewText.trim()) return

    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`${apiBase}/api/variance-determinism`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ review_text: reviewText.trim() }),
        signal: AbortSignal.timeout(30000),
      })

      if (!res.ok) {
        const errJson = await res.json().catch(() => null)
        throw new Error(errJson?.detail || `Server returned HTTP ${res.status}`)
      }
      const data: VarianceDeterminismResponse = await res.json()
      setResult(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to benchmark variance determinism')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="card card-half">
      <h2>
        <span className="card-title">📐 Structured Output Determinism</span>
        <a className="info-link" href="info/variance-determinism.html" data-tooltip="Explanation" aria-label="Explanation">&#x24D8;</a>
      </h2>
      <p className="card-concept">
        Compares unconstrained text, prompt-requested JSON, and API-enforced <code>json_object</code> schemas with strict <code>json.loads()</code> validation.
      </p>
      <p>
        Evaluates how API schema enforcement turns unpredictable LLM output into reliable machine-parseable data.
      </p>
      <form onSubmit={handleSubmit} className="form-row">
        <textarea
          rows={3}
          placeholder="Enter product review text…"
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          required
        />

        <div className="preset-row">
          <span className="preset-label">Quick pick:</span>
          {PRESETS.map((p, i) => (
            <button
              type="button"
              key={i}
              className="preset-chip"
              onClick={() => setReviewText(p)}
            >
              Review {i + 1}
            </button>
          ))}
        </div>

        <span className="validation">{error}</span>

        <div className="card-actions">
          <button type="submit" disabled={submitting || !reviewText.trim()}>
            {submitting && <span className="spinner" />}
            {submitting ? 'Comparing Constraints…' : 'Test Determinism'}
          </button>
        </div>
      </form>

      {result && (
        <div className="result visible">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {result.strategies.map((s) => (
              <div key={s.strategy_name} style={{ background: 'var(--bg-elevated-2)', padding: '0.4rem 0.6rem', borderRadius: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                  <strong>{s.strategy_name}</strong>
                  <span style={{ color: s.is_valid_json ? '#81c784' : '#e57373', fontWeight: 'bold', fontSize: '0.8rem' }}>
                    {s.is_valid_json ? '✓ Valid JSON' : '✗ Freeform'}
                  </span>
                </div>
                {s.parsed_data ? (
                  <pre style={{ fontSize: '0.75rem', margin: 0, overflowX: 'auto', background: 'var(--bg)', padding: '0.4rem', borderRadius: '3px' }}>
                    {JSON.stringify(s.parsed_data, null, 2)}
                  </pre>
                ) : (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {s.raw_output.slice(0, 120)}…
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default VarianceDeterminismCard

