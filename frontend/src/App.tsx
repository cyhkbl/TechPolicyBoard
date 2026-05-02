import { useEffect, useState } from 'react'
import './App.css'

type Health = { status: string }

function App() {
  const [health, setHealth] = useState<string>('...')
  const [techCount, setTechCount] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json() as Promise<Health>)
      .then((d) => setHealth(d.status))
      .catch((e) => setError(String(e)))

    fetch('/api/technologies')
      .then((r) => r.json())
      .then((d) => setTechCount(Array.isArray(d) ? d.length : 0))
      .catch((e) => setError(String(e)))
  }, [])

  return (
    <div style={{ padding: 24, fontFamily: 'system-ui' }}>
      <h1>TechPolicyBoard</h1>
      <p>
        Backend health: <strong>{health}</strong>
      </p>
      <p>
        Technologies loaded: <strong>{techCount ?? '...'}</strong>
      </p>
      {error && <p style={{ color: 'crimson' }}>Error: {error}</p>}
    </div>
  )
}

export default App
