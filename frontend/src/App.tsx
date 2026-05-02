import { useState } from 'react'
import { ChatPanel } from './components/Agent/ChatPanel'
import { TechExplorer } from './components/TechExplorer/TechExplorer'

function App() {
  const [activeTech, setActiveTech] = useState<string | null>(null)

  return (
    <div
      style={{
        height: '100vh',
        display: 'grid',
        gridTemplateColumns: '320px 1fr',
        background: '#070b18',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
        overflow: 'hidden',
      }}
    >
      <ChatPanel
        activeTech={activeTech}
        onSelectTech={(id) => setActiveTech(id)}
      />
      <TechExplorer visible={activeTech === 'embodied-ai'} />
    </div>
  )
}

export default App
