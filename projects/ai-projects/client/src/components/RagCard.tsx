import { useState } from 'react'
import { API_BASE } from '../config'

export interface RagResponse {
  paragraph: string
  question: string
  answer: string
  sources: string[]
}

export interface RagCardProps {
  apiBase?: string
}

const PARAGRAPH_PRESETS = [
  {
    label: 'Return Policy',
    paragraph:
      'TechToday Return Policy: Customers may return any eligible product within 30 days of the purchase date. All returned merchandise must be unworn, undamaged, and in its original packaging with all tags attached. Refunds are processed back to the original payment method within 5 to 7 business days after inspection. Standard shipping fees are non-refundable unless the return is due to our fulfillment error. International orders and clearance items marked as final sale cannot be returned or exchanged.',
    defaultQuestion: 'How long do I have to return something?',
    presetQuestions: [
      'How long do I have to return something?',
      'Can I return international orders?',
      'How many business days do refunds take?',
    ],
  },
  {
    label: 'Warranty Guide',
    paragraph:
      'TechToday Hardware Warranty: All hardware products include a 1-year limited manufacturer warranty covering defects in materials and workmanship. The warranty does not cover accidental damage, liquid spills, unauthorized modifications, or normal cosmetic wear and tear. To initiate a warranty claim, customers must provide proof of purchase and the product serial number. Approved warranty replacements ship via ground courier within 3 business days.',
    defaultQuestion: 'What does the warranty cover?',
    presetQuestions: [
      'What does the warranty cover?',
      'Are liquid spills covered?',
      'What is required to initiate a claim?',
    ],
  },
]

export function RagCard({ apiBase = API_BASE }: RagCardProps = {}) {
  const [paragraph, setParagraph] = useState<string>(PARAGRAPH_PRESETS[0].paragraph)
  const [question, setQuestion] = useState<string>(PARAGRAPH_PRESETS[0].defaultQuestion)
  const [activePresetIndex, setActivePresetIndex] = useState<number>(0)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [result, setResult] = useState<RagResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleRag = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const trimmedPara = paragraph.trim()
    const trimmedQ = question.trim()
    if (!trimmedPara || !trimmedQ) return

    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch(`${apiBase}/api/rag`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paragraph: trimmedPara,
          question: trimmedQ,
        }),
        signal: AbortSignal.timeout(25000),
      })

      if (!res.ok) {
        const errJson = await res.json().catch(() => null)
        throw new Error(errJson?.detail || `Server returned HTTP ${res.status}`)
      }

      const data: RagResponse = await res.json()
      setResult(data)
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'TimeoutError') {
        setError('Request timed out after 25 seconds. Please verify server connection and API credentials.')
      } else {
        setError(err instanceof Error ? err.message : 'Failed to query RAG service')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="card card-half">
      <h2>
        <span className="card-title">📚 Paragraph RAG</span>
        <a className="info-link" href="info/rag.html" data-tooltip="Explanation" aria-label="Explanation">&#x24D8;</a>
      </h2>
      <p className="card-concept">
        Splits source text with <code>RecursiveCharacterTextSplitter</code>, ranks top matching chunks, and grounds the model on retrieved context.
      </p>
      <p>
        Ask questions about any paragraph using Retrieval-Augmented Generation (chunking &rarr; semantic retrieval &rarr; grounded answer).
      </p>

      <form onSubmit={handleRag} className="form-row">
        <div>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
            Knowledge Paragraph:
          </label>
          <textarea
            rows={3}
            placeholder="Paste knowledge paragraph here…"
            value={paragraph}
            onChange={(e) => setParagraph(e.target.value)}
            required
          />
        </div>

        <div className="preset-row">
          <span className="preset-label">Paragraph preset:</span>
          {PARAGRAPH_PRESETS.map((preset, idx) => (
            <button
              type="button"
              key={preset.label}
              className="preset-chip"
              onClick={() => {
                setActivePresetIndex(idx)
                setParagraph(preset.paragraph)
                setQuestion(preset.defaultQuestion)
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
            Question:
          </label>
          <input
            type="text"
            placeholder="Ask a question about the paragraph…"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
          />
        </div>

        <div className="preset-row">
          <span className="preset-label">Sample questions:</span>
          {PARAGRAPH_PRESETS[activePresetIndex].presetQuestions.map((q) => (
            <button
              type="button"
              key={q}
              className="preset-chip"
              onClick={() => setQuestion(q)}
            >
              {q}
            </button>
          ))}
        </div>

        <span className="validation">{error}</span>

        <div className="card-actions">
          <button type="submit" disabled={submitting || !paragraph.trim() || !question.trim()}>
            {submitting && <span className="spinner" />}
            {submitting ? 'Retrieving…' : 'Ask RAG'}
          </button>
        </div>
      </form>

      {result && (
        <div className="result visible">
          <div style={{ marginBottom: '0.5rem' }}>
            <strong>Answer:</strong>
            <div style={{ marginTop: '4px', color: 'var(--text)' }}>
              {result.answer}
            </div>
          </div>

          {result.sources && result.sources.length > 0 && (
            <div style={{ marginTop: '0.75rem', borderTop: '1px solid var(--border)', paddingTop: '0.5rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>
                Retrieved Context Passages ({result.sources.length}):
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {result.sources.map((src, i) => (
                  <div
                    key={i}
                    style={{
                      fontSize: '0.75rem',
                      background: 'rgba(0, 0, 0, 0.25)',
                      padding: '4px 8px',
                      borderRadius: '3px',
                      borderLeft: '2px solid #4caf50',
                    }}
                  >
                    <span style={{ color: '#81c784', fontWeight: 600 }}>Passage #{i + 1}: </span>
                    {src}
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

export default RagCard

