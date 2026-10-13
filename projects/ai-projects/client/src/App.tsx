import './App.css'
import { TravelGuideCard } from './components/TravelGuideCard'
import { JokeGeneratorCard } from './components/JokeGeneratorCard'
import { AgentOneToolCard } from './components/AgentOneToolCard'

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

              {/* Tile 3: Single-Tool Agent Service (OpenAI) */}
              <AgentOneToolCard />
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
