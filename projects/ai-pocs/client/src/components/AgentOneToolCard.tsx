import { useState } from 'react'
import { API_BASE } from '../config'

export interface AgentResponse {
  message: string
  response: string
}

export interface AgentOneToolCardProps {
  apiBase?: string
}

const QUERY_PRESETS = [
  'How much are the shoes?',
  'What is the price of a bag?',
  'How much for hat and shorts?',
  'Do you have sunglasses?',
  'Hi! What can you help with?',
]

const STORE_PRICES = [
  { item: 'shoes', price: '₹799' },
  { item: 'hat', price: '₹399' },
  { item: 'bag', price: '₹1,420' },
  { item: 'shorts', price: '₹1,299' },
  { item: 'pants', price: '₹1,699' },
]

export function AgentOneToolCard({ apiBase = API_BASE }: AgentOneToolCardProps = {}) {
  const [message, setMessage] = useState<string>('How much are the shoes?')
  const [submittingAgent, setSubmittingAgent] = useState<boolean>(false)
  const [agentResponse, setAgentResponse] = useState<string | null>(null)
  const [agentError, setAgentError] = useState<string | null>(null)

  const handleAskAgent = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!message.trim()) return

    setSubmittingAgent(true)
    setAgentError(null)
    try {
      const res = await fetch(`${apiBase}/api/agent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim() }),
        signal: AbortSignal.timeout(25000),
      })

      if (!res.ok) {
        const errJson = await res.json().catch(() => null)
        throw new Error(errJson?.detail || `Server returned HTTP ${res.status}`)
      }
      const data: AgentResponse = await res.json()
      setAgentResponse(data.response)
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'TimeoutError') {
        setAgentError('Request timed out after 25 seconds. Please verify server connection and API credentials.')
      } else {
        setAgentError(err instanceof Error ? err.message : 'Failed to query agent')
      }
    } finally {
      setSubmittingAgent(false)
    }
  }

  return (
    <div className="card card-half">
      <h2>
        <span className="card-title">🤖 Single-Tool Agent</span>
        <a className="info-link" href="info/agent-one-tool.html" data-tooltip="Explanation" aria-label="Explanation">&#x24D8;</a>
      </h2>
      <p className="card-concept">
        Manual tool-calling loop that inspects <code>tool_calls</code>, runs local Python lookups, and feeds results back to the model.
      </p>
      <p>
        Autonomous agent with local tool calling (<code>get_price</code>) to answer store queries.
      </p>

      <details className="data-preview" open>
        <summary>In-Memory Price Catalog (5 items)</summary>
        <div className="data-preview-grid">
          {STORE_PRICES.map((p) => (
            <span
              key={p.item}
              className="data-tag"
              style={{ cursor: 'pointer' }}
              title={`Click to check ${p.item} price`}
              onClick={() => setMessage(`How much are the ${p.item}?`)}
            >
              <code>{p.item}</code>: <strong>{p.price}</strong>
            </span>
          ))}
        </div>
      </details>

      <form onSubmit={handleAskAgent} className="form-row">
        <input
          type="text"
          placeholder="Ask the agent (e.g. How much are the shoes?)…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />

        <div className="preset-row">
          <span className="preset-label">Quick pick:</span>
          {QUERY_PRESETS.map((preset) => (
            <button
              type="button"
              key={preset}
              className={`preset-chip ${message === preset ? 'active' : ''}`}
              onClick={() => setMessage(preset)}
            >
              {preset}
            </button>
          ))}
        </div>

        <span className="validation">{agentError}</span>

        <div className="card-actions">
          <button type="submit" disabled={submittingAgent || !message.trim()}>
            {submittingAgent && <span className="spinner" />}
            {submittingAgent ? 'Reasoning…' : 'Ask Agent'}
          </button>
        </div>
      </form>

      {agentResponse && (
        <div className="result visible">
          <strong>Agent reply:</strong>
          {'\n\n'}
          {agentResponse}
        </div>
      )}
    </div>
  )
}

export default AgentOneToolCard

