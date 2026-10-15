import { useState } from 'react'
import { API_BASE } from '../config'

export interface TestCaseEvalResult {
  case_name: string
  prompt: string
  expected_tool: string | null
  actual_tool: string | null
  tool_routing_passed: boolean
  expected_keywords: string[]
  answer_verified: boolean
  overall_passed: boolean
  agent_answer: string
  latency_seconds: number
}

export interface McpEvalsResponse {
  total_cases: number
  passed_cases: number
  failed_cases: number
  accuracy_percentage: number
  results: TestCaseEvalResult[]
  model: string
}

export interface McpEvalsCardProps {
  apiBase?: string
}

export function McpEvalsCard({ apiBase = API_BASE }: McpEvalsCardProps = {}) {
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [result, setResult] = useState<McpEvalsResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleRunEvals = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`${apiBase}/api/mcp-evals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ run_all: true }),
        signal: AbortSignal.timeout(35000),
      })

      if (!res.ok) {
        const errJson = await res.json().catch(() => null)
        throw new Error(errJson?.detail || `Server returned HTTP ${res.status}`)
      }
      const data: McpEvalsResponse = await res.json()
      setResult(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to execute MCP evals suite')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="card card-half">
      <h2>
        <span className="card-title">🧪 FastMCP Evals Suite</span>
        <a className="info-link" href="info/mcp-evals.html" data-tooltip="Explanation" aria-label="Explanation">&#x24D8;</a>
      </h2>
      <p className="card-concept">
        Runs deterministic assertions scoring both expected tool selection and ground-truth token presence across test cases.
      </p>
      <p>
        Automated assertion test suite validating MCP tool selection accuracy and ground truth factual verification.
      </p>
      <form onSubmit={handleRunEvals} className="form-row">
        <span className="validation">{error}</span>

        <div className="card-actions">
          <button type="submit" disabled={submitting}>
            {submitting && <span className="spinner" />}
            {submitting ? 'Running Test Suite…' : 'Run Full Eval Suite'}
          </button>
        </div>
      </form>

      {result && (
        <div className="result visible">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>Model: {result.model}</span>
            <span style={{ fontWeight: 'bold', color: result.accuracy_percentage === 100 ? '#81c784' : '#ffb74d' }}>
              Score: {result.passed_cases}/{result.total_cases} ({result.accuracy_percentage}%)
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {result.results.map((r) => (
              <div key={r.case_name} style={{ background: 'var(--bg-elevated-2)', padding: '0.4rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>{r.case_name}</strong>
                  <span style={{ color: r.overall_passed ? '#81c784' : '#e57373', fontWeight: 'bold' }}>
                    {r.overall_passed ? '✓ PASSED' : '✗ FAILED'}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', margin: '0.2rem 0' }}>
                  Prompt: <em>"{r.prompt}"</em>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>Tool: <code>{r.actual_tool || 'None'}</code> (exp: <code>{r.expected_tool || 'None'}</code>)</span>
                  <span>&bull; Facts: {r.answer_verified ? 'Verified' : 'Missing'}</span>
                  <span>&bull; ⏱ {r.latency_seconds}s</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default McpEvalsCard

