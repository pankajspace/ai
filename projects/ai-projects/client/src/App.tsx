import { useState } from 'react'
import './App.css'

interface TravelResponse {
  city: string
  suggestion: string
}

interface JokeResponse {
  topic: string
  joke: string
}

const API_BASE = import.meta.env.VITE_SERVER_URL || 'http://localhost:8000'

const CITY_PRESETS = ['Bangalore', 'Tokyo', 'Paris', 'New York', 'London']
const TOPIC_PRESETS = ['Programming', 'Cats', 'Coffee', 'AI', 'Work']

function App() {
  // Travel state
  const [city, setCity] = useState<string>('Bangalore')
  const [submittingTravel, setSubmittingTravel] = useState<boolean>(false)
  const [suggestion, setSuggestion] = useState<string | null>(null)
  const [travelError, setTravelError] = useState<string | null>(null)

  // Joke state
  const [topic, setTopic] = useState<string>('Programming')
  const [submittingJoke, setSubmittingJoke] = useState<boolean>(false)
  const [joke, setJoke] = useState<string | null>(null)
  const [jokeError, setJokeError] = useState<string | null>(null)

  const handleGetSuggestion = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!city.trim()) return

    setSubmittingTravel(true)
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
      setSubmittingTravel(false)
    }
  }

  const handleGetJoke = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!topic.trim()) return

    setSubmittingJoke(true)
    setJokeError(null)
    try {
      const res = await fetch(`${API_BASE}/api/joke`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic.trim() }),
      })

      if (!res.ok) {
        const errJson = await res.json().catch(() => null)
        throw new Error(errJson?.detail || `Server returned HTTP ${res.status}`)
      }
      const data: JokeResponse = await res.json()
      setJoke(data.joke)
    } catch (err) {
      setJokeError(err instanceof Error ? err.message : 'Failed to fetch joke')
    } finally {
      setSubmittingJoke(false)
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
            <p className="subtitle">FastAPI + React multi-container AI services</p>
          </div>
        </section>

        <section id="tools">
          <div className="container">
            <div className="grid">
              {/* Tile 1: Travel Guide Service (OpenAI) */}
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

              {/* Tile 2: Joke Generator Service (Gemini) */}
              <div className="card card-half">
                <h2>
                  <span className="card-title">😂 Joke Generator</span>
                  <span className="badge badge-healthy">Gemini</span>
                </h2>
                <p>
                  Ask Google Gemini for a funny joke on any topic via{' '}
                  <code>POST /api/joke</code>.
                </p>
                <form onSubmit={handleGetJoke} className="form-row">
                  <input
                    type="text"
                    placeholder="Enter a topic (e.g. Programming, Cats, Coffee)…"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    required
                  />

                  <div className="preset-row">
                    <span className="preset-label">Quick pick:</span>
                    {TOPIC_PRESETS.map((preset) => (
                      <button
                        type="button"
                        key={preset}
                        className="preset-chip"
                        onClick={() => setTopic(preset)}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>

                  <span className="validation">{jokeError}</span>

                  <div className="card-actions">
                    <button type="submit" disabled={submittingJoke || !topic.trim()}>
                      {submittingJoke && <span className="spinner" />}
                      {submittingJoke ? 'Thinking…' : 'Tell Me a Joke'}
                    </button>
                  </div>
                </form>

                {joke && (
                  <div className="result visible">
                    <strong>Joke about {topic}:</strong>
                    {'\n\n'}
                    {joke}
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
