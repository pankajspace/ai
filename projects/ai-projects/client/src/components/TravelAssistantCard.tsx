import { useState } from 'react'
import { API_BASE } from '../config'

export interface TravelAssistantResponse {
  query: string
  response: string
  workflow_steps: string[]
  itinerary_data: Record<string, any>
  provider: string
}

export interface TravelAssistantCardProps {
  apiBase?: string
}

const PRESETS = [
  "I'm going to Goa for 3 days with 2 friends. My budget is 20000 rupees. What should I pack, and does it fit my budget?",
  "I'm planning a 4-day solo trip to Manali with a budget of 15000 rupees. What should I pack and can I afford it?",
  "Family trip of 4 to Jaipur for 5 days with budget 50000 rupees. What are the weather, packing, and costs?",
]

const DESTINATION_DATA = [
  { city: 'Goa', weather: '31°C Sunny', cost: '₹2,500/day' },
  { city: 'Manali', weather: '12°C Cold', cost: '₹2,000/day' },
  { city: 'Bangalore', weather: '24°C Pleasant', cost: '₹3,000/day' },
  { city: 'Jaipur', weather: '34°C Hot', cost: '₹2,200/day' },
]

export function TravelAssistantCard({ apiBase = API_BASE }: TravelAssistantCardProps = {}) {
  const [query, setQuery] = useState<string>(PRESETS[0])
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [result, setResult] = useState<TravelAssistantResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!query.trim()) return

    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`${apiBase}/api/travel-assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() }),
        signal: AbortSignal.timeout(30000),
      })

      if (!res.ok) {
        const errJson = await res.json().catch(() => null)
        throw new Error(errJson?.detail || `Server returned HTTP ${res.status}`)
      }
      const data: TravelAssistantResponse = await res.json()
      setResult(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to query Travel Assistant')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="card card-half">
      <h2>
        <span className="card-title">🏖️ Capstone Travel Planner</span>
        <span className="badge badge-healthy">Capstone Agent</span>
        <a className="info-link" href="info/travel-assistant.html" data-tooltip="Explanation" aria-label="Explanation">&#x24D8;</a>
      </h2>
      <p>
        Autonomous concierge chaining <code>weather</code> &rarr; <code>packing</code> &rarr; <code>cost estimation</code> &rarr; <code>budget check</code>.
      </p>

      <details className="data-preview" open>
        <summary>In-Memory Destination Knowledge (4 cities)</summary>
        <div className="data-preview-grid">
          {DESTINATION_DATA.map((d) => (
            <span
              key={d.city}
              className="data-tag"
              style={{ cursor: 'pointer' }}
              title={`Click to plan trip to ${d.city}`}
              onClick={() =>
                setQuery(`I'm going to ${d.city} for 3 days with a friend. My budget is 15000 rupees. What should I pack, and can I afford it?`)
              }
            >
              <code>{d.city}</code>: <strong>{d.weather}</strong> &bull; {d.cost}
            </span>
          ))}
        </div>
      </details>

      <form onSubmit={handleSubmit} className="form-row">
        <input
          type="text"
          placeholder="e.g. 3-day trip to Goa with 2 friends on ₹20,000 budget…"
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
              {p.slice(0, 32)}…
            </button>
          ))}
        </div>

        <span className="validation">{error}</span>

        <div className="card-actions">
          <button type="submit" disabled={submitting || !query.trim()}>
            {submitting && <span className="spinner" />}
            {submitting ? 'Planning Trip…' : 'Plan Full Trip'}
          </button>
        </div>
      </form>

      {result && (
        <div className="result visible">
          <div style={{ fontSize: '0.75rem', color: 'var(--accent)', marginBottom: '0.4rem' }}>
            Provider: {result.provider}
          </div>
          {result.workflow_steps.length > 0 && (
            <div style={{ marginBottom: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <strong>Autonomous Tool Execution Chain:</strong>
              {result.workflow_steps.map((c, i) => (
                <div key={i} style={{ fontFamily: 'monospace' }}>&bull; {c}</div>
              ))}
            </div>
          )}
          <div style={{ whiteSpace: 'pre-line' }}>{result.response}</div>
        </div>
      )}
    </div>
  )
}

export default TravelAssistantCard

