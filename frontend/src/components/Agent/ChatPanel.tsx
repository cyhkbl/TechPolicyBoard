import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Message {
  role: 'bot' | 'user'
  text: string
}

const HOTWORDS = [
  { id: 'embodied-ai', label: '具身智能' },
  { id: 'compute-network', label: '算力网' },
  { id: 'brain-computer', label: '脑机接口' },
  { id: 'quantum', label: '量子计算' },
]

const WELCOME: Message = {
  role: 'bot',
  text: '你好！选择一个技术热词，或者直接输入关键词，我来为你拆解它的技术结构、政策关联和产业动向。',
}

const BOT_RESPONSES: Record<string, string> = {
  'embodied-ai': '这是具身智能的技术结构图。鼠标悬浮各部位可以看到子技术，点击关键词查看详情。',
  'compute-network': '算力网相关内容正在建设中，敬请期待。',
  'brain-computer': '脑机接口相关内容正在建设中，敬请期待。',
  'quantum': '量子计算相关内容正在建设中，敬请期待。',
}

interface Props {
  onSelectTech: (id: string | null) => void
  activeTech: string | null
}

export function ChatPanel({ onSelectTech, activeTech }: Props) {
  const [messages, setMessages] = useState<Message[]>([WELCOME])
  const [input, setInput] = useState('')

  function handleHotword(id: string, label: string) {
    setMessages((prev) => [
      ...prev,
      { role: 'user', text: label },
      { role: 'bot', text: BOT_RESPONSES[id] ?? '内容准备中，敬请期待。' },
    ])
    onSelectTech(id)
  }

  function handleSubmit() {
    const text = input.trim()
    if (!text) return
    setMessages((prev) => [
      ...prev,
      { role: 'user', text },
      { role: 'bot', text: '暂时只支持热词导航，请点击下方按钮探索。' },
    ])
    setInput('')
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        borderRight: '1px solid #1e2640',
      }}
    >
      {/* Header */}
      <div style={{ padding: '20px 20px 12px', borderBottom: '1px solid #1e2640' }}>
        <div style={{ fontSize: 11, letterSpacing: 3, color: '#4a5280', marginBottom: 4 }}>
          TECH POLICY BOARD
        </div>
        <div style={{ fontSize: 18, fontWeight: 600, color: '#e6ecff' }}>
          科技政策看板
        </div>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '88%',
                background: msg.role === 'user' ? '#1e2a50' : '#141b35',
                border: `1px solid ${msg.role === 'user' ? '#2a3968' : '#1e2640'}`,
                borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                padding: '10px 14px',
                fontSize: 13,
                lineHeight: 1.6,
                color: msg.role === 'user' ? '#c8d4f8' : '#a8b4d8',
              }}
            >
              {msg.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Hotwords */}
      <div style={{ padding: '12px 20px 0', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {HOTWORDS.map((hw) => (
          <button
            key={hw.id}
            onClick={() => handleHotword(hw.id, hw.label)}
            style={{
              background: activeTech === hw.id ? '#2a1f5e' : 'transparent',
              border: `1px solid ${activeTech === hw.id ? '#7c5cff' : '#2a3458'}`,
              color: activeTech === hw.id ? '#c4b5fd' : '#8a93b8',
              padding: '6px 12px',
              borderRadius: 20,
              fontSize: 12,
              cursor: 'pointer',
              transition: 'all 150ms',
            }}
          >
            {hw.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding: '10px 20px 20px', display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="输入关键词探索…"
          style={{
            flex: 1,
            background: '#0d1228',
            border: '1px solid #1e2640',
            borderRadius: 8,
            color: '#e6ecff',
            padding: '9px 12px',
            fontSize: 13,
            outline: 'none',
          }}
        />
        <button
          onClick={handleSubmit}
          style={{
            background: '#1e2a50',
            border: '1px solid #2a3968',
            color: '#8a93b8',
            padding: '9px 14px',
            borderRadius: 8,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          发送
        </button>
      </div>
    </div>
  )
}
