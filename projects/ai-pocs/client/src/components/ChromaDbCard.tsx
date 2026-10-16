import { useState } from 'react'
import { API_BASE } from '../config'

export interface ChromaDbSource {
  source: string
  content: string
}

export interface ChromaDbResponse {
  question: string
  answer: string
  docs_indexed: number
  sources: ChromaDbSource[]
}

export interface ChromaDbCardProps {
  apiBase?: string
}

const CHROMA_PRESETS = [
  'Why should I copy requirements.txt before the rest of my code?',
  'What is the difference between a Docker image and a container?',
  'Why do we use volumes in Docker?',
  'What does depends_on do in Docker Compose?',
]

export function ChromaDbCard({ apiBase = API_BASE }: ChromaDbCardProps = {}) {
  const [question, setQuestion] = useState<string>(CHROMA_PRESETS[0])
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [result, setResult] = useState<ChromaDbResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAsk = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const trimmed = question.trim()
    if (!trimmed) return

    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch(`${apiBase}/api/chromadb`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: trimmed,
        }),
        signal: AbortSignal.timeout(25000),
      })

      if (!res.ok) {
        const errJson = await res.json().catch(() => null)
        throw new Error(errJson?.detail || `Server returned HTTP ${res.status}`)
      }

      const data: ChromaDbResponse = await res.json()
      setResult(data)
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'TimeoutError') {
        setError('Request timed out after 25 seconds.')
      } else {
        setError(err instanceof Error ? err.message : 'Failed to query ChromaDB RAG service')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="card card-half">
      <h2>
        <span className="card-title">🗄️ ChromaDB Notes Q&amp;A</span>
        <a className="info-link" href="info/chromadb.html" data-tooltip="Explanation" aria-label="Explanation">&#x24D8;</a>
      </h2>
      <p className="card-concept">
        Chunks local markdown notes (<code>docs/*.md</code>), embeds them with <code>text-embedding-3-small</code>, indexes into ChromaDB, and synthesizes a grounded answer.
      </p>
      <p>
        Ask questions across indexed Docker, Compose, Volumes, and RAG study notes stored in ChromaDB.
      </p>

      <form onSubmit={handleAsk} className="form-row">
        <div className="input-row">
          <div className="input-group" style={{ flex: 1 }}>
            <label htmlFor="chromadb-question">Ask a question about Docker</label>
            <input
              id="chromadb-question"
              type="text"
              placeholder="Ask a question about Docker, Volumes, or RAG…"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="preset-row">
          <span className="preset-label">Sample questions:</span>
          {CHROMA_PRESETS.map((preset) => (
            <button
              type="button"
              key={preset}
              className={`preset-chip ${question === preset ? 'active' : ''}`}
              onClick={() => setQuestion(preset)}
            >
              {preset}
            </button>
          ))}
        </div>

        <span className="validation">{error}</span>

        <div className="card-actions">
          <button type="submit" disabled={submitting || !question.trim()}>
            {submitting && <span className="spinner" />}
            {submitting ? 'Querying ChromaDB…' : 'Ask ChromaDB'}
          </button>
        </div>
      </form>

      {result && (
        <div className="result visible">
          <div style={{ marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>Answer:</strong>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {result.docs_indexed} chunks in collection
              </span>
            </div>
            <div style={{ marginTop: '4px', color: 'var(--text)' }}>
              {result.answer}
            </div>
          </div>

          {result.sources && result.sources.length > 0 && (
            <div style={{ marginTop: '0.75rem', borderTop: '1px solid var(--border)', paddingTop: '0.5rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>
                Retrieved ChromaDB Chunks ({result.sources.length}):
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {result.sources.map((src, idx) => (
                  <div
                    key={`${src.source}-${idx}`}
                    style={{
                      fontSize: '0.75rem',
                      background: 'rgba(0, 0, 0, 0.25)',
                      padding: '4px 8px',
                      borderRadius: '3px',
                      borderLeft: '2px solid #4caf50',
                    }}
                  >
                    <span style={{ color: '#81c784', fontWeight: 600 }}>
                      [{src.source}]:{' '}
                    </span>
                    {src.content}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ChromaDbCard


