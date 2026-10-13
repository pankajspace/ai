import { useEffect, useState } from 'react'
import './App.css'

interface Item {
  id: number
  title: string
  description?: string
}

const API_BASE = import.meta.env.VITE_SERVER_URL || 'http://localhost:8000'

function App() {
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking')
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [title, setTitle] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [submitting, setSubmitting] = useState<boolean>(false)

  const fetchItems = async () => {
    setLoading(true)
    setError(null)
    try {
      const [healthRes, itemsRes] = await Promise.all([
        fetch(`${API_BASE}/health`),
        fetch(`${API_BASE}/api/items`),
      ])
      setServerStatus(healthRes.ok ? 'online' : 'offline')
      if (!itemsRes.ok) throw new Error(`HTTP error! status: ${itemsRes.status}`)
      const data = await itemsRes.json()
      setItems(data)
    } catch (err) {
      setServerStatus('offline')
      setError(err instanceof Error ? err.message : 'Failed to fetch items')
    } finally {
      setLoading(false)
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
          setServerStatus(healthRes.ok ? 'online' : 'offline')
          if (itemsRes.ok) {
            const data = await itemsRes.json()
            setItems(data)
          }
        }
      } catch {
        if (!ignore) {
          setServerStatus('offline')
        }
      } finally {
        if (!ignore) {
          setLoading(false)
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
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/api/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description: description || undefined }),
      })

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      const newItem = await res.json()
      setItems((prev) => [...prev, newItem])
      setTitle('')
      setDescription('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create item')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container">
      <header className="header">
        <h1>AI Projects Client</h1>
        <p className="subtitle">Consuming FastAPI Backend Service</p>
        <div className={`status-badge ${serverStatus}`}>
          <span className="dot" />
          Server Status:{' '}
          {serverStatus === 'online'
            ? 'Connected (Healthy)'
            : serverStatus === 'offline'
              ? 'Disconnected'
              : 'Checking...'}
        </div>
      </header>

      {error && <div className="alert-error">Error: {error}</div>}

      <main className="content-grid">
        <section className="card">
          <h2>Create New Item</h2>
          <form onSubmit={handleCreateItem} className="item-form">
            <div className="form-group">
              <label htmlFor="title">Title *</label>
              <input
                id="title"
                type="text"
                placeholder="e.g. LLM Evaluation Pipeline"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                placeholder="Optional details or notes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <button type="submit" disabled={submitting || !title.trim()} className="btn-primary">
              {submitting ? 'Adding...' : 'Add Item'}
            </button>
          </form>
        </section>

        <section className="card">
          <div className="card-header">
            <h2>Items from Server ({items.length})</h2>
            <button
              type="button"
              onClick={fetchItems}
              disabled={loading}
              className="btn-secondary"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          {loading && items.length === 0 && <p className="muted">Loading items from server...</p>}

          {!loading && items.length === 0 && (
            <p className="muted">No items found. Create one using the form.</p>
          )}

          <ul className="item-list">
            {items.map((item) => (
              <li key={item.id} className="item-card">
                <div className="item-top">
                  <span className="item-id">#{item.id}</span>
                  <h3 className="item-title">{item.title}</h3>
                </div>
                {item.description && <p className="item-desc">{item.description}</p>}
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  )
}

export default App
