import { useState } from 'react'
import { API_BASE } from '../config'

export interface MultiPrebuiltToolsResponse {
  task: string
  response: string
  tool_sequence: string[]
  written_files: Record<string, string>
  provider: string
}

export interface MultiPrebuiltToolsCardProps {
  apiBase?: string
}

const PRESETS = [
  'Fetch crypto data from https://api.coindesk.com/v1/bpi/currentprice.json, extract USD rate, and write a summary to crypto_summary.txt',
  'Query https://httpbin.org/json, extract author, and save it to author_info.txt',
]

export function MultiPrebuiltToolsCard({ apiBase = API_BASE }: MultiPrebuiltToolsCardProps = {}) {
  const [task, setTask] = useState<string>(PRESETS[0])
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [result, setResult] = useState<MultiPrebuiltToolsResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!task.trim()) return

    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`${apiBase}/api/multi-prebuilt-tools`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: task.trim() }),
        signal: AbortSignal.timeout(30000),
      })

      if (!res.ok) {
        const errJson = await res.json().catch(() => null)
        throw new Error(errJson?.detail || `Server returned HTTP ${res.status}`)
      }
      const data: MultiPrebuiltToolsResponse = await res.json()
      setResult(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to execute multi-tool pipeline')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="card card-half">
      <h2>
        <span className="card-title">🔗 Multi-Prebuilt Tools</span>
        <a className="info-link" href="info/multi-prebuilt-tools.html" data-tooltip="Explanation" aria-label="Explanation">&#x24D8;</a>
      </h2>
      <p className="card-concept">
        Chains pre-built <code>http_request</code>, <code>calculator</code>, and <code>file_write</code> tools in a single multi-step pipeline.
      </p>
      <p>
        Executes multi-step workflows chaining HTTP fetch, numerical calculation, and automated file output.
      </p>
      <form onSubmit={handleSubmit} className="form-row">
        <input
          type="text"
          placeholder="e.g. Fetch data and save summary to file…"
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
              className="preset-chip"
              onClick={() => setTask(p)}
            >
              {p.slice(0, 32)}…
            </button>
          ))}
        </div>

        <span className="validation">{error}</span>

        <div className="card-actions">
          <button type="submit" disabled={submitting || !task.trim()}>
            {submitting && <span className="spinner" />}
            {submitting ? 'Running Chained Tools…' : 'Execute Chained Tools'}
          </button>
        </div>
      </form>

      {result && (
        <div className="result visible">
          <div style={{ fontSize: '0.75rem', color: 'var(--accent)', marginBottom: '0.4rem' }}>
            Provider: {result.provider}
          </div>
          {result.tool_sequence.length > 0 && (
            <div style={{ marginBottom: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <strong>Execution Trace:</strong>
              {result.tool_sequence.map((c, i) => (
                <div key={i} style={{ fontFamily: 'monospace' }}>&bull; {c}</div>
              ))}
            </div>
          )}
          {Object.keys(result.written_files).length > 0 && (
            <div style={{ background: 'var(--bg-elevated-2)', padding: '0.5rem', borderRadius: '4px', marginBottom: '0.5rem' }}>
              <strong>Saved File Artifacts:</strong>
              {Object.entries(result.written_files).map(([fname, content]) => (
                <div key={fname} style={{ fontSize: '0.8rem', marginTop: '0.2rem' }}>
                  <code>{fname}</code>: <em>{content}</em>
                </div>
              ))}
            </div>
          )}
          <div>{result.response}</div>
        </div>
      )}
    </div>
  )
}

export default MultiPrebuiltToolsCard

