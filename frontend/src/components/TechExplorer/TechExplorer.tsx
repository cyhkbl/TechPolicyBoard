import { useState } from 'react'
import { useTechnologies } from '../../lib/useTechnologies'
import type { LeafTech } from '../../lib/types'
import { TechDiagram } from './TechDiagram'
import { TechCard } from './TechCard'

interface Props {
  visible: boolean
}

export function TechExplorer({ visible }: Props) {
  const { data, error } = useTechnologies()
  const [selected, setSelected] = useState<LeafTech | null>(null)

  if (!visible) {
    return (
      <div
        style={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#2a3458',
          fontSize: 14,
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <div style={{ fontSize: 48, opacity: 0.3 }}>⬡</div>
        <div>点击左侧热词开始探索</div>
      </div>
    )
  }

  if (error) return <p style={{ color: 'crimson', padding: 24 }}>加载失败：{error}</p>
  if (!data) return <p style={{ color: '#8a93b8', padding: 24 }}>加载中…</p>

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '24px 16px' }}>
      <header style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 11, letterSpacing: 3, color: '#4a5280', marginBottom: 6 }}>
          TECH EXPLORER
        </div>
        <h1 style={{ margin: 0, fontSize: 24, color: '#e6ecff' }}>{data.name}</h1>
        <p style={{ color: '#6b7299', marginTop: 6, fontSize: 12 }}>
          悬浮部位 → 子技术 · 点击关键词 → 详情
        </p>
      </header>

      <TechDiagram root={data} onSelectLeaf={setSelected} />
      <TechCard leaf={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
