import { useState } from 'react'
import { API_BASE } from '../config'

export interface ClassBasedToolsResponse {
  query: string
  response: string
  tool_calls: string[]
  current_inventory: Record<string, number>
  provider: string
}

export interface ClassBasedToolsCardProps {
  apiBase?: string
}

const PRESETS = [
  'Update PROD-456 stock to 25 units, then confirm the new level',
  'Check stock for PROD-123',
  'Update PROD-123 stock to 0 units and check its availability',
]

const INITIAL_INVENTORY = [
  { id: 'PROD-123', qty: 15 },
  { id: 'PROD-456', qty: 0 },
  { id: 'PROD-789', qty: 8 },
]

export function ClassBasedToolsCard({ apiBase = API_BASE }: ClassBasedToolsCardProps = {}) {
  const [query, setQuery] = useState<string>(PRESETS[0])
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [result, setResult] = useState<ClassBasedToolsResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!query.trim()) return

    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`${apiBase}/api/class-based-tools`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() }),
        signal: AbortSignal.timeout(25000),
      })

      if (!res.ok) {
        const errJson = await res.json().catch(() => null)
        throw new Error(errJson?.detail || `Server returned HTTP ${res.status}`)
      }
      const data: ClassBasedToolsResponse = await res.json()
      setResult(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to query Class-Based agent')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="card card-half">
      <h2>
        <span className="card-title">🏛️ Class-Based Tools</span>
        <span className="badge badge-healthy">Shared Resource</span>
      </h2>
      <p>
        Groups tools inside a class instance sharing single database connections to prevent connection pool exhaustion.
      </p>

      <details className="data-preview" open>
        <summary>Stateful Database Inventory (Connection Pool)</summary>
        <div className="data-preview-grid">
          {INITIAL_INVENTORY.map((item) => {
            const currentQty = result?.current_inventory?.[item.id] ?? item.qty
            return (
              <span
                key={item.id}
                className="data-tag"
                style={{ cursor: 'pointer' }}
                title={`Click to check ${item.id} stock`}
                onClick={() => setQuery(`Check stock for ${item.id}`)}
              >
                <code>{item.id}</code>:{' '}
                {currentQty > 0 ? (
                  <strong>{currentQty} in stock</strong>
                ) : (
                  <strong style={{ color: '#ef9a9a' }}>0 (out of stock)</strong>
                )}
              </span>
            )
          })}
        </div>
      </details>

      <form onSubmit={handleSubmit} className="form-row">
        <input
          type="text"
          placeholder="e.g. Update stock or check quantities…"
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
            {submitting ? 'Mutating State…' : 'Execute Operation'}
          </button>
        </div>
      </form>

      {result && (
        <div className="result visible">
          <div style={{ fontSize: '0.75rem', color: 'var(--accent)', marginBottom: '0.4rem' }}>
            Provider: {result.provider}
          </div>
          {result.tool_calls.map((c, i) => (
            <div key={i} style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              🔧 {c}
            </div>
          ))}
          <div style={{ background: 'var(--bg-elevated-2)', padding: '0.4rem', borderRadius: '4px', margin: '0.4rem 0', fontSize: '0.85rem' }}>
            <strong>Live State Store:</strong>
            {Object.entries(result.current_inventory).map(([k, v]) => (
              <span key={k} style={{ marginLeft: '0.6rem' }}>
                <code>{k}</code>: {v}
              </span>
            ))}
          </div>
          <div>{result.response}</div>
        </div>
      )}
    </div>
  )
}

export default ClassBasedToolsCard

