import { useState } from 'react'
import { API_BASE } from '../config'

export interface ScenarioEvaluation {
  scenario_name: string
  response_text: string
  acknowledged_error: boolean
  gave_error_detail: boolean
  fabricated_data: boolean
}

export interface ToolErrorInjectionResponse {
  scenarios: ScenarioEvaluation[]
}

export interface ToolErrorInjectionCardProps {
  apiBase?: string
}

const PRESETS = [
  'Compare the weather in Tokyo and Paris today.',
  'What is the temperature in Paris right now?',
  'Should I take an umbrella in Paris or Tokyo?',
]

export function ToolErrorInjectionCard({ apiBase = API_BASE }: ToolErrorInjectionCardProps = {}) {
  const [question, setQuestion] = useState<string>(PRESETS[0])
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [result, setResult] = useState<ToolErrorInjectionResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!question.trim()) return

    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`${apiBase}/api/tool-error-injection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.trim() }),
        signal: AbortSignal.timeout(30000),
      })

      if (!res.ok) {
        const errJson = await res.json().catch(() => null)
        throw new Error(errJson?.detail || `Server returned HTTP ${res.status}`)
      }
      const data: ToolErrorInjectionResponse = await res.json()
      setResult(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to test tool error injection')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="card card-half">
      <h2>
        <span className="card-title">⚠️ Tool Error Injection</span>
        <a className="info-link" href="info/tool-error-injection.html" data-tooltip="Explanation" aria-label="Explanation">&#x24D8;</a>
      </h2>
      <p className="card-concept">
        Injects deterministic <code>HTTP 503</code> tool failures to compare plain prompts against reliability prompts that forbid data fabrication.
      </p>
      <p>
        Simulates upstream tool failures (HTTP 503) to test error transparency, error propagation, and hallucination prevention.
      </p>
      <form onSubmit={handleSubmit} className="form-row">
        <input
          type="text"
          placeholder="e.g. Compare weather in Tokyo and Paris…"
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
              className={`preset-chip ${question === p ? 'active' : ''}`}
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
            {submitting ? 'Injecting Outage & Evaluating…' : 'Inject Tool Error'}
          </button>
        </div>
      </form>

      {result && (
        <div className="result visible">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {result.scenarios.map((s) => (
              <div key={s.scenario_name} style={{ background: 'var(--bg-elevated-2)', padding: '0.5rem', borderRadius: '4px' }}>
                <strong>{s.scenario_name}</strong>
                <div style={{ display: 'flex', gap: '0.6rem', margin: '0.3rem 0', fontSize: '0.75rem' }}>
                  <span style={{ color: s.acknowledged_error ? '#81c784' : '#e57373' }}>
                    Ack Error: {s.acknowledged_error ? 'Yes' : 'No'}
                  </span>
                  <span style={{ color: s.gave_error_detail ? '#81c784' : '#ffb74d' }}>
                    Status 503 Surfaced: {s.gave_error_detail ? 'Yes' : 'No'}
                  </span>
                  <span style={{ color: !s.fabricated_data ? '#81c784' : '#e57373', fontWeight: 'bold' }}>
                    Hallucinated Weather: {s.fabricated_data ? 'Yes (Bad)' : 'None (Good)'}
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem' }}>{s.response_text}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ToolErrorInjectionCard

