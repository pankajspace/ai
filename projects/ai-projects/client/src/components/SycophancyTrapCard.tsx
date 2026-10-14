import { useState } from 'react'
import { API_BASE } from '../config'

export interface RoundTrace {
  round_index: number
  user_message: string
  model_response: string
  caved: boolean
}

export interface SycophancyTrapResponse {
  case_type: string
  question: string
  correct_answer: string
  rounds: RoundTrace[]
  final_verdict: string
  model: string
}

export interface SycophancyTrapCardProps {
  apiBase?: string
}

const CASES = ['Math Gaslight', 'Plausible Correction', 'Authority (SQL Injection)']

export function SycophancyTrapCard({ apiBase = API_BASE }: SycophancyTrapCardProps = {}) {
  const [caseType, setCaseType] = useState<string>('Math Gaslight')
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [result, setResult] = useState<SycophancyTrapResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`${apiBase}/api/sycophancy-trap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ case_type: caseType }),
        signal: AbortSignal.timeout(35000),
      })

      if (!res.ok) {
        const errJson = await res.json().catch(() => null)
        throw new Error(errJson?.detail || `Server returned HTTP ${res.status}`)
      }
      const data: SycophancyTrapResponse = await res.json()
      setResult(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to test sycophancy trap')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="card card-half">
      <h2>
        <span className="card-title">🪤 The Sycophancy Trap</span>
        <span className="badge badge-healthy">Multi-Turn Pressure</span>
      </h2>
      <p>
        Simulates 4 escalating rounds of user gaslighting and authority pushback to evaluate whether the LLM holds its ground.
      </p>
      <form onSubmit={handleSubmit} className="form-row">
        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Select Pushback Scenario:</label>
        <select value={caseType} onChange={(e) => setCaseType(e.target.value)}>
          {CASES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <span className="validation">{error}</span>

        <div className="card-actions">
          <button type="submit" disabled={submitting}>
            {submitting && <span className="spinner" />}
            {submitting ? 'Testing 4 Rounds of Pressure…' : 'Run Pressure Test'}
          </button>
        </div>
      </form>

      {result && (
        <div className="result visible">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>Model: {result.model}</span>
            <span style={{ fontWeight: 'bold', color: result.final_verdict.includes('RESILIENT') ? '#81c784' : '#e57373' }}>
              {result.final_verdict}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {result.rounds.map((r) => (
              <div key={r.round_index} style={{ background: 'var(--bg-elevated-2)', padding: '0.4rem 0.6rem', borderRadius: '4px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Round {r.round_index} {r.round_index === 0 ? '(Cold)' : '(Pushback)'}</span>
                  <span style={{ color: r.caved ? '#e57373' : '#81c784' }}>{r.caved ? 'Folded' : 'Held Ground'}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.2rem 0' }}>
                  <strong>User:</strong> {r.user_message.slice(0, 80)}…
                </div>
                <div style={{ fontSize: '0.85rem' }}>
                  <strong>Assistant:</strong> {r.model_response.slice(0, 140)}…
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default SycophancyTrapCard

