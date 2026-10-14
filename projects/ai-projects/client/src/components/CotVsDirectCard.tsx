import { useState } from 'react'
import { API_BASE } from '../config'

export interface CotVsDirectResult {
  strategy: string
  response: string
  extracted_answer: string
  is_correct: boolean
  latency_seconds: number
}

export interface CotVsDirectResponse {
  problem_title: string
  question: string
  accepted_answers: string[]
  direct_result: CotVsDirectResult
  cot_result: CotVsDirectResult
  model: string
}

export interface CotVsDirectCardProps {
  apiBase?: string
}

const PROBLEMS = ['Spatial Navigation (Grid)', 'Relational Logic (Family Tree)', 'Temporal Scheduling']

export function CotVsDirectCard({ apiBase = API_BASE }: CotVsDirectCardProps = {}) {
  const [problemTitle, setProblemTitle] = useState<string>(PROBLEMS[0])
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [result, setResult] = useState<CotVsDirectResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`${apiBase}/api/cot-vs-direct`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problem_title: problemTitle }),
        signal: AbortSignal.timeout(30000),
      })

      if (!res.ok) {
        const errJson = await res.json().catch(() => null)
        throw new Error(errJson?.detail || `Server returned HTTP ${res.status}`)
      }
      const data: CotVsDirectResponse = await res.json()
      setResult(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to benchmark CoT vs Direct')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="card card-half">
      <h2>
        <span className="card-title">🧩 CoT vs Direct Benchmark</span>
        <span className="badge badge-healthy">Reliability Lever</span>
      </h2>
      <p>
        Side-by-side comparison proving that step-by-step reasoning acts as a structural reliability lever on logic problems.
      </p>
      <form onSubmit={handleSubmit} className="form-row">
        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Select Logic Problem:</label>
        <select value={problemTitle} onChange={(e) => setProblemTitle(e.target.value)}>
          {PROBLEMS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        <span className="validation">{error}</span>

        <div className="card-actions">
          <button type="submit" disabled={submitting}>
            {submitting && <span className="spinner" />}
            {submitting ? 'Comparing Strategies…' : 'Run Side-by-Side'}
          </button>
        </div>
      </form>

      {result && (
        <div className="result visible">
          <div style={{ fontSize: '0.75rem', color: 'var(--accent)', marginBottom: '0.4rem' }}>
            Problem: {result.problem_title} &bull; Expected: <code>{result.accepted_answers.join(' / ')}</code>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <div style={{ background: 'var(--bg-elevated-2)', padding: '0.5rem', borderRadius: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                <strong>Direct Answer</strong>
                <span style={{ color: result.direct_result.is_correct ? '#81c784' : '#e57373', fontWeight: 'bold' }}>
                  {result.direct_result.is_correct ? '✓ Pass' : '✗ Fail'}
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>⏱ {result.direct_result.latency_seconds}s</div>
              <div style={{ fontSize: '0.8rem', marginTop: '0.3rem' }}>{result.direct_result.response}</div>
            </div>

            <div style={{ background: 'var(--bg-elevated-2)', padding: '0.5rem', borderRadius: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                <strong>Chain-of-Thought</strong>
                <span style={{ color: result.cot_result.is_correct ? '#81c784' : '#e57373', fontWeight: 'bold' }}>
                  {result.cot_result.is_correct ? '✓ Pass' : '✗ Fail'}
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>⏱ {result.cot_result.latency_seconds}s</div>
              <div style={{ fontSize: '0.8rem', marginTop: '0.3rem', whiteSpace: 'pre-line' }}>{result.cot_result.response.slice(0, 160)}…</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CotVsDirectCard

