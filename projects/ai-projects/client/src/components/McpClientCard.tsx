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

const PRESETS = [
  { tool: 'get_live_score', arg: 'India vs West Indies', label: 'get_live_score (India vs WI)' },
  { tool: 'get_player_stats', arg: 'Shubman Gill', label: 'get_player_stats (Shubman Gill)' },
  { tool: 'get_player_stats', arg: 'Shai Hope', label: 'get_player_stats (Shai Hope)' },
]

const MCP_SERVER_DATA = [
  { tool: 'get_live_score', arg: 'India vs West Indies', label: 'IND vs WI', detail: 'IND 287/6 · WI 198/5 (Req 90 off 70b)' },
  { tool: 'get_player_stats', arg: 'Shubman Gill', label: 'Shubman Gill', detail: '164 runs, 3 inngs, HS 150' },
  { tool: 'get_player_stats', arg: 'Shai Hope', label: 'Shai Hope', detail: '131 runs, 2 inngs, HS 78' },
]

export function McpClientCard({ apiBase = API_BASE }: McpClientCardProps = {}) {
  const [toolName, setToolName] = useState<string>(PRESETS[0].tool)
  const [argVal, setArgVal] = useState<string>(PRESETS[0].arg)
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
        <a className="info-link" href="info/mcp-client.html" data-tooltip="Explanation" aria-label="Explanation">&#x24D8;</a>
      </h2>
      <p>
        Talks directly to the FastMCP server without an LLM: Handshake &rarr; Tool Discovery &rarr; Direct Protocol Call.
      </p>

      <details className="data-preview" open>
        <summary>FastMCP Server In-Memory Data</summary>
        <div className="data-preview-grid">
          {MCP_SERVER_DATA.map((d) => (
            <span
              key={d.label}
              className="data-tag"
              style={{ cursor: 'pointer' }}
              title={`Click to invoke ${d.tool} for ${d.arg}`}
              onClick={() => {
                setToolName(d.tool)
                setArgVal(d.arg)
              }}
            >
              <code>{d.label}</code>: <strong>{d.detail}</strong>
            </span>
          ))}
        </div>
      </details>

      <form onSubmit={handleRun} className="form-row">
        <input
          type="text"
          placeholder={
            toolName === 'get_live_score'
              ? 'Teams (e.g. India vs West Indies)…'
              : 'Player name (e.g. Shubman Gill)…'
          }
          value={argVal}
          onChange={(e) => setArgVal(e.target.value)}
          required
        />

        <div className="preset-row">
          <span className="preset-label">Quick pick:</span>
          {PRESETS.map((p) => (
            <button
              type="button"
              key={p.label}
              className={`preset-chip ${toolName === p.tool && argVal === p.arg ? 'active' : ''}`}
              onClick={() => {
                setToolName(p.tool)
                setArgVal(p.arg)
              }}
            >
              {p.label}
            </button>
          ))}
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

