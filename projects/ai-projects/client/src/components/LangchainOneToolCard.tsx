import { useState } from 'react'
import { API_BASE } from '../config'

export interface LangchainOneToolResponse {
  message: string
  response: string
  tool_called: boolean
}

export interface LangchainOneToolCardProps {
  apiBase?: string
}

const QUERY_PRESETS = [
  'What is the weather like in New York?',
  'What is the weather in Tokyo?',
  'What is the weather in Paris?',
  'What is scaler company?',
  'Hi! What can you help with?',
]

export function LangchainOneToolCard({ apiBase = API_BASE }: LangchainOneToolCardProps = {}) {
  const [message, setMessage] = useState<string>(QUERY_PRESETS[0])
  const [submittingAgent, setSubmittingAgent] = useState<boolean>(false)
  const [agentResponse, setAgentResponse] = useState<string | null>(null)
  const [toolCalled, setToolCalled] = useState<boolean | null>(null)
  const [agentError, setAgentError] = useState<string | null>(null)

  const handleAskAgent = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!message.trim()) return

    setSubmittingAgent(true)
    setAgentError(null)
    try {
      const res = await fetch(`${apiBase}/api/langchain-one-tool`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim() }),
        signal: AbortSignal.timeout(25000),
      })

      if (!res.ok) {
        const errJson = await res.json().catch(() => null)
        throw new Error(errJson?.detail || `Server returned HTTP ${res.status}`)
      }
      const data: LangchainOneToolResponse = await res.json()
      setAgentResponse(data.response)
      setToolCalled(Boolean(data.tool_called))
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'TimeoutError') {
        setAgentError('Request timed out after 25 seconds. Please verify server connection and Groq API key.')
      } else {
        setAgentError(err instanceof Error ? err.message : 'Failed to query LangChain agent')
      }
    } finally {
      setSubmittingAgent(false)
    }
  }

  return (
    <div className="card card-half">
      <h2>
        <span className="card-title">🌦️ LangChain Agent</span>
        <span className="badge badge-healthy">LangChain • Groq</span>
      </h2>
      <p>
        LangChain agent with a single tool (<code>get_weather</code>) to check current city forecasts.
      </p>
      <form onSubmit={handleAskAgent} className="form-row">
        <input
          type="text"
          placeholder="Ask about weather or general questions…"
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
              className="preset-chip"
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
          <div style={{ marginBottom: '0.4rem', fontSize: '0.78rem', color: toolCalled ? 'var(--accent)' : 'var(--text-muted)' }}>
            <strong>Tool called:</strong> {toolCalled ? 'Yes' : 'No'}
          </div>
          <strong>Agent reply:</strong>
          {'\n\n'}
          {agentResponse}
        </div>
      )}
    </div>
  )
}

export default LangchainOneToolCard

