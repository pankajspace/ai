import { useState } from 'react'
import { API_BASE } from '../config'

export interface ChunkingResponse {
  total_chunks: number
  chunk_size: number
  chunk_overlap: number
  chunks: string[]
}

export interface ChunkingCardProps {
  apiBase?: string
}

const TEXT_PRESETS = [
  {
    label: 'RAG & Chunking',
    text: 'Retrieval-Augmented Generation (RAG) combines search retrieval with generative AI models. Before documents can be searched efficiently, they must be broken down into smaller pieces. This process is called chunking. RecursiveCharacterTextSplitter splits documents on paragraph breaks, line breaks, and spaces to keep semantically related sentences together. Chunk overlap ensures that context across boundaries is not lost between adjacent chunks.',
  },
  {
    label: 'AI Agents',
    text: 'Autonomous AI agents combine large language models with planning, memory, and external tools to accomplish multi-step objectives without constant human guidance. They observe their environment, reason about next actions, call external APIs, and iteratively refine their outputs. Memory allows them to remember past interactions and user preferences across conversation turns.',
  },
  {
    label: 'Vector Databases',
    text: 'Vector databases store high-dimensional numeric representations of unstructured data such as text, images, and audio. Unlike traditional relational databases that query by exact keyword matches, vector stores perform approximate nearest neighbor (ANN) similarity search to retrieve semantically related concepts in milliseconds.',
  },
]

export function ChunkingCard({ apiBase = API_BASE }: ChunkingCardProps = {}) {
  const [text, setText] = useState<string>(TEXT_PRESETS[0].text)
  const [chunkSize, setChunkSize] = useState<number>(250)
  const [chunkOverlap, setChunkOverlap] = useState<number>(40)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [result, setResult] = useState<ChunkingResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleChunk = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return

    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch(`${apiBase}/api/chunk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: trimmed,
          chunk_size: chunkSize,
          chunk_overlap: chunkOverlap,
        }),
        signal: AbortSignal.timeout(20000),
      })

      if (!res.ok) {
        const errJson = await res.json().catch(() => null)
        throw new Error(errJson?.detail || `Server returned HTTP ${res.status}`)
      }

      const data: ChunkingResponse = await res.json()
      setResult(data)
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'TimeoutError') {
        setError('Request timed out. Please verify server connection.')
      } else {
        setError(err instanceof Error ? err.message : 'Failed to chunk text')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="card card-half">
      <h2>
        <span className="card-title">🧩 Document Chunking</span>
        <span className="badge badge-healthy">LangChain Splitter</span>
        <a className="info-link" href="info/chunking.html" data-tooltip="Explanation" aria-label="Explanation">&#x24D8;</a>
      </h2>
      <p>
        Split long documents into smaller, overlapping passages using <code>RecursiveCharacterTextSplitter</code> for embedding and vector indexing.
      </p>

      <form onSubmit={handleChunk} className="form-row">
        <textarea
          rows={3}
          placeholder="Enter text to chunk into passages…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
        />

        <div className="preset-row">
          <span className="preset-label">Quick pick:</span>
          {TEXT_PRESETS.map((preset) => (
            <button
              type="button"
              key={preset.label}
              className="preset-chip"
              onClick={() => setText(preset.text)}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
              Chunk Size (chars):
            </label>
            <input
              type="number"
              min={50}
              max={2000}
              value={chunkSize}
              onChange={(e) => setChunkSize(Number(e.target.value))}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid #424242',
                color: 'var(--text)',
                padding: '4px 0',
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
              Chunk Overlap (chars):
            </label>
            <input
              type="number"
              min={0}
              max={500}
              value={chunkOverlap}
              onChange={(e) => setChunkOverlap(Number(e.target.value))}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid #424242',
                color: 'var(--text)',
                padding: '4px 0',
              }}
            />
          </div>
        </div>

        <span className="validation">{error}</span>

        <div className="card-actions">
          <button type="submit" disabled={submitting || !text.trim()}>
            {submitting && <span className="spinner" />}
            {submitting ? 'Chunking…' : 'Split Text'}
          </button>
        </div>
      </form>

      {result && (
        <div className="result visible">
          <div style={{ marginBottom: '0.5rem', fontWeight: 600 }}>
            Generated {result.total_chunks} Chunks (Size: {result.chunk_size}, Overlap: {result.chunk_overlap}):
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {result.chunks.map((chunk, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(0, 0, 0, 0.25)',
                  padding: '8px 10px',
                  borderRadius: '4px',
                  borderLeft: '2px solid var(--accent)',
                  fontSize: '0.8125rem',
                }}
              >
                <div style={{ color: 'var(--accent)', fontSize: '0.75rem', marginBottom: '3px' }}>
                  Chunk #{idx + 1} &bull; {chunk.length} characters
                </div>
                {chunk}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ChunkingCard

