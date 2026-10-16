import { useState } from 'react'
import { API_BASE } from '../config'

export interface TravelResponse {
  city: string
  suggestion: string
}

export interface TravelGuideCardProps {
  apiBase?: string
}

const CITY_PRESETS = ['Bangalore', 'Tokyo', 'Paris', 'New York', 'London']

export function TravelGuideCard({ apiBase = API_BASE }: TravelGuideCardProps = {}) {
  const [city, setCity] = useState<string>('Bangalore')
  const [submittingTravel, setSubmittingTravel] = useState<boolean>(false)
  const [suggestion, setSuggestion] = useState<string | null>(null)
  const [travelError, setTravelError] = useState<string | null>(null)

  const handleGetSuggestion = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!city.trim()) return

    setSubmittingTravel(true)
    setTravelError(null)
    try {
      const res = await fetch(`${apiBase}/api/travel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city: city.trim() }),
        signal: AbortSignal.timeout(20000),
      })

      if (!res.ok) {
        const errJson = await res.json().catch(() => null)
        throw new Error(errJson?.detail || `Server returned HTTP ${res.status}`)
      }
      const data: TravelResponse = await res.json()
      setSuggestion(data.suggestion)
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'TimeoutError') {
        setTravelError('Request timed out after 20 seconds. Please verify server connection and API credentials.')
      } else {
        setTravelError(err instanceof Error ? err.message : 'Failed to fetch travel suggestion')
      }
    } finally {
      setSubmittingTravel(false)
    }
  }

  return (
    <div className="card card-half">
      <h2>
        <span className="card-title">✈️ Travel Guide</span>
        <a className="info-link" href="info/travel-guide.html" data-tooltip="Explanation" aria-label="Explanation">&#x24D8;</a>
      </h2>
      <p className="card-concept">
        Direct chat completion pairing a system persona with a user prompt via <code>chat.completions.create</code>.
      </p>
      <p>
        Ask GPT-4o mini for a witty suggestion of what to do in any city.
      </p>
      <form onSubmit={handleGetSuggestion} className="form-row">
        <input
          type="text"
          placeholder="Enter a city (e.g. Bangalore, Tokyo, Paris)…"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          required
        />

        <div className="preset-row">
          <span className="preset-label">Quick pick:</span>
          {CITY_PRESETS.map((preset) => (
            <button
              type="button"
              key={preset}
              className={`preset-chip ${city === preset ? 'active' : ''}`}
              onClick={() => setCity(preset)}
            >
              {preset}
            </button>
          ))}
        </div>

        <span className="validation">{travelError}</span>

        <div className="card-actions">
          <button type="submit" disabled={submittingTravel || !city.trim()}>
            {submittingTravel && <span className="spinner" />}
            {submittingTravel ? 'Suggesting…' : 'Suggest Activity'}
          </button>
        </div>
      </form>

      {suggestion && (
        <div className="result visible">
          <strong>Suggestion for {city}:</strong>
          {'\n\n'}
          {suggestion}
        </div>
      )}
    </div>
  )
}

export default TravelGuideCard
