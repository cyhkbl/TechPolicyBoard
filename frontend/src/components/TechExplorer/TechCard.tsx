import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { LeafTech } from '../../lib/types'

interface Props {
  leaf: LeafTech | null
  onClose: () => void
}

export function TechCard({ leaf, onClose }: Props) {
  useEffect(() => {
    if (!leaf) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [leaf, onClose])

  return (
    <AnimatePresence>
      {leaf && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.4)',
              zIndex: 50,
            }}
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 240 }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: 'min(440px, 100%)',
              background: '#0f1530',
              borderLeft: '1px solid #2a3458',
              color: '#e6ecff',
              padding: 28,
              overflowY: 'auto',
              zIndex: 60,
              boxShadow: '-20px 0 40px rgba(0,0,0,0.4)',
            }}
          >
            <button
              onClick={onClose}
              aria-label="Close"
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: 'transparent',
                border: 'none',
                color: '#8a93b8',
                fontSize: 20,
                cursor: 'pointer',
              }}
            >
              ✕
            </button>

            <h2 style={{ margin: '0 0 6px', fontSize: 22 }}>{leaf.name}</h2>
            <p style={{ color: '#a8b1d6', lineHeight: 1.6, marginTop: 8 }}>
              {leaf.description}
            </p>

            {leaf.capability && (
              <Section title="能力边界">
                <p style={{ color: '#cdd6f4', lineHeight: 1.6 }}>{leaf.capability}</p>
              </Section>
            )}

            {leaf.achievements && leaf.achievements.length > 0 && (
              <Section title="近期成果">
                <ul style={{ paddingLeft: 18, margin: 0 }}>
                  {leaf.achievements.map((a, i) => (
                    <li key={i} style={{ marginBottom: 8, color: '#cdd6f4' }}>
                      <a
                        href={a.source}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: '#7c5cff', textDecoration: 'none' }}
                      >
                        {a.title}
                      </a>
                      <span style={{ color: '#6b7299', marginLeft: 8 }}>
                        {a.date}
                      </span>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
              <PlaceholderBtn>查看相关政策</PlaceholderBtn>
              <PlaceholderBtn>查看产业应用</PlaceholderBtn>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 22 }}>
      <h3
        style={{
          margin: '0 0 8px',
          fontSize: 12,
          letterSpacing: 2,
          textTransform: 'uppercase',
          color: '#8a93b8',
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  )
}

function PlaceholderBtn({ children }: { children: React.ReactNode }) {
  return (
    <button
      disabled
      style={{
        background: 'transparent',
        border: '1px solid #2a3458',
        color: '#6b7299',
        padding: '8px 14px',
        borderRadius: 8,
        fontSize: 12,
        cursor: 'not-allowed',
      }}
    >
      {children}
    </button>
  )
}
