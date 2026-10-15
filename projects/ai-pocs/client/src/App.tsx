import { useState } from 'react'
import './App.css'

// Section 1: AI Basics (01 - 10)
import { TravelGuideCard } from './components/TravelGuideCard'
import { JokeGeneratorCard } from './components/JokeGeneratorCard'
import { SummarizerCard } from './components/SummarizerCard'
import { MemoryChatCard } from './components/MemoryChatCard'
import { AgentOneToolCard } from './components/AgentOneToolCard'
import { LangchainOneToolCard } from './components/LangchainOneToolCard'
import { MultiToolAgentCard } from './components/MultiToolAgentCard'
import { ChunkingCard } from './components/ChunkingCard'
import { EmbeddingCard } from './components/EmbeddingCard'
import { RagCard } from './components/RagCard'

// Section 2: AWS Strands & Agent Workflows (11 - 22)
import { HelloWorldAgentCard } from './components/HelloWorldAgentCard'
import { LangGraphAgentCard } from './components/LangGraphAgentCard'
import { FunctionToToolCard } from './components/FunctionToToolCard'
import { TipCalculatorCard } from './components/TipCalculatorCard'
import { MultiToolSalesCard } from './components/MultiToolSalesCard'
import { CustomInventoryCard } from './components/CustomInventoryCard'
import { PrebuiltCalculatorCard } from './components/PrebuiltCalculatorCard'
import { MultiPrebuiltToolsCard } from './components/MultiPrebuiltToolsCard'
import { UseAwsCard } from './components/UseAwsCard'
import { ClassBasedToolsCard } from './components/ClassBasedToolsCard'
import { AsyncToolsCard } from './components/AsyncToolsCard'
import { TravelAssistantCard } from './components/TravelAssistantCard'

// Section 3: AI Systems & Prompting (23 - 24)
import { PromptingStrategiesCard } from './components/PromptingStrategiesCard'
import { SycophancyTrapCard } from './components/SycophancyTrapCard'

// Section 4: AI Reliability & Calibration (25 - 28)
import { CotVsDirectCard } from './components/CotVsDirectCard'
import { VarianceDeterminismCard } from './components/VarianceDeterminismCard'
import { ToolSchemaCalibrationCard } from './components/ToolSchemaCalibrationCard'
import { ToolErrorInjectionCard } from './components/ToolErrorInjectionCard'

// Section 5: FastMCP & Evals (29 - 31)
import { McpClientCard } from './components/McpClientCard'
import { McpAgentCard } from './components/McpAgentCard'
import { McpEvalsCard } from './components/McpEvalsCard'

type SectionKey = 'basics' | 'strands' | 'systems' | 'reliability' | 'mcp'

const ALL_SECTION_KEYS: SectionKey[] = ['basics', 'strands', 'systems', 'reliability', 'mcp']
const STORAGE_KEY = 'ai_pocs_expanded_sections'

function getInitialExpanded(): Record<SectionKey, boolean> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved) as string[]
      if (Array.isArray(parsed)) {
        return ALL_SECTION_KEYS.reduce((acc, key) => {
          acc[key] = parsed.includes(key)
          return acc
        }, {} as Record<SectionKey, boolean>)
      }
    }
  } catch {
    // Ignore JSON or localStorage errors
  }
  // Default: all collapsed
  return ALL_SECTION_KEYS.reduce((acc, key) => {
    acc[key] = false
    return acc
  }, {} as Record<SectionKey, boolean>)
}

interface SectionAccordionProps {
  id: SectionKey
  title: string
  count: number
  startCount: number
  isExpanded: boolean
  onToggle: () => void
  children: React.ReactNode
}

function SectionAccordion({
  id,
  title,
  count,
  startCount,
  isExpanded,
  onToggle,
  children,
}: SectionAccordionProps) {
  return (
    <div
      className={`section-accordion ${isExpanded ? '' : 'is-collapsed'}`}
      id={`section-${id}`}
    >
      <button
        type="button"
        id={`header-${id}`}
        className="section-accordion-header"
        aria-expanded={isExpanded}
        aria-controls={`content-${id}`}
        onClick={onToggle}
      >
        <div className="section-header-left">
          <span className="section-header-title">{title}</span>
        </div>
        <div className="section-header-right">
          <span className="section-count-badge">{count} Services</span>
          <span className="section-chevron" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        </div>
      </button>
      <div
        id={`content-${id}`}
        className="section-accordion-content"
        role="region"
        aria-labelledby={`header-${id}`}
      >
        <div className="grid" style={{ counterReset: `project-card ${startCount}` }}>
          {children}
        </div>
      </div>
    </div>
  )
}

function App() {
  const [expanded, setExpanded] = useState<Record<SectionKey, boolean>>(getInitialExpanded)

  const toggleSection = (key: SectionKey) => {
    setExpanded((prev) => {
      const next = { ...prev, [key]: !prev[key] }
      try {
        const activeKeys = ALL_SECTION_KEYS.filter((k) => next[k])
        localStorage.setItem(STORAGE_KEY, JSON.stringify(activeKeys))
      } catch {
        // Ignore localStorage write errors
      }
      return next
    })
  }

  const expandAll = () => {
    const next = ALL_SECTION_KEYS.reduce((acc, k) => {
      acc[k] = true
      return acc
    }, {} as Record<SectionKey, boolean>)
    setExpanded(next)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ALL_SECTION_KEYS))
    } catch {
      // Ignore
    }
  }

  const collapseAll = () => {
    const next = ALL_SECTION_KEYS.reduce((acc, k) => {
      acc[k] = false
      return acc
    }, {} as Record<SectionKey, boolean>)
    setExpanded(next)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]))
    } catch {
      // Ignore
    }
  }

  return (
    <>
      <header>
        <nav className="nav container">
          <a href="https://techtoday.click" className="brand">
            <span className="logo" aria-hidden="true" />
            <span>TechToday</span>
          </a>
          <a href="https://techtoday.click" className="nav-back-link">
            &larr; Home
          </a>
        </nav>
      </header>

      <main>
        <section className="hero">
          <div className="container">
            <h1>AI POCs</h1>
            <p className="subtitle">
              Comprehensive Suite of 31 AI Services &bull; FastAPI + React Multi-Container Architecture
            </p>
          </div>
        </section>

        <section id="tools">
          <div className="container">
            {/* Accordion Toolbar: Expand All / Collapse All */}
            <div className="accordion-toolbar">
              <div className="accordion-toolbar-info">
                <span>5 Domains</span>
                <span className="toolbar-dot">&bull;</span>
                <span>31 Interactive Services</span>
              </div>
              <div className="accordion-toolbar-actions">
                <button
                  type="button"
                  className="toolbar-action-btn"
                  onClick={expandAll}
                  aria-label="Expand all sections"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="14"
                    height="14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="7 11 12 6 17 11" />
                    <polyline points="7 17 12 12 17 17" />
                  </svg>
                  <span>Expand All</span>
                </button>
                <button
                  type="button"
                  className="toolbar-action-btn"
                  onClick={collapseAll}
                  aria-label="Collapse all sections"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="14"
                    height="14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="7 7 12 12 17 7" />
                    <polyline points="7 13 12 18 17 13" />
                  </svg>
                  <span>Collapse All</span>
                </button>
              </div>
            </div>

            {/* SECTION 1: AI BASICS (01 - 10) */}
            <SectionAccordion
              id="basics"
              title="Part 1 • AI Basics & LangChain"
              count={10}
              startCount={0}
              isExpanded={expanded.basics}
              onToggle={() => toggleSection('basics')}
            >
              <TravelGuideCard />
              <JokeGeneratorCard />
              <SummarizerCard />
              <MemoryChatCard />
              <AgentOneToolCard />
              <LangchainOneToolCard />
              <MultiToolAgentCard />
              <ChunkingCard />
              <EmbeddingCard />
              <RagCard />
            </SectionAccordion>

            {/* SECTION 2: AWS STRANDS & AGENT WORKFLOWS (11 - 22) */}
            <SectionAccordion
              id="strands"
              title="Part 2 • AWS Strands & Agent Workflows"
              count={12}
              startCount={10}
              isExpanded={expanded.strands}
              onToggle={() => toggleSection('strands')}
            >
              <HelloWorldAgentCard />
              <LangGraphAgentCard />
              <FunctionToToolCard />
              <TipCalculatorCard />
              <MultiToolSalesCard />
              <CustomInventoryCard />
              <PrebuiltCalculatorCard />
              <MultiPrebuiltToolsCard />
              <UseAwsCard />
              <ClassBasedToolsCard />
              <AsyncToolsCard />
              <TravelAssistantCard />
            </SectionAccordion>

            {/* SECTION 3: AI SYSTEMS & PROMPTING STRATEGIES (23 - 24) */}
            <SectionAccordion
              id="systems"
              title="Part 3 • AI Systems & Multi-Turn Pressure"
              count={2}
              startCount={22}
              isExpanded={expanded.systems}
              onToggle={() => toggleSection('systems')}
            >
              <PromptingStrategiesCard />
              <SycophancyTrapCard />
            </SectionAccordion>

            {/* SECTION 4: AI RELIABILITY & CALIBRATION (25 - 28) */}
            <SectionAccordion
              id="reliability"
              title="Part 4 • AI Reliability & Error Injection"
              count={4}
              startCount={24}
              isExpanded={expanded.reliability}
              onToggle={() => toggleSection('reliability')}
            >
              <CotVsDirectCard />
              <VarianceDeterminismCard />
              <ToolSchemaCalibrationCard />
              <ToolErrorInjectionCard />
            </SectionAccordion>

            {/* SECTION 5: MODEL CONTEXT PROTOCOL & EVALS (29 - 31) */}
            <SectionAccordion
              id="mcp"
              title="Part 5 • FastMCP Protocol & Automated Evals"
              count={3}
              startCount={28}
              isExpanded={expanded.mcp}
              onToggle={() => toggleSection('mcp')}
            >
              <McpClientCard />
              <McpAgentCard />
              <McpEvalsCard />
            </SectionAccordion>
          </div>
        </section>
      </main>

      <footer>
        <div className="container">
          <p>&copy; TechToday &bull; 31 Integrated AI Services</p>
        </div>
      </footer>
    </>
  )
}

export default App
