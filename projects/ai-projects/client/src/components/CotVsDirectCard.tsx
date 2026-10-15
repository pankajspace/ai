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

const PROBLEMS = [
  {
    title: 'Spatial Navigation (Grid)',
    chipLabel: 'Spatial Navigation',
    question:
      'Start at origin (0,0) facing North (+Y direction). Move forward 3 units. Turn right 90 degrees. Move forward 2 units. Turn right 90 degrees. Move forward 5 units. Turn left 90 degrees. Move backward 2 units. What are your exact final (X,Y) coordinates? Format as (X, Y).',
  },
  {
    title: 'Relational Logic (Family Tree)',
    chipLabel: 'Relational Logic',
    question:
      'Alice is the sister of Bob. Bob is the father of Charlie. Charlie is the brother of Diana. Diana is the mother of Eve. What is the exact biological relationship of Alice to Eve?',
  },
  {
    title: 'Temporal Scheduling',
    chipLabel: 'Temporal Scheduling',
    question:
      'Five speakers (A, B, C, D, E) present one after another. E must speak exactly third. B must speak immediately after D. D cannot be the first speaker. C must speak at some point before A. What is the exact sequence of the 5 speakers from first to last? Format as a comma-separated list.',
  },
]

export function CotVsDirectCard({ apiBase = API_BASE }: CotVsDirectCardProps = {}) {
  const [problemTitle, setProblemTitle] = useState<string>(PROBLEMS[0].title)
  const [question, setQuestion] = useState<string>(PROBLEMS[0].question)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [result, setResult] = useState<CotVsDirectResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    setSubmitting(true)
    setError(null)
    try {
      const selectedProblem = PROBLEMS.find((p) => p.title === problemTitle)
      const payload: Record<string, any> = { problem_title: problemTitle }
      if (selectedProblem && question !== selectedProblem.question) {
        payload.custom_question = question
      }

      const res = await fetch(`${apiBase}/api/cot-vs-direct`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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
        <a className="info-link" href="info/cot-vs-direct.html" data-tooltip="Explanation" aria-label="Explanation">&#x24D8;</a>
      </h2>
      <p className="card-concept">
        Evaluates single-sentence direct answers against explicit step-by-step reasoning traces across state-tracking logic tasks.
      </p>
      <p>
        Side-by-side comparison proving that step-by-step reasoning acts as a structural reliability lever on logic problems.
      </p>
      <form onSubmit={handleSubmit} className="form-row">
        <textarea
          rows={3}
          placeholder="Logic problem question…"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          required
        />

        <div className="preset-row">
          <span className="preset-label">Quick pick:</span>
          {PROBLEMS.map((p) => (
            <button
              type="button"
              key={p.title}
              className={`preset-chip ${problemTitle === p.title ? 'active' : ''}`}
              onClick={() => {
                setProblemTitle(p.title)
                setQuestion(p.question)
              }}
            >
              {p.chipLabel}
            </button>
          ))}
        </div>

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

