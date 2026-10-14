import './App.css'
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

function App() {
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
            <h1>AI Projects</h1>
            <p className="subtitle">FastAPI + React multi-container AI services</p>
          </div>
        </section>

        <section id="tools">
          <div className="container">
            <div className="grid">
              {/* Tile 1: Travel Guide Service (OpenAI) */}
              <TravelGuideCard />

              {/* Tile 2: Joke Generator Service (Groq) */}
              <JokeGeneratorCard />

              {/* Tile 3: Text Summarizer Service (LangChain LCEL) */}
              <SummarizerCard />

              {/* Tile 4: Conversational Memory Chat (LangChain) */}
              <MemoryChatCard />

              {/* Tile 5: Single-Tool Agent Service (OpenAI) */}
              <AgentOneToolCard />

              {/* Tile 6: LangChain Single-Tool Agent Service (LangChain + Groq) */}
              <LangchainOneToolCard />

              {/* Tile 7: Multi-Tool Agent Service (LangChain + Groq) */}
              <MultiToolAgentCard />

              {/* Tile 8: Document Chunking Service (LangChain Splitter) */}
              <ChunkingCard />

              {/* Tile 9: Sentence Embedding & Similarity Service (all-MiniLM-L6-v2) */}
              <EmbeddingCard />

              {/* Tile 10: Paragraph RAG Service (LangChain + Vector Search) */}
              <RagCard />
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="container">
          <p>&copy; TechToday &bull; AI Projects</p>
        </div>
      </footer>
    </>
  )
}

export default App
