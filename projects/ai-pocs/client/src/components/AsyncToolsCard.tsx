import { useState } from 'react'
import { API_BASE } from '../config'

export interface AsyncToolsResponse {
  query: string
  response: string
  warehouse_results: Record<string, number>
  parallel_duration_seconds: number
  sequential_baseline_seconds: number
  tool_calls: string[]
  provider: string
}

export interface AsyncToolsCardProps {
  apiBase?: string
}

const PRESETS = [
  'Can we ship 100 units of PROD-123? Check all warehouses: east, west, and central.',
  'Check warehouse inventory for PROD-456 across east, west, and central to see if we have 30 units.',
  'Which warehouse has the highest stock of PROD-123: east, west, or central?',
]

const WAREHOUSES = [
  { name: 'East', stock: 'PROD-123: 45, PROD-456: 12' },
  { name: 'West', stock: 'PROD-123: 30, PROD-456: 0' },
  { name: 'Central', stock: 'PROD-123: 60, PROD-456: 25' },
]

export function AsyncToolsCard({ apiBase = API_BASE }: AsyncToolsCardProps = {}) {
  const [query, setQuery] = useState<string>(PRESETS[0])
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [result, setResult] = useState<AsyncToolsResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!query.trim()) return

    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`${apiBase}/api/async-tools`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() }),
        signal: AbortSignal.timeout(25000),
      })

      if (!res.ok) {
        const errJson = await res.json().catch(() => null)
        throw new Error(errJson?.detail || `Server returned HTTP ${res.status}`)
      }
      const data: AsyncToolsResponse = await res.json()
      setResult(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to query Async Tools agent')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="card card-half">
      <h2>
        <span className="card-title">⚡ Async Parallel Tools</span>
        <a className="info-link" href="info/async-tools.html" data-tooltip="Explanation" aria-label="Explanation">&#x24D8;</a>
      </h2>
      <p className="card-concept">
        Dispatches parallel warehouse queries concurrently with <code>asyncio.gather</code> and compares total elapsed time against sequential execution.
      </p>
      <p>
        Executes concurrent async warehouse lookups simultaneously, slashing latency compared to sequential queries.
      </p>

      <details className="data-preview" open>
        <summary>In-Memory Distributed Warehouses (3 locations)</summary>
        <div className="data-preview-grid">
          {WAREHOUSES.map((w) => (
            <span
              key={w.name}
              className="data-tag"
              style={{ cursor: 'pointer' }}
              title={`Click to check ${w.name} warehouse`}
              onClick={() => setQuery(`How many units of PROD-123 and PROD-456 are in ${w.name} warehouse?`)}
            >
              <code>{w.name}</code>: <strong>{w.stock}</strong>
            </span>
          ))}
        </div>
      </details>

      <form onSubmit={handleSubmit} className="form-row">
        <input
          type="text"
          placeholder="e.g. Check all warehouses for 100 units…"
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
            {submitting ? 'Running Parallel Lookups…' : 'Run Parallel Query'}
          </button>
        </div>
      </form>

      {result && (
        <div className="result visible">
          <div style={{ fontSize: '0.75rem', color: 'var(--accent)', marginBottom: '0.4rem' }}>
            Provider: {result.provider}
          </div>
          <div style={{ display: 'flex', gap: '1rem', background: 'var(--bg-elevated-2)', padding: '0.4rem 0.6rem', borderRadius: '4px', margin: '0.4rem 0', fontSize: '0.85rem' }}>
            <div>🚀 Parallel: <strong>{result.parallel_duration_seconds}s</strong></div>
            <div>🐢 Sequential Baseline: <strong>{result.sequential_baseline_seconds}s</strong></div>
          </div>
          {result.tool_calls.map((c, i) => (
            <div key={i} style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              ⚡ {c}
            </div>
          ))}
          <div style={{ marginTop: '0.4rem' }}>{result.response}</div>
        </div>
      )}
    </div>
  )
}

export default AsyncToolsCard

