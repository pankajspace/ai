import { useState } from 'react'
import { API_BASE } from '../config'

export interface ConditionResult {
  condition_code: string
  condition_label: string
  selected_tool: string | null
  is_correct_routing: boolean
}

export interface ToolSchemaCalibrationResponse {
  target_intent: string
  condition_results: ConditionResult[]
  analysis_summary: string
}

export interface ToolSchemaCalibrationCardProps {
  apiBase?: string
}

const PRESETS = [
  'What is the current hourly precipitation forecast for Seattle?',
  'Give me the expected rainfall accumulation for tonight in Boston.',
  'Will it rain in London during the next 4 hours?',
]

export function ToolSchemaCalibrationCard({ apiBase = API_BASE }: ToolSchemaCalibrationCardProps = {}) {
  const [query, setQuery] = useState<string>(PRESETS[0])
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [result, setResult] = useState<ToolSchemaCalibrationResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!query.trim()) return

    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`${apiBase}/api/tool-schema-calibration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() }),
        signal: AbortSignal.timeout(30000),
      })

      if (!res.ok) {
        const errJson = await res.json().catch(() => null)
        throw new Error(errJson?.detail || `Server returned HTTP ${res.status}`)
      }
      const data: ToolSchemaCalibrationResponse = await res.json()
      setResult(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to calibrate schema routing')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="card card-half">
      <h2>
        <span className="card-title">🔬 Tool Schema Calibration</span>
        <a className="info-link" href="info/tool-schema-calibration.html" data-tooltip="Explanation" aria-label="Explanation">&#x24D8;</a>
      </h2>
      <p className="card-concept">
        Tests 4 schema conditions (<code>A</code>&ndash;<code>D</code>) to isolate how strongly tool selection depends on function identifiers versus docstrings.
      </p>
      <p>
        Measures whether LLMs route on function names or docstring descriptions across a 2x2 matrix of descriptive/opaque names and tight/loose docstrings.
      </p>
      <form onSubmit={handleSubmit} className="form-row">
        <input
          type="text"
          placeholder="e.g. Precipitation forecast query…"
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
            {submitting ? 'Calibrating 4 Conditions…' : 'Run 2x2 Matrix'}
          </button>
        </div>
      </form>

      {result && (
        <div className="result visible">
          <div style={{ fontSize: '0.75rem', color: 'var(--accent)', marginBottom: '0.4rem' }}>
            Target Intent: <strong>{result.target_intent}</strong>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginBottom: '0.5rem' }}>
            {result.condition_results.map((c) => (
              <div key={c.condition_code} style={{ background: 'var(--bg-elevated-2)', padding: '0.4rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>Condition {c.condition_code}</strong>
                  <span style={{ color: c.is_correct_routing ? '#81c784' : '#e57373', fontWeight: 'bold' }}>
                    {c.is_correct_routing ? '✓ Routed' : '✗ Misrouted'}
                  </span>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-faint)' }}>{c.condition_label}</div>
                <div style={{ marginTop: '0.2rem' }}>Tool: <code>{c.selected_tool}</code></div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{result.analysis_summary}</div>
        </div>
      )}
    </div>
  )
}

export default ToolSchemaCalibrationCard

