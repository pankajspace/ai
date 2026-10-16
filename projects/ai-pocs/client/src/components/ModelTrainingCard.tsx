import { useState } from 'react'
import { API_BASE } from '../config'

export interface ModelTrainingResponse {
  distance_km: number
  prep_time_min: number
  rider_available: number
  is_raining: number
  eta_minutes: number
  message: string
}

export interface ModelTrainingCardProps {
  apiBase?: string
}

const DISTANCE_OPTIONS = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 6, 7, 8, 9, 10, 11, 12]
const PREP_TIME_OPTIONS = [5, 8, 10, 12, 15, 18, 20, 22, 25, 28, 30]

export function ModelTrainingCard({ apiBase = API_BASE }: ModelTrainingCardProps = {}) {
  const [distanceKm, setDistanceKm] = useState<number>(4.5)
  const [prepTimeMin, setPrepTimeMin] = useState<number>(15)
  const [riderAvailable, setRiderAvailable] = useState<number>(1)
  const [isRaining, setIsRaining] = useState<number>(0)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [result, setResult] = useState<ModelTrainingResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handlePredict = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch(`${apiBase}/api/model-training`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          distance_km: distanceKm,
          prep_time_min: prepTimeMin,
          rider_available: riderAvailable,
          is_raining: isRaining,
        }),
        signal: AbortSignal.timeout(25000),
      })

      if (!res.ok) {
        const errJson = await res.json().catch(() => null)
        throw new Error(errJson?.detail || `Server returned HTTP ${res.status}`)
      }

      const data: ModelTrainingResponse = await res.json()
      setResult(data)
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'TimeoutError') {
        setError('Request timed out after 25 seconds.')
      } else {
        setError(err instanceof Error ? err.message : 'Failed to run ETA model prediction')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="card card-half">
      <h2>
        <span className="card-title">🛵 Delivery ETA Model Training</span>
        <a className="info-link" href="info/model-training.html" data-tooltip="Explanation" aria-label="Explanation">&#x24D8;</a>
      </h2>
      <p className="card-concept">
        Trains a scikit-learn <code>RandomForestRegressor</code> on synthetic food delivery data and serves inference from a serialized <code>joblib</code> artifact.
      </p>
      <p>
        Predict food delivery ETA in minutes from distance, kitchen prep time, rider availability, and weather.
      </p>

      <form onSubmit={handlePredict} className="form-row">
        <div className="input-row">
          <div className="input-group">
            <label htmlFor="eta-distance">Distance (km)</label>
            <select
              id="eta-distance"
              value={distanceKm}
              onChange={(e) => setDistanceKm(parseFloat(e.target.value))}
            >
              {DISTANCE_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  {d} km
                </option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label htmlFor="eta-prep">Prep time (min)</label>
            <select
              id="eta-prep"
              value={prepTimeMin}
              onChange={(e) => setPrepTimeMin(parseFloat(e.target.value))}
            >
              {PREP_TIME_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p} min
                </option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label>Rider available?</label>
            <div className="toggle-group">
              <button
                type="button"
                className={`toggle-opt ${riderAvailable === 1 ? 'active' : ''}`}
                onClick={() => setRiderAvailable(1)}
              >
                Yes
              </button>
              <button
                type="button"
                className={`toggle-opt ${riderAvailable === 0 ? 'active' : ''}`}
                onClick={() => setRiderAvailable(0)}
              >
                No
              </button>
            </div>
          </div>
          <div className="input-group">
            <label>Is it raining?</label>
            <div className="toggle-group">
              <button
                type="button"
                className={`toggle-opt ${isRaining === 1 ? 'active' : ''}`}
                onClick={() => setIsRaining(1)}
              >
                Yes 🌧
              </button>
              <button
                type="button"
                className={`toggle-opt ${isRaining === 0 ? 'active' : ''}`}
                onClick={() => setIsRaining(0)}
              >
                No ☀️
              </button>
            </div>
          </div>
        </div>

        <span className="validation">{error}</span>

        <div className="card-actions">
          <button type="submit" disabled={submitting}>
            {submitting && <span className="spinner" />}
            {submitting ? 'Predicting…' : 'Predict Delivery ETA'}
          </button>
        </div>
      </form>

      {result && (
        <div className="result visible">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <div>
              <strong>Predicted ETA: </strong>
              <span style={{ color: '#81c784', fontSize: '1.05rem', fontWeight: 700 }}>
                {result.eta_minutes} minutes
              </span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {result.distance_km} km &bull; {result.prep_time_min}m prep &bull; {result.rider_available ? 'Rider ready' : 'No rider'} &bull; {result.is_raining ? 'Raining 🌧' : 'Clear ☀️'}
            </span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {result.message}
          </div>
        </div>
      )}
    </div>
  )
}

export default ModelTrainingCard


