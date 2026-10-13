import { useEffect, useState } from 'react'
import './App.css'

interface HealthData {
  status: string
  message?: string
}

interface TravelResponse {
  city: string
  suggestion: string
}

const API_BASE = import.meta.env.VITE_SERVER_URL || 'http://localhost:8000'

const CITY_PRESETS = ['Bangalore', 'Tokyo', 'Paris', 'New York', 'London']

function App() {
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking')
  const [healthInfo, setHealthInfo] = useState<HealthData | null>(null)
  const [checkingHealth, setCheckingHealth] = useState<boolean>(false)

  // Travel state
  const [city, setCity] = useState<string>('Bangalore')
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [suggestion, setSuggestion] = useState<string | null>(null)
  const [travelError, setTravelError] = useState<string | null>(null)

  const checkHealth = async () => {
    setCheckingHealth(true)
    try {
      const res = await fetch(`${API_BASE}/health`)
      if (res.ok) {
        const data = await res.json()
        setServerStatus('online')
        setHealthInfo(data)
      } else {
        setServerStatus('offline')
        setHealthInfo(null)
      }
    } catch {
      setServerStatus('offline')
      setHealthInfo(null)
    } finally {
      setCheckingHealth(false)
    }
  }

  useEffect(() => {
    let ignore = false
    const init = async () => {
      try {
        const healthRes = await fetch(`${API_BASE}/health`)
        if (!ignore) {
          if (healthRes.ok) {
            const hData = await healthRes.json()
            setServerStatus('online')
            setHealthInfo(hData)
          } else {
            setServerStatus('offline')
          }
        }
      } catch {
        if (!ignore) {
          setServerStatus('offline')
        }
      }
    }
    init()
    return () => {
      ignore = true
    }
  }, [])

  const handleGetSuggestion = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!city.trim()) return

    setSubmitting(true)
    setTravelError(null)
    try {
      const res = await fetch(`${API_BASE}/api/travel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city: city.trim() }),
      })

      if (!res.ok) {
        const errJson = await res.json().catch(() => null)
        throw new Error(errJson?.detail || `Server returned HTTP ${res.status}`)
      }
      const data: TravelResponse = await res.json()
      setSuggestion(data.suggestion)
    } catch (err) {
      setTravelError(err instanceof Error ? err.message : 'Failed to fetch travel suggestion')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <header>
        <nav className="nav container">
          <a href="https://techtoday.click" className="brand">
            <span className="logo" aria-hidden="true" />
            <span>TechToday</span>
          </a>
          <a href="https://techtoday.click" className="nav-back-link">
            &larr; Home
          </a>
        </nav>
      </header>

      <main>
        <section className="hero">
          <div className="container">
            <h1>AI Projects</h1>
            <p className="subtitle">FastAPI + React multi-container travel guide</p>
          </div>
        </section>

        <section id="tools">
          <div className="container">
            <div className="grid">
              {/* Card 1: Server Diagnostics */}
              <div className="card card-half">
                <h2>
                  <span className="card-title">⚡ Server Diagnostics</span>
                  <span
                    className={`badge ${
                      serverStatus === 'online' ? 'badge-healthy' : 'badge-offline'
                    }`}
                  >
                    {serverStatus === 'online'
                      ? '● Connected'
                      : serverStatus === 'offline'
                        ? '● Disconnected'
                        : '● Checking...'}
                  </span>
                </h2>
                <p>
                  Health check probe calling <code>GET /health</code> on the FastAPI service.
                </p>
                <div className="card-actions">
                  <button type="button" onClick={checkHealth} disabled={checkingHealth}>
                    {checkingHealth && <span className="spinner" />}
                    {checkingHealth ? 'Checking…' : 'Ping Server'}
                  </button>
                </div>
                <div className="result visible">
                  {serverStatus === 'online'
                    ? JSON.stringify(healthInfo || { status: 'healthy' }, null, 2)
                    : 'Server is currently offline. Ensure docker compose up or uvicorn is running.'}
                </div>
              </div>

              {/* Card 2: Travel Guide Service */}
              <div className="card card-half">
                <h2>
                  <span className="card-title">✈️ Travel Guide</span>
                  <span className="badge badge-healthy">GPT-4o mini</span>
                </h2>
                <p>
                  Ask GPT-4o mini for a witty suggestion of what to do in any city via{' '}
                  <code>POST /api/travel</code>.
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
                        className="preset-chip"
                        onClick={() => setCity(preset)}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>

                  <span className="validation">{travelError}</span>

                  <div className="card-actions">
                    <button type="submit" disabled={submitting || !city.trim()}>
                      {submitting && <span className="spinner" />}
                      {submitting ? 'Suggesting…' : 'Suggest Activity'}
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
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="container">
          <p>&copy; TechToday &bull; AI Projects</p>
        </div>
      </footer>
    </>
  )
}

export default App
