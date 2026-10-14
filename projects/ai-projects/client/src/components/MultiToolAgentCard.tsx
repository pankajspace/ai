import { useState } from 'react'
import { API_BASE } from '../config'

export interface ToolStep {
  type: 'tool_call' | 'tool_result' | string
  name: string
  args?: Record<string, unknown>
  content: string
}

export interface MultiToolAgentResponse {
  message: string
  response: string
  steps: ToolStep[]
}

export interface MultiToolAgentCardProps {
  apiBase?: string
}

const QUERY_PRESETS = [
  "What's the weather in Tokyo, and what is 12 times 12?",
  'What is the weather like in New York?',
  'What is 25 multiplied by 4?',
  'What is 137 plus 568?',
  'What is the population of Bangalore?',
  'Who wrote the play Romeo and Juliet?',
]

export function MultiToolAgentCard({ apiBase = API_BASE }: MultiToolAgentCardProps = {}) {
  const [message, setMessage] = useState<string>(QUERY_PRESETS[0])
  const [submittingAgent, setSubmittingAgent] = useState<boolean>(false)
  const [agentResponse, setAgentResponse] = useState<string | null>(null)
  const [agentSteps, setAgentSteps] = useState<ToolStep[]>([])
  const [agentError, setAgentError] = useState<string | null>(null)

  const handleAskAgent = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!message.trim()) return

    setSubmittingAgent(true)
    setAgentError(null)
    try {
      const res = await fetch(`${apiBase}/api/multi-tool-agent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim() }),
        signal: AbortSignal.timeout(25000),
      })

      if (!res.ok) {
        const errJson = await res.json().catch(() => null)
        throw new Error(errJson?.detail || `Server returned HTTP ${res.status}`)
      }
      const data: MultiToolAgentResponse = await res.json()
      setAgentResponse(data.response)
      setAgentSteps(data.steps || [])
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'TimeoutError') {
        setAgentError('Request timed out after 25 seconds. Please verify server connection and Groq API key.')
      } else {
        setAgentError(err instanceof Error ? err.message : 'Failed to query multi-tool agent')
      }
    } finally {
      setSubmittingAgent(false)
    }
  }

  return (
    <div className="card card-half">
      <h2>
        <span className="card-title">🛠️ Multi-Tool Agent</span>
        <span className="badge badge-healthy">LangChain • Groq</span>
      </h2>
      <p>
        LangChain agent with multiple tools (<code>get_weather</code>, <code>add</code>, <code>multiply</code>, <code>get_population</code>) and visible tool-call trace.
      </p>
      <form onSubmit={handleAskAgent} className="form-row">
        <input
          type="text"
          placeholder="Ask a single or multi-step question…"
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
            {submittingAgent ? 'Reasoning…' : 'Run Multi-Tool Agent'}
          </button>
        </div>
      </form>

      {agentResponse && (
        <div className="result visible">
          {agentSteps.length > 0 ? (
            <div style={{ marginBottom: '0.6rem', fontSize: '0.8rem', fontFamily: 'monospace' }}>
              <strong>Tool trace:</strong>
              {agentSteps.map((step, idx) => (
                <div
                  key={idx}
                  style={{
                    color: step.type === 'tool_call' ? 'var(--accent)' : '#81c784',
                    marginTop: '0.2rem',
                  }}
                >
                  {step.type === 'tool_call'
                    ? `🔧 [tool call]   ${step.content}`
                    : `📦 [tool result] ${step.content}`}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ marginBottom: '0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <em>No external tool needed — answered directly by model.</em>
            </div>
          )}
          <strong>Agent reply:</strong>
          {'\n\n'}
          {agentResponse}
        </div>
      )}
    </div>
  )
}

export default MultiToolAgentCard

