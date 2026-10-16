import { useState } from 'react'
import { API_BASE } from '../config'

export interface SummarizerResponse {
  text: string
  summary: string
}

export interface SummarizerCardProps {
  apiBase?: string
}

const TEXT_PRESETS = [
  {
    label: 'LangChain',
    text: 'Information about LangChain and its usage in building AI applications. We will explore how it simplifies the integration of language models into various applications. It provides a structured way to create prompts, manage outputs, and chain together multiple language model calls. This allows developers to build complex AI-driven workflows efficiently.',
  },
  {
    label: 'AI Agents',
    text: 'Autonomous AI agents combine large language models with planning, memory, and external tools to accomplish multi-step objectives without constant human guidance. They observe their environment, reason about next actions, call external APIs, and iteratively refine their outputs.',
  },
  {
    label: 'Cloud Computing',
    text: 'Cloud computing delivers on-demand computing services, from applications to storage and processing power, over the internet on a pay-as-you-go basis. Organizations leverage the cloud to increase agility, accelerate innovation, and scale resources elastically.',
  },
]

export function SummarizerCard({ apiBase = API_BASE }: SummarizerCardProps = {}) {
  const [text, setText] = useState<string>(TEXT_PRESETS[0].text)
  const [submittingSummarize, setSubmittingSummarize] = useState<boolean>(false)
  const [summary, setSummary] = useState<string | null>(null)
  const [summarizeError, setSummarizeError] = useState<string | null>(null)

  const handleSummarize = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const trimmedText = text.trim()
    if (!trimmedText) return

    setSubmittingSummarize(true)
    setSummarizeError(null)

    try {
      const res = await fetch(`${apiBase}/api/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: trimmedText }),
        signal: AbortSignal.timeout(25000),
      })

      if (!res.ok) {
        const errJson = await res.json().catch(() => null)
        throw new Error(errJson?.detail || `Server returned HTTP ${res.status}`)
      }

      const data: SummarizerResponse = await res.json()
      setSummary(data.summary)
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'TimeoutError') {
        setSummarizeError('Request timed out after 25 seconds. Please verify server connection and API credentials.')
      } else {
        setSummarizeError(err instanceof Error ? err.message : 'Failed to generate summary')
      }
    } finally {
      setSubmittingSummarize(false)
    }
  }

  return (
    <div className="card card-half">
      <h2>
        <span className="card-title">📝 Text Summarizer</span>
        <a className="info-link" href="info/summarizer.html" data-tooltip="Explanation" aria-label="Explanation">&#x24D8;</a>
      </h2>
      <p className="card-concept">
        Pipes <code>ChatPromptTemplate | ChatOpenAI | StrOutputParser</code> into a declarative LCEL chain.
      </p>
      <p>
        Summarize long text into a concise, friendly overview using LangChain Expression Language (LCEL).
      </p>

      <form onSubmit={handleSummarize} className="form-row">
        <textarea
          rows={3}
          placeholder="Enter long text to summarize…"
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
              className={`preset-chip ${text === preset.text ? 'active' : ''}`}
              onClick={() => setText(preset.text)}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <span className="validation">{summarizeError}</span>

        <div className="card-actions">
          <button type="submit" disabled={submittingSummarize || !text.trim()}>
            {submittingSummarize && <span className="spinner" />}
            {submittingSummarize ? 'Summarizing…' : 'Summarize Text'}
          </button>
        </div>
      </form>

      {summary && (
        <div className="result visible">
          <strong>Summary:</strong>
          {'\n\n'}
          {summary}
        </div>
      )}
    </div>
  )
}

export default SummarizerCard

