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

type CategoryKey = 'all' | 'basics' | 'strands' | 'systems' | 'reliability' | 'mcp'

interface CategoryTab {
  key: CategoryKey
  label: string
  count: number
}

const CATEGORIES: CategoryTab[] = [
  { key: 'all', label: 'All Services', count: 31 },
  { key: 'basics', label: 'AI Basics', count: 10 },
  { key: 'strands', label: 'AWS Strands & Agents', count: 12 },
  { key: 'systems', label: 'AI Systems', count: 2 },
  { key: 'reliability', label: 'AI Reliability', count: 4 },
  { key: 'mcp', label: 'MCP & Evals', count: 3 },
]

function App() {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('all')

  const showSection = (cat: CategoryKey) => activeCategory === 'all' || activeCategory === cat

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
            {/* Category Navigation Pills */}
            <div className="category-bar">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  className={`category-tab ${activeCategory === cat.key ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat.key)}
                >
                  {cat.label} ({cat.count})
                </button>
              ))}
            </div>

            {/* SECTION 1: AI BASICS (01 - 10) */}
            {showSection('basics') && (
              <div>
                <div className="section-heading">
                  <span>Part 1 &bull; AI Basics & LangChain</span>
                  <span className="section-count">10 Services</span>
                </div>
                <div className="grid">
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
                </div>
              </div>
            )}

            {/* SECTION 2: AWS STRANDS & AGENT WORKFLOWS (11 - 22) */}
            {showSection('strands') && (
              <div>
                <div className="section-heading">
                  <span>Part 2 &bull; AWS Strands & Agent Workflows</span>
                  <span className="section-count">12 Services</span>
                </div>
                <div className="grid">
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
                </div>
              </div>
            )}

            {/* SECTION 3: AI SYSTEMS & PROMPTING STRATEGIES (23 - 24) */}
            {showSection('systems') && (
              <div>
                <div className="section-heading">
                  <span>Part 3 &bull; AI Systems & Multi-Turn Pressure</span>
                  <span className="section-count">2 Services</span>
                </div>
                <div className="grid">
                  <PromptingStrategiesCard />
                  <SycophancyTrapCard />
                </div>
              </div>
            )}

            {/* SECTION 4: AI RELIABILITY & CALIBRATION (25 - 28) */}
            {showSection('reliability') && (
              <div>
                <div className="section-heading">
                  <span>Part 4 &bull; AI Reliability & Error Injection</span>
                  <span className="section-count">4 Services</span>
                </div>
                <div className="grid">
                  <CotVsDirectCard />
                  <VarianceDeterminismCard />
                  <ToolSchemaCalibrationCard />
                  <ToolErrorInjectionCard />
                </div>
              </div>
            )}

            {/* SECTION 5: MODEL CONTEXT PROTOCOL & EVALS (29 - 31) */}
            {showSection('mcp') && (
              <div>
                <div className="section-heading">
                  <span>Part 5 &bull; FastMCP Protocol & Automated Evals</span>
                  <span className="section-count">3 Services</span>
                </div>
                <div className="grid">
                  <McpClientCard />
                  <McpAgentCard />
                  <McpEvalsCard />
                </div>
              </div>
            )}
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
