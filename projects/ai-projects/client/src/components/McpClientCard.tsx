import { useState } from 'react'
import { API_BASE } from '../config'

export interface McpToolDescriptor {
  name: string
  description: string
  input_schema: Record<string, any>
}

export interface McpClientResponse {
  handshake_status: string
  server_tools: McpToolDescriptor[]
  invoked_tool: string
  arguments: Record<string, any>
  result: Record<string, any>
  protocol_transport: string
}

export interface McpClientCardProps {
  apiBase?: string
}

export function McpClientCard({ apiBase = API_BASE }: McpClientCardProps = {}) {
  const [toolName, setToolName] = useState<string>('get_live_score')
  const [argVal, setArgVal] = useState<string>('India vs West Indies')
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [result, setResult] = useState<McpClientResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleRun = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    setSubmitting(true)
    setError(null)
    const tool_args = toolName === 'get_live_score' ? { teams: argVal } : { player_name: argVal }

    try {
      const res = await fetch(`${apiBase}/api/mcp-client`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool_name: toolName, tool_args }),
        signal: AbortSignal.timeout(20000),
      })

      if (!res.ok) {
        const errJson = await res.json().catch(() => null)
        throw new Error(errJson?.detail || `Server returned HTTP ${res.status}`)
      }
      const data: McpClientResponse = await res.json()
      setResult(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to invoke MCP client')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="card card-half">
      <h2>
        <span className="card-title">📡 FastMCP Protocol Client</span>
        <span className="badge badge-healthy">MCP Plumbing</span>
      </h2>
      <p>
        Talks directly to the FastMCP server without an LLM: Handshake &rarr; Tool Discovery &rarr; Direct Protocol Call.
      </p>
      <form onSubmit={handleRun} className="form-row">
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <select
            value={toolName}
            onChange={(e) => {
              setToolName(e.target.value)
              setArgVal(e.target.value === 'get_live_score' ? 'India vs West Indies' : 'Shubman Gill')
            }}
            style={{ width: '45%' }}
          >
            <option value="get_live_score">get_live_score</option>
            <option value="get_player_stats">get_player_stats</option>
          </select>
          <input
            type="text"
            placeholder="Argument value…"
            value={argVal}
            onChange={(e) => setArgVal(e.target.value)}
            required
            style={{ width: '55%' }}
          />
        </div>

        <span className="validation">{error}</span>

        <div className="card-actions">
          <button type="submit" disabled={submitting}>
            {submitting && <span className="spinner" />}
            {submitting ? 'Calling FastMCP…' : 'Execute MCP Call'}
          </button>
        </div>
      </form>

      {result && (
        <div className="result visible">
          <div style={{ fontSize: '0.75rem', color: 'var(--accent)', marginBottom: '0.4rem' }}>
            Handshake: {result.handshake_status} &bull; Transport: {result.protocol_transport}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
            Discovered Tools: {result.server_tools.map((t) => t.name).join(', ')}
          </div>
          <pre style={{ fontSize: '0.75rem', margin: 0, overflowX: 'auto', background: 'var(--bg)', padding: '0.4rem', borderRadius: '3px' }}>
            {JSON.stringify(result.result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

export default McpClientCard

