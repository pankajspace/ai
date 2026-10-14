import { useState } from 'react'
import { API_BASE } from '../config'

export interface StrategyResult {
  name: string
  response_text: string
  extracted_answer: string
  is_correct: boolean
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
  latency_seconds: number
}

export interface PromptingStrategiesResponse {
  question: string
  expected_answer: string
  strategies: StrategyResult[]
  model: string
}

export interface PromptingStrategiesCardProps {
  apiBase?: string
}

const PRESETS = [
  {
    q: 'A shop sells pens at 23 rupees each. Ravi buys 7 pens, returns 2 of them, then buys 4 more. He pays the final bill with a 500 rupee note. How much change does he get? (Answer with the number only)',
    ans: '293',
  },
  {
    q: 'A jacket is priced at 4000 rupees. A 25% discount is applied, then a further 10% off the reduced price, and finally 18% GST is added to that result. What is the final price? (Answer with the number only)',
    ans: '3186',
  },
  {
    q: 'Three printers together print 90 pages in 6 minutes. At the same rate per printer, how many pages would 5 printers print in 10 minutes? (Answer with the number only)',
    ans: '250',
  },
]

export function PromptingStrategiesCard({ apiBase = API_BASE }: PromptingStrategiesCardProps = {}) {
  const [question, setQuestion] = useState<string>(PRESETS[0].q)
  const [expectedAnswer, setExpectedAnswer] = useState<string>(PRESETS[0].ans)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [result, setResult] = useState<PromptingStrategiesResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!question.trim()) return

    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`${apiBase}/api/prompting-strategies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.trim(), expected_answer: expectedAnswer.trim() }),
        signal: AbortSignal.timeout(30000),
      })

      if (!res.ok) {
        const errJson = await res.json().catch(() => null)
        throw new Error(errJson?.detail || `Server returned HTTP ${res.status}`)
      }
      const data: PromptingStrategiesResponse = await res.json()
      setResult(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to benchmark prompting strategies')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="card card-half">
      <h2>
        <span className="card-title">🎯 Prompting Strategies Benchmark</span>
        <span className="badge badge-healthy">Direct vs CoT</span>
      </h2>
      <p>
        Benchmarks Direct vs Zero-Shot CoT vs Few-Shot CoT on multi-step reasoning, measuring accuracy against token costs.
      </p>
      <form onSubmit={handleSubmit} className="form-row">
        <textarea
          rows={3}
          placeholder="Enter problem question…"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Expected Answer (e.g. 293)…"
          value={expectedAnswer}
          onChange={(e) => setExpectedAnswer(e.target.value)}
          required
        />

        <div className="preset-row">
          <span className="preset-label">Quick pick:</span>
          {PRESETS.map((p, idx) => (
            <button
              type="button"
              key={idx}
              className="preset-chip"
              onClick={() => {
                setQuestion(p.q)
                setExpectedAnswer(p.ans)
              }}
            >
              Case {idx + 1} ({p.ans})
            </button>
          ))}
        </div>

        <span className="validation">{error}</span>

        <div className="card-actions">
          <button type="submit" disabled={submitting || !question.trim()}>
            {submitting && <span className="spinner" />}
            {submitting ? 'Benchmarking 3 Strategies…' : 'Benchmark Strategies'}
          </button>
        </div>
      </form>

      {result && (
        <div className="result visible">
          <div style={{ fontSize: '0.75rem', color: 'var(--accent)', marginBottom: '0.4rem' }}>
            Model: {result.model} &bull; Target Answer: <strong>{result.expected_answer}</strong>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {result.strategies.map((s) => (
              <div key={s.name} style={{ background: 'var(--bg-elevated-2)', padding: '0.5rem', borderRadius: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                  <strong>{s.name}</strong>
                  <span style={{ color: s.is_correct ? '#81c784' : '#e57373', fontWeight: 'bold' }}>
                    {s.is_correct ? '✓ Correct' : '✗ Incorrect'}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Tokens: {s.total_tokens} ({s.prompt_tokens} in / {s.completion_tokens} out) &bull; Latency: {s.latency_seconds}s
                </div>
                <div style={{ fontSize: '0.85rem', marginTop: '0.3rem', whiteSpace: 'pre-line' }}>
                  <em>Answer:</em> <code>{s.extracted_answer || 'None'}</code>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default PromptingStrategiesCard
