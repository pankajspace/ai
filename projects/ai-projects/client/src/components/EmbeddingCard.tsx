import { useState } from 'react'
import { API_BASE } from '../config'

export interface EmbeddingResponse {
  text1: string
  text2: string
  similarity: number
  dimensions: number
  preview_text1: number[]
  preview_text2: number[]
}

export interface EmbeddingCardProps {
  apiBase?: string
}

const COMPARISON_PRESETS = [
  {
    label: 'Cat vs Kitten',
    t1: 'A cat is sleeping on the couch',
    t2: 'A kitten is napping on the sofa',
  },
  {
    label: 'Cat vs Weather',
    t1: 'A cat is sleeping on the couch',
    t2: 'The stormy rain caused severe traffic delays',
  },
  {
    label: 'Coding vs Debugging',
    t1: 'Software engineers write code to solve business problems',
    t2: 'Developers debug software and fix logic defects in programs',
  },
]

export function EmbeddingCard({ apiBase = API_BASE }: EmbeddingCardProps = {}) {
  const [text1, setText1] = useState<string>(COMPARISON_PRESETS[0].t1)
  const [text2, setText2] = useState<string>(COMPARISON_PRESETS[0].t2)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [result, setResult] = useState<EmbeddingResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleCompare = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const trimmed1 = text1.trim()
    const trimmed2 = text2.trim()
    if (!trimmed1 || !trimmed2) return

    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch(`${apiBase}/api/embedding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text1: trimmed1, text2: trimmed2 }),
        signal: AbortSignal.timeout(60000),
      })

      if (!res.ok) {
        const errJson = await res.json().catch(() => null)
        throw new Error(errJson?.detail || `Server returned HTTP ${res.status}`)
      }

      const data: EmbeddingResponse = await res.json()
      setResult(data)
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'TimeoutError') {
        setError('Request timed out. The embedding model is downloading or loading in the background, please try again.')
      } else {
        setError(err instanceof Error ? err.message : 'Failed to compute similarity')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const similarityPercent = result ? Math.max(0, Math.min(100, Math.round(result.similarity * 100))) : 0

  return (
    <div className="card card-half">
      <h2>
        <span className="card-title">🔢 Sentence Embedding</span>
        <span className="badge badge-healthy">all-MiniLM-L6-v2</span>
        <a className="info-link" href="info/embedding.html" data-tooltip="Explanation" aria-label="Explanation">&#x24D8;</a>
      </h2>
      <p>
        Encode sentences into dense vector embeddings and calculate their cosine similarity score (0 to 1).
      </p>

      <form onSubmit={handleCompare} className="form-row">
        <div>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
            Sentence A:
          </label>
          <input
            type="text"
            placeholder="First sentence…"
            value={text1}
            onChange={(e) => setText1(e.target.value)}
            required
          />
        </div>

        <div>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
            Sentence B:
          </label>
          <input
            type="text"
            placeholder="Second sentence to compare…"
            value={text2}
            onChange={(e) => setText2(e.target.value)}
            required
          />
        </div>

        <div className="preset-row">
          <span className="preset-label">Quick pick:</span>
          {COMPARISON_PRESETS.map((preset) => (
            <button
              type="button"
              key={preset.label}
              className="preset-chip"
              onClick={() => {
                setText1(preset.t1)
                setText2(preset.t2)
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <span className="validation">{error}</span>

        <div className="card-actions">
          <button type="submit" disabled={submitting || !text1.trim() || !text2.trim()}>
            {submitting && <span className="spinner" />}
            {submitting ? 'Comparing…' : 'Compare Similarity'}
          </button>
        </div>
      </form>

      {result && (
        <div className="result visible">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <strong>Cosine Similarity:</strong>
            <span style={{ fontSize: '1rem', color: 'var(--accent)', fontWeight: 700 }}>
              {result.similarity} ({similarityPercent}%)
            </span>
          </div>

          <div
            style={{
              width: '100%',
              height: '8px',
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: '4px',
              overflow: 'hidden',
              marginBottom: '12px',
            }}
          >
            <div
              style={{
                width: `${similarityPercent}%`,
                height: '100%',
                backgroundColor: similarityPercent > 70 ? '#4caf50' : similarityPercent > 40 ? '#ff9800' : '#ef5350',
                transition: 'width 0.4s ease',
              }}
            />
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <div><strong>Dimensions:</strong> {result.dimensions} numbers per vector</div>
            <div style={{ marginTop: '4px' }}>
              <strong>Vector A [:5]:</strong> <code>[{result.preview_text1.join(', ')}]</code>
            </div>
            <div style={{ marginTop: '2px' }}>
              <strong>Vector B [:5]:</strong> <code>[{result.preview_text2.join(', ')}]</code>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EmbeddingCard

