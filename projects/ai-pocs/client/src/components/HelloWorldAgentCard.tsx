import { useState } from 'react'
import { API_BASE } from '../config'

export interface HelloWorldAgentResponse {
  prompt: string
  response: string
}

export interface HelloWorldAgentCardProps {
  apiBase?: string
}

const PRESETS = [
  'Hello! Tell me a fun fact about AI agents.',
  'What are the key differences between an LLM and an AI agent?',
  'Explain the concept of tool use in autonomous agents in one sentence.',
  'Give me 3 practical everyday examples of AI agents in action.',
]

export function HelloWorldAgentCard({ apiBase = API_BASE }: HelloWorldAgentCardProps = {}) {
  const [prompt, setPrompt] = useState<string>('Hello! Tell me a fun fact about AI agents.')
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [result, setResult] = useState<HelloWorldAgentResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!prompt.trim()) return

    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`${apiBase}/api/hello-world-agent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() }),
        signal: AbortSignal.timeout(25000),
      })

      if (!res.ok) {
        const errJson = await res.json().catch(() => null)
        throw new Error(errJson?.detail || `Server returned HTTP ${res.status}`)
      }
      const data: HelloWorldAgentResponse = await res.json()
      setResult(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to query Hello World agent')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="card card-half">
      <h2>
        <span className="card-title">🌐 Hello World Agent</span>
        <a className="info-link" href="info/hello-world-agent.html" data-tooltip="Explanation" aria-label="Explanation">&#x24D8;</a>
      </h2>
      <p className="card-concept">
        Single-turn AWS Strands <code>Agent</code> initialization and execution without external tool bindings.
      </p>
      <p>
        The minimal Strands agentic loop powered by Amazon Bedrock Nova Lite (with OpenAI fallback).
      </p>
      <form onSubmit={handleSubmit} className="form-row">
        <input
          type="text"
          placeholder="Enter a prompt for the agent…"
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
            {submitting ? 'Running…' : 'Run Agent'}
          </button>
        </div>
      </form>

      {result && (
        <div className="result visible">
          {result.response}
        </div>
      )}
    </div>
  )
}

export default HelloWorldAgentCard

