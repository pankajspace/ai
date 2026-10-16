import { useState } from 'react'
import { API_BASE } from '../config'

export interface JokeResponse {
  topic: string
  joke: string
}

export interface JokeGeneratorCardProps {
  apiBase?: string
}

const TOPIC_PRESETS = ['Programming', 'Cats', 'Coffee', 'AI', 'Work']

export function JokeGeneratorCard({ apiBase = API_BASE }: JokeGeneratorCardProps = {}) {
  const [topic, setTopic] = useState<string>('Programming')
  const [submittingJoke, setSubmittingJoke] = useState<boolean>(false)
  const [joke, setJoke] = useState<string | null>(null)
  const [jokeError, setJokeError] = useState<string | null>(null)

  const handleGetJoke = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!topic.trim()) return

    setSubmittingJoke(true)
    setJokeError(null)
    try {
      const res = await fetch(`${apiBase}/api/joke`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic.trim() }),
        signal: AbortSignal.timeout(20000),
      })

      if (!res.ok) {
        const errJson = await res.json().catch(() => null)
        throw new Error(errJson?.detail || `Server returned HTTP ${res.status}`)
      }
      const data: JokeResponse = await res.json()
      setJoke(data.joke)
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'TimeoutError') {
        setJokeError('Request timed out after 20 seconds. Please verify server connection and API credentials.')
      } else {
        setJokeError(err instanceof Error ? err.message : 'Failed to fetch joke')
      }
    } finally {
      setSubmittingJoke(false)
    }
  }

  return (
    <div className="card card-half">
      <h2>
        <span className="card-title">😂 Joke Generator</span>
        <a className="info-link" href="info/joke-generator.html" data-tooltip="Explanation" aria-label="Explanation">&#x24D8;</a>
      </h2>
      <p className="card-concept">
        OpenAI-compatible client routing via a custom <code>base_url</code> to an external high-speed inference endpoint.
      </p>
      <p>
        Ask Groq for a funny joke on any topic.
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
              className={`preset-chip ${topic === preset ? 'active' : ''}`}
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
  )
}

export default JokeGeneratorCard
