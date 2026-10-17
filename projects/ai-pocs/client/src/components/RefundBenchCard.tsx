import { useState } from 'react'
import { API_BASE } from '../config'

export interface GrievanceRuling {
  judge_id: string
  judge_name: string
  is_fallback: boolean
  provider: string
  model: string
  ruling: string
  confidence: number
  evidence_cited: string
  reasoning: string
}

export interface JudgedGrievance {
  grievance_id: string
  text: string
  category: string
  individual_rulings: GrievanceRuling[]
  vote_split: string
  verdict: string
  confidence: number
  refund_amount: number
  held_amount: number
}

export interface RefundBenchResponse {
  dispute_id: string
  total_approved_refund: number
  total_held_for_review: number
  auto_approval_cap: number
  cap_exceeded: boolean
  customer_message: string
  bench_label: string
  grievances: JudgedGrievance[]
  order_evidence?: {
    order_id?: string
    order_total?: number
    fees?: { delivery_fee?: number }
    timeline?: {
      placed_time?: string
      delivered_time?: string
      sla_duration_min?: number
      actual_duration_min?: number
    }
    measurements?: {
      pickup_weight_kg?: number
      expected_weight_kg?: number
    }
  }
}

export interface RefundBenchCardProps {
  apiBase?: string
}

const PRESET_COMPLAINTS = [
  {
    name: 'Multi-Grievance (Canonical)',
    text: "Ordered at 8:15pm and the food showed up at 9:40pm. We had guests over, it was embarrassing. Two of the four were missing completely. The raita had leaked all over the inside of the bag. And the delivery guy was rude when I asked him about it. Honestly the worst experience I've had on this app — refund everything.",
  },
  {
    name: 'Verifiable Claims Only',
    text: 'My order arrived 40 minutes past the promised time, and two of the four Chicken Biryanis were missing from the bag.',
  },
  {
    name: 'Unverifiable Conduct & Packaging',
    text: 'The raita container was crushed and leaked everywhere inside the sealed bag, and the delivery partner was rude at the door.',
  },
]

const BENCH_OPTIONS = [
  { id: 'mixed3', label: '3 Judges: OpenAI · Gemini · Groq' },
  { id: 'single', label: '1 Judge: OpenAI' },
  { id: 'openai3', label: '3 Judges: OpenAI × 3' },
  { id: 'mixed5', label: '5 Judges: Mixed Bench' },
]

const CAP_OPTIONS = [
  { value: 500, label: '₹500 (Strict Cap — Triggers Escalation)' },
  { value: 2000, label: '₹2,000 (Standard Cap)' },
  { value: 5000, label: '₹5,000 (High Cap)' },
]

export function RefundBenchCard({ apiBase = API_BASE }: RefundBenchCardProps = {}) {
  const [complaintText, setComplaintText] = useState<string>(PRESET_COMPLAINTS[0].text)
  const [bench, setBench] = useState<string>('mixed3')
  const [cap, setCap] = useState<number>(2000)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [result, setResult] = useState<RefundBenchResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [expandedGrievance, setExpandedGrievance] = useState<string | null>(null)

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`${apiBase}/api/refund-bench`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ complaint_text: complaintText, bench, cap }),
        signal: AbortSignal.timeout(45000),
      })

      if (!res.ok) {
        const errJson = await res.json().catch(() => null)
        throw new Error(errJson?.detail || `Server returned HTTP ${res.status}`)
      }
      const data: RefundBenchResponse = await res.json()
      setResult(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to adjudicate dispute')
    } finally {
      setSubmitting(false)
    }
  }

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'UPHELD':
        return '#81c784'
      case 'REJECTED':
        return '#ef9a9a'
      case 'ESCALATE':
        return '#ffe082'
      default:
        return 'var(--accent)'
    }
  }

  return (
    <div className="card card-wide">
      <h2>
        <span className="card-title">⚖️ The Refund Bench</span>
        <a className="info-link" href="info/refund-bench.html" data-tooltip="Explanation" aria-label="Explanation">&#x24D8;</a>
      </h2>
      <p className="card-concept">
        4-stage agentic dispute adjudication pipeline: frozen sensor evidence snapshot, atomic grievance extraction, multi-LLM majority voting bench, and code-driven pricing.
      </p>
      <p>
        Evaluates food order disputes with verifiable sensor data (timestamps, weights, door ratings), isolates atomic claims, runs multi-provider voting benches, and prevents hallucinated settlement amounts.
      </p>

      <form onSubmit={handleSubmit} className="form-row">
        <textarea
          rows={3}
          placeholder="Customer complaint text…"
          value={complaintText}
          onChange={(e) => setComplaintText(e.target.value)}
          required
        />

        <div className="preset-row">
          <span className="preset-label">Complaint scenario:</span>
          {PRESET_COMPLAINTS.map((p, idx) => (
            <button
              type="button"
              key={idx}
              className={`preset-chip ${complaintText === p.text ? 'active' : ''}`}
              onClick={() => setComplaintText(p.text)}
            >
              {p.name}
            </button>
          ))}
        </div>

        <div className="preset-row">
          <span className="preset-label">Judge bench:</span>
          {BENCH_OPTIONS.map((b) => (
            <button
              type="button"
              key={b.id}
              className={`preset-chip ${bench === b.id ? 'active' : ''}`}
              onClick={() => setBench(b.id)}
            >
              {b.label}
            </button>
          ))}
        </div>

        <div className="preset-row">
          <span className="preset-label">Auto-approve cap:</span>
          {CAP_OPTIONS.map((c) => (
            <button
              type="button"
              key={c.value}
              className={`preset-chip ${cap === c.value ? 'active' : ''}`}
              onClick={() => setCap(c.value)}
            >
              {c.label}
            </button>
          ))}
        </div>

        <span className="validation">{error}</span>

        <div className="card-actions">
          <button type="submit" disabled={submitting || !complaintText.trim()}>
            {submitting && <span className="spinner" />}
            {submitting ? 'Adjudicating 4 Pipeline Stages…' : 'Adjudicate Dispute'}
          </button>
        </div>
      </form>

      {result && (
        <div className="result visible" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {/* Stage 1: Evidence Snapshot & Settlement Banner */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem',
              padding: '0.5rem 0.75rem',
              background: 'var(--bg-elevated-2)',
              borderRadius: '6px',
              border: '1px solid var(--border)',
            }}
          >
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-faint)' }}>Dispute ID & Bench</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--accent)' }}>
                {result.dispute_id} &bull; {result.bench_label}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>Approved Refund</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#81c784' }}>
                  ₹{result.total_approved_refund.toFixed(0)}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>Held for Review</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffe082' }}>
                  ₹{result.total_held_for_review.toFixed(0)}
                </div>
              </div>
              <div>
                <span
                  style={{
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    background: result.cap_exceeded ? 'rgba(239, 154, 154, 0.2)' : 'rgba(129, 199, 132, 0.2)',
                    color: result.cap_exceeded ? '#ef9a9a' : '#81c784',
                    border: `1px solid ${result.cap_exceeded ? '#ef9a9a' : '#81c784'}`,
                  }}
                >
                  {result.cap_exceeded ? 'CAP EXCEEDED ➔ HUMAN REVIEW' : 'WITHIN CAP ➔ AUTO-APPROVED'}
                </span>
              </div>
            </div>
          </div>

          {/* Frozen Evidence Snapshot */}
          <details className="data-preview" open={false}>
            <summary>Stage 1 · Frozen Evidence Snapshot (Order ord_d7a41c39)</summary>
            <div className="data-preview-grid">
              <span className="data-tag">Order Total: <strong>₹1,840</strong></span>
              <span className="data-tag">Delivery Fee: <strong>₹49</strong></span>
              <span className="data-tag">Timeline: <strong>Placed 20:15 → Delivered 21:40 (85 min vs 45 min SLA)</strong></span>
              <span className="data-tag">Weight Sensor: <strong>1.2 kg actual vs 2.4 kg expected</strong></span>
              <span className="data-tag">Partner: <strong>dp_512 (5★ rated at door)</strong></span>
              <span className="data-tag">Packaging Sensor: <strong>None recorded</strong></span>
            </div>
          </details>

          {/* Grievances Adjudication Breakdown */}
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text)' }}>
              Stages 2 & 3 · Grievance Extraction & Multi-Judge Rulings ({result.grievances.length} Extracted Claims)
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {result.grievances.map((g) => {
                const isExpanded = expandedGrievance === g.grievance_id
                const verdictColor = getVerdictColor(g.verdict)

                return (
                  <div
                    key={g.grievance_id}
                    style={{
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      padding: '0.6rem 0.8rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                          <span
                            style={{
                              background: 'var(--bg-elevated-2)',
                              padding: '1px 6px',
                              borderRadius: '3px',
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              color: 'var(--accent)',
                            }}
                          >
                            {g.grievance_id.toUpperCase()}
                          </span>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              color: 'var(--text-muted)',
                              fontWeight: 500,
                            }}
                          >
                            {g.category}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text)' }}>{g.text}</div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                        <div style={{ textAlign: 'right' }}>
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              color: verdictColor,
                              border: `1px solid ${verdictColor}`,
                            }}
                          >
                            {g.verdict}
                          </span>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-faint)', marginTop: '2px' }}>
                            {g.vote_split} (conf {g.confidence.toFixed(2)})
                          </div>
                        </div>

                        <div style={{ textAlign: 'right', minWidth: '70px' }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: g.refund_amount > 0 ? '#81c784' : 'var(--text-faint)' }}>
                            {g.refund_amount > 0 ? `+₹${g.refund_amount.toFixed(0)}` : '₹0'}
                          </div>
                          {g.held_amount > 0 && (
                            <div style={{ fontSize: '0.7rem', color: '#ffe082' }}>
                              Held: ₹{g.held_amount.toFixed(0)}
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          className="preset-chip"
                          style={{ padding: '2px 6px', fontSize: '0.7rem' }}
                          onClick={() => setExpandedGrievance(isExpanded ? null : g.grievance_id)}
                        >
                          {isExpanded ? 'Hide Judges' : 'View Judges'}
                        </button>
                      </div>
                    </div>

                    {/* Detailed Judge Voting Breakdown */}
                    {isExpanded && (
                      <div
                        style={{
                          marginTop: '0.6rem',
                          paddingTop: '0.6rem',
                          borderTop: '1px dashed var(--border)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.4rem',
                        }}
                      >
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent)' }}>
                          Individual Independent Judge Ballots:
                        </div>
                        {g.individual_rulings.map((r, rIdx) => (
                          <div
                            key={rIdx}
                            style={{
                              background: 'var(--bg-elevated-2)',
                              padding: '0.4rem 0.6rem',
                              borderRadius: '4px',
                              fontSize: '0.78rem',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontWeight: 600, color: 'var(--text)' }}>
                                {r.judge_name} {r.is_fallback && <span style={{ color: '#ffe082', fontSize: '0.7rem' }}>(fallback)</span>}
                              </span>
                              <span style={{ fontWeight: 700, color: getVerdictColor(r.ruling) }}>
                                {r.ruling} (conf {r.confidence.toFixed(2)})
                              </span>
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', marginTop: '2px' }}>
                              Cited: <em>{r.evidence_cited}</em>
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                              {r.reasoning}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Stage 4: Synthesized Support Message */}
          <div
            style={{
              background: 'rgba(144, 202, 249, 0.08)',
              border: '1px solid var(--accent)',
              borderRadius: '6px',
              padding: '0.75rem 1rem',
            }}
          >
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent)', marginBottom: '0.3rem' }}>
              Stage 4 · Synthesized Customer Support Resolution Message
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text)', lineHeight: 1.5, fontStyle: 'italic' }}>
              "{result.customer_message}"
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default RefundBenchCard
