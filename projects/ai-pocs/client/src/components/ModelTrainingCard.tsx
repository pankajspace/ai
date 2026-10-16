import { useState } from 'react'
import { API_BASE } from '../config'

export interface ModelTrainingResponse {
  distance_km: number
  items_count: number
  is_peak_hour: number
  traffic_level: number
  predicted_eta_minutes: number
  test_mae_minutes: number
  feature_importances: Record<string, number>
}

export interface ModelTrainingCardProps {
  apiBase?: string
}

interface DeliveryPreset {
  label: string
  distance_km: number
  items_count: number
  is_peak_hour: number
  traffic_level: number
}

const DELIVERY_PRESETS: DeliveryPreset[] = [
  {
    label: 'Quick Nearby (2.5 km)',
    distance_km: 2.5,
    items_count: 2,
    is_peak_hour: 0,
    traffic_level: 1,
  },
  {
    label: 'Peak Hour Rush (6.5 km)',
    distance_km: 6.5,
    items_count: 4,
    is_peak_hour: 1,
    traffic_level: 3,
  },
  {
    label: 'Long Distance Party Order (12 km)',
    distance_km: 12.0,
    items_count: 9,
    is_peak_hour: 1,
    traffic_level: 3,
  },
]

export function ModelTrainingCard({ apiBase = API_BASE }: ModelTrainingCardProps = {}) {
  const [distanceKm, setDistanceKm] = useState<number>(6.5)
  const [itemsCount, setItemsCount] = useState<number>(4)
  const [isPeakHour, setIsPeakHour] = useState<number>(1)
  const [trafficLevel, setTrafficLevel] = useState<number>(3)
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
          items_count: itemsCount,
          is_peak_hour: isPeakHour,
          traffic_level: trafficLevel,
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
        Trains a scikit-learn <code>RandomForestRegressor</code> on synthetic food delivery data, evaluates test MAE, and serves inference from a serialized <code>joblib</code> artifact.
      </p>
      <p>
        Predict food delivery ETA in minutes from distance, item count, peak hour status, and traffic level.
      </p>

      <form onSubmit={handlePredict} className="form-row">
        <div className="preset-row">
          <span className="preset-label">Order preset:</span>
          {DELIVERY_PRESETS.map((preset) => {
            const isActive =
              distanceKm === preset.distance_km &&
              itemsCount === preset.items_count &&
              isPeakHour === preset.is_peak_hour &&
              trafficLevel === preset.traffic_level
            return (
              <button
                type="button"
                key={preset.label}
                className={`preset-chip ${isActive ? 'active' : ''}`}
                onClick={() => {
                  setDistanceKm(preset.distance_km)
                  setItemsCount(preset.items_count)
                  setIsPeakHour(preset.is_peak_hour)
                  setTrafficLevel(preset.traffic_level)
                }}
              >
                {preset.label}
              </button>
            )
          })}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
              Distance (km):
            </label>
            <input
              type="number"
              step="0.5"
              min="0.5"
              max="30"
              value={distanceKm}
              onChange={(e) => setDistanceKm(parseFloat(e.target.value) || 1)}
              required
            />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
              Items Count (1–15):
            </label>
            <input
              type="number"
              min="1"
              max="15"
              value={itemsCount}
              onChange={(e) => setItemsCount(parseInt(e.target.value, 10) || 1)}
              required
            />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
              Peak Hour:
            </label>
            <select
              value={isPeakHour}
              onChange={(e) => setIsPeakHour(parseInt(e.target.value, 10))}
            >
              <option value={0}>0 — Off-Peak</option>
              <option value={1}>1 — Peak Rush Hour</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
              Traffic Level:
            </label>
            <select
              value={trafficLevel}
              onChange={(e) => setTrafficLevel(parseInt(e.target.value, 10))}
            >
              <option value={1}>1 — Low Traffic</option>
              <option value={2}>2 — Medium Traffic</option>
              <option value={3}>3 — High Traffic</option>
            </select>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <div>
              <strong>Predicted ETA: </strong>
              <span style={{ color: '#81c784', fontSize: '1.05rem', fontWeight: 700 }}>
                {result.predicted_eta_minutes} minutes
              </span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Test MAE: &plusmn;{result.test_mae_minutes} min
            </span>
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
            <strong>Feature Importances:</strong>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '4px' }}>
              {Object.entries(result.feature_importances).map(([feat, imp]) => (
                <span
                  key={feat}
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                  }}
                >
                  <code>{feat}</code>: {(imp * 100).toFixed(1)}%
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ModelTrainingCard

