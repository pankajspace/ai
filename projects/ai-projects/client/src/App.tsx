import { useEffect, useState } from 'react'
import './App.css'

interface Item {
  id: number
  title: string
  description?: string
}

interface HealthData {
  status: string
  message?: string
}

const API_BASE = import.meta.env.VITE_SERVER_URL || 'http://localhost:8000'

function App() {
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking')
  const [healthInfo, setHealthInfo] = useState<HealthData | null>(null)
  const [items, setItems] = useState<Item[]>([])
  const [loadingItems, setLoadingItems] = useState<boolean>(false)
  const [checkingHealth, setCheckingHealth] = useState<boolean>(false)
  const [lastCreated, setLastCreated] = useState<Item | null>(null)

  // Form state
  const [title, setTitle] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const checkHealth = async () => {
    setCheckingHealth(true)
    try {
      const res = await fetch(`${API_BASE}/health`)
      if (res.ok) {
        const data = await res.json()
        setServerStatus('online')
        setHealthInfo(data)
      } else {
        setServerStatus('offline')
        setHealthInfo(null)
      }
    } catch {
      setServerStatus('offline')
      setHealthInfo(null)
    } finally {
      setCheckingHealth(false)
    }
  }

  const fetchItems = async () => {
    setLoadingItems(true)
    try {
      const res = await fetch(`${API_BASE}/api/items`)
      if (res.ok) {
        const data = await res.json()
        setItems(data)
      }
    } catch {
      // Keep existing items if offline
    } finally {
      setLoadingItems(false)
    }
  }

  useEffect(() => {
    let ignore = false
    const init = async () => {
      try {
        const [healthRes, itemsRes] = await Promise.all([
          fetch(`${API_BASE}/health`),
          fetch(`${API_BASE}/api/items`),
        ])
        if (!ignore) {
          if (healthRes.ok) {
            const hData = await healthRes.json()
            setServerStatus('online')
            setHealthInfo(hData)
          } else {
            setServerStatus('offline')
          }
          if (itemsRes.ok) {
            const iData = await itemsRes.json()
            setItems(iData)
          }
        }
      } catch {
        if (!ignore) {
          setServerStatus('offline')
        }
      }
    }
    init()
    return () => {
      ignore = true
    }
  }, [])

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setSubmitting(true)
    setCreateError(null)
    try {
      const res = await fetch(`${API_BASE}/api/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), description: description.trim() || undefined }),
      })

      if (!res.ok) throw new Error(`Server returned HTTP ${res.status}`)
      const newItem: Item = await res.json()
      setItems((prev) => [...prev, newItem])
      setLastCreated(newItem)
      setTitle('')
      setDescription('')
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create item')
    } finally {
      setSubmitting(false)
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
            <h1>AI Projects</h1>
            <p className="subtitle">FastAPI + React multi-container project</p>
          </div>
        </section>

        <section id="tools">
          <div className="container">
            <div className="grid">
              {/* Card 1: Server Status */}
              <div className="card card-half">
                <h2>
                  <span className="card-title">⚡ Server Diagnostics</span>
                  <span
                    className={`badge ${
                      serverStatus === 'online' ? 'badge-healthy' : 'badge-offline'
                    }`}
                  >
                    {serverStatus === 'online'
                      ? '● Connected'
                      : serverStatus === 'offline'
                        ? '● Disconnected'
                        : '● Checking...'}
                  </span>
                </h2>
                <p>
                  Health check probe calling <code>GET /health</code> on the FastAPI service.
                </p>
                <div className="card-actions">
                  <button type="button" onClick={checkHealth} disabled={checkingHealth}>
                    {checkingHealth && <span className="spinner" />}
                    {checkingHealth ? 'Checking…' : 'Ping Server'}
                  </button>
                </div>
                <div className="result visible">
                  {serverStatus === 'online'
                    ? JSON.stringify(healthInfo || { status: 'healthy' }, null, 2)
                    : 'Server is currently offline. Ensure docker compose up or uvicorn is running.'}
                </div>
              </div>

              {/* Card 2: Create Item */}
              <div className="card card-half">
                <h2>
                  <span className="card-title">🧩 Add Item</span>
                </h2>
                <p>
                  Create an item via <code>POST /api/items</code> to verify full-stack API flow.
                </p>
                <form onSubmit={handleCreateItem} className="form-row">
                  <input
                    type="text"
                    placeholder="Item title (e.g. Prompt Optimizer)…"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Item description (optional)…"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                  <span className="validation">{createError}</span>
                  <div className="card-actions">
                    <button type="submit" disabled={submitting || !title.trim()}>
                      {submitting && <span className="spinner" />}
                      {submitting ? 'Saving…' : 'Create Item'}
                    </button>
                  </div>
                </form>
                {lastCreated && (
                  <div className="result visible">
                    Created item #{lastCreated.id}: &ldquo;{lastCreated.title}&rdquo;
                  </div>
                )}
              </div>

              {/* Card 3: Items Explorer */}
              <div className="card card-wide">
                <h2>
                  <span className="card-title">📦 Project Items</span>
                  <span className="badge badge-healthy">{items.length} items</span>
                </h2>
                <p>
                  Items retrieved from the server via <code>GET /api/items</code>.
                </p>
                <div className="card-actions">
                  <button type="button" onClick={fetchItems} disabled={loadingItems}>
                    {loadingItems && <span className="spinner" />}
                    {loadingItems ? 'Refreshing…' : 'Refresh Items'}
                  </button>
                </div>

                <div className="items-container">
                  {items.length === 0 && (
                    <div className="result visible">No items yet. Create one above!</div>
                  )}
                  {items.map((item) => (
                    <div key={item.id} className="item-entry">
                      <div className="item-entry-header">
                        <span className="item-entry-id">#{item.id}</span>
                        <span className="item-entry-title">{item.title}</span>
                      </div>
                      {item.description && (
                        <p className="item-entry-desc">{item.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
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
