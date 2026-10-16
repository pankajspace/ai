import { useState } from 'react'
import { API_BASE } from '../config'

export interface MultiToolSalesResponse {
  task: string
  response: string
  tool_calls: string[]
}

export interface MultiToolSalesCardProps {
  apiBase?: string
}

const PRESETS = [
  "Pull last quarter's sales data and email a summary to the team",
  "Fetch Q3 sales metrics, analyze deal performance, and email the results to leadership@company.com",
  "Get sales data for Q4 and send an email report to sales-team@company.com",
]

// get_sales_data is a mock tool: it returns the same numbers for every quarter
const SALES_DATA = ['Q1', 'Q2', 'Q3', 'Q4'].map((quarter) => ({ quarter, revenue: '$1.25M', deals: 47 }))

export function MultiToolSalesCard({ apiBase = API_BASE }: MultiToolSalesCardProps = {}) {
  const [task, setTask] = useState<string>(PRESETS[0])
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [result, setResult] = useState<MultiToolSalesResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!task.trim()) return

    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`${apiBase}/api/multi-tool-sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: task.trim() }),
        signal: AbortSignal.timeout(25000),
      })

      if (!res.ok) {
        const errJson = await res.json().catch(() => null)
        throw new Error(errJson?.detail || `Server returned HTTP ${res.status}`)
      }
      const data: MultiToolSalesResponse = await res.json()
      setResult(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to query Sales Pipeline agent')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="card card-half">
      <h2>
        <span className="card-title">📈 Sales Pipeline Agent</span>
        <a className="info-link" href="info/multi-tool-sales.html" data-tooltip="Explanation" aria-label="Explanation">&#x24D8;</a>
      </h2>
      <p className="card-concept">
        Resolves data dependencies across unordered tools by feeding each step&apos;s output into the next tool call&apos;s arguments.
      </p>
      <p>
        Autonomous planning across 3 unordered tools: <code>get_sales_data</code> &rarr; <code>analyze_sales</code> &rarr; <code>send_email</code>.
      </p>

      <details className="data-preview" open>
        <summary>Mock sales data (same numbers for every quarter)</summary>
        <div className="data-preview-grid">
          {SALES_DATA.map((s) => (
            <span
              key={s.quarter}
              className="data-tag"
              style={{ cursor: 'pointer' }}
              title={`Click to report ${s.quarter} sales`}
              onClick={() =>
                setTask(
                  `Get sales data for ${s.quarter}, analyze metrics, and email report to team@company.com`
                )
              }
            >
              <code>{s.quarter}</code>: <strong>{s.revenue}</strong> ({s.deals} deals)
            </span>
          ))}
        </div>
      </details>

      <form onSubmit={handleSubmit} className="form-row">
        <input
          type="text"
          placeholder="e.g. Pull sales data and email report…"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          required
        />

        <div className="preset-row">
          <span className="preset-label">Quick pick:</span>
          {PRESETS.map((p) => (
            <button
              type="button"
              key={p}
              className={`preset-chip ${task === p ? 'active' : ''}`}
              onClick={() => setTask(p)}
            >
              {p.slice(0, 30)}…
            </button>
          ))}
        </div>

        <span className="validation">{error}</span>

        <div className="card-actions">
          <button type="submit" disabled={submitting || !task.trim()}>
            {submitting && <span className="spinner" />}
            {submitting ? 'Orchestrating…' : 'Run Pipeline'}
          </button>
        </div>
      </form>

      {result && (
        <div className="result visible">
          {result.tool_calls.length > 0 && (
            <div style={{ marginBottom: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <strong>Execution Plan:</strong>
              {result.tool_calls.map((step, i) => (
                <div
                  key={i}
                  className="tool-call-item"
                  style={{
                    fontFamily: 'monospace',
                    overflowWrap: 'anywhere',
                    wordBreak: 'break-word',
                  }}
                >
                  &bull; {step}
                </div>
              ))}
            </div>
          )}
          <strong>Dispatch Outcome:</strong>
          <div style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>{result.response}</div>
        </div>
      )}
    </div>
  )
}

export default MultiToolSalesCard

