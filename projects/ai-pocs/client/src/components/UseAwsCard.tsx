import { useState } from 'react'
import { API_BASE } from '../config'

export interface UseAwsResponse {
  prompt: string
  response: string
  operations_executed: string[]
}

export interface UseAwsCardProps {
  apiBase?: string
}

const PRESETS = [
  'List all S3 buckets in my account',
  'Show the current AWS region and account identity details',
  'List all DynamoDB tables available in my current AWS region',
]

const MOCK_AWS_DATA = [
  { resource: 'S3 Buckets', items: 'prod-ai-models-2026, analytics-data-lake-raw, backups-us-east-1' },
  { resource: 'DynamoDB Tables', items: 'Customers, Orders, AgentSessions' },
  { resource: 'Region / Account', items: 'us-east-1 · Account 987654321098' },
]

export function UseAwsCard({ apiBase = API_BASE }: UseAwsCardProps = {}) {
  const [prompt, setPrompt] = useState<string>(PRESETS[0])
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [result, setResult] = useState<UseAwsResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!prompt.trim()) return

    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`${apiBase}/api/use-aws`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() }),
        signal: AbortSignal.timeout(25000),
      })

      if (!res.ok) {
        const errJson = await res.json().catch(() => null)
        throw new Error(errJson?.detail || `Server returned HTTP ${res.status}`)
      }
      const data: UseAwsResponse = await res.json()
      setResult(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to query AWS agent')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="card card-half">
      <h2>
        <span className="card-title">☁️ AWS Cloud Assistant</span>
        <a className="info-link" href="info/use-aws.html" data-tooltip="Explanation" aria-label="Explanation">&#x24D8;</a>
      </h2>
      <p className="card-concept">
        Maps natural-language intents to read-only <code>use_aws</code> service, operation, and parameter calls with safety guardrails.
      </p>
      <p>
        Executes read-only AWS operations (S3, STS, DynamoDB) from plain English commands.
      </p>

      <details className="data-preview" open>
        <summary>In-Memory AWS Infrastructure State</summary>
        <div className="data-preview-grid">
          {MOCK_AWS_DATA.map((d) => (
            <span
              key={d.resource}
              className="data-tag"
              style={{ cursor: 'pointer' }}
              title={`Click to query ${d.resource}`}
              onClick={() => setPrompt(`List all ${d.resource.toLowerCase()} in my account`)}
            >
              <code>{d.resource}</code>: <strong>{d.items}</strong>
            </span>
          ))}
        </div>
      </details>

      <form onSubmit={handleSubmit} className="form-row">
        <input
          type="text"
          placeholder="e.g. List all S3 buckets in my account…"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          required
        />

        <div className="preset-row">
          <span className="preset-label">Quick pick:</span>
          {PRESETS.map((p) => (
            <button
              type="button"
              key={p}
              className={`preset-chip ${prompt === p ? 'active' : ''}`}
              onClick={() => setPrompt(p)}
            >
              {p.slice(0, 30)}…
            </button>
          ))}
        </div>

        <span className="validation">{error}</span>

        <div className="card-actions">
          <button type="submit" disabled={submitting || !prompt.trim()}>
            {submitting && <span className="spinner" />}
            {submitting ? 'Querying Cloud…' : 'Execute AWS Query'}
          </button>
        </div>
      </form>

      {result && (
        <div className="result visible">
          {result.operations_executed.map((op, i) => (
            <div key={i} style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              ☁️ {op}
            </div>
          ))}
          <div style={{ marginTop: '0.4rem' }}>{result.response}</div>
        </div>
      )}
    </div>
  )
}

export default UseAwsCard

