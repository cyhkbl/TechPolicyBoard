import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { CategoryTech, LeafTech, RootTech } from '../../lib/types'

interface RegionDef {
  id: string
  label: string
  labelEn: string
  anchor: { x: number; y: number }
  bubbleOffsets: { x: number; y: number }[]
  accent: string
  annotationLine: { x1: number; y1: number; x2: number; y2: number }
}

const REGIONS: Record<string, RegionDef> = {
  decision: {
    id: 'decision',
    label: '决策智能',
    labelEn: 'DECISION CORE',
    anchor: { x: 300, y: 108 },
    bubbleOffsets: [
      { x: -185, y: -55 },
      { x: 185, y: -55 },
      { x: 0, y: -120 },
    ],
    accent: '#7c5cff',
    annotationLine: { x1: 360, y1: 80, x2: 440, y2: 55 },
  },
  perception: {
    id: 'perception',
    label: '感知系统',
    labelEn: 'SENSOR ARRAY',
    anchor: { x: 300, y: 295 },
    bubbleOffsets: [
      { x: -195, y: -20 },
      { x: 195, y: -20 },
      { x: 195, y: 70 },
    ],
    accent: '#28d4c8',
    annotationLine: { x1: 380, y1: 270, x2: 450, y2: 250 },
  },
  motion: {
    id: 'motion',
    label: '运动控制',
    labelEn: 'MOTION SYSTEM',
    anchor: { x: 300, y: 510 },
    bubbleOffsets: [
      { x: -205, y: 20 },
      { x: 205, y: 20 },
      { x: 0, y: 150 },
    ],
    accent: '#ffaa3c',
    annotationLine: { x1: 395, y1: 480, x2: 455, y2: 460 },
  },
}

interface Props {
  root: RootTech
  onSelectLeaf: (leaf: LeafTech) => void
}

export function TechDiagram({ root, onSelectLeaf }: Props) {
  const [hovered, setHovered] = useState<string | null>(null)

  const categoryById: Record<string, CategoryTech | undefined> = {}
  for (const c of root.children) categoryById[c.id] = c

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 680, margin: '0 auto' }}>
      <svg
        viewBox="0 0 600 720"
        style={{ width: '100%', height: 'auto', display: 'block' }}
      >
        <defs>
          {/* Background grid */}
          <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#0d1530" strokeWidth="0.5" />
          </pattern>

          {/* Glow filters */}
          {Object.values(REGIONS).map((r) => (
            <filter key={r.id} id={`glow-${r.id}`} x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          ))}
          <filter id="glow-soft" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Scan line animation */}
          <linearGradient id="scan" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="48%" stopColor="transparent" />
            <stop offset="50%" stopColor="#1e3a5f" stopOpacity="0.6" />
            <stop offset="52%" stopColor="transparent" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>

          <clipPath id="robot-clip">
            <rect x="100" y="20" width="400" height="680" />
          </clipPath>
        </defs>

        {/* Grid background */}
        <rect width="600" height="720" fill="#060c1a" />
        <rect width="600" height="720" fill="url(#grid)" />

        {/* Subtle center glow */}
        <ellipse cx="300" cy="360" rx="180" ry="260" fill="#0a1628" opacity="0.8" />

        {/* Corner brackets */}
        {[
          [20, 20, 1, 1], [580, 20, -1, 1], [20, 700, 1, -1], [580, 700, -1, -1],
        ].map(([x, y, sx, sy], i) => (
          <g key={i} stroke="#1e3a5f" strokeWidth="1.5" fill="none">
            <path d={`M ${x} ${y + sy * 20} L ${x} ${y} L ${x + sx * 20} ${y}`} />
          </g>
        ))}

        {/* Center axis line */}
        <line x1="300" y1="30" x2="300" y2="690" stroke="#0d1f3c" strokeWidth="0.5" strokeDasharray="4,8" />

        {/* ── NECK / connector line between head and torso ── */}
        <rect x="284" y="175" width="32" height="22" fill="#0d1628"
          stroke={hovered === 'perception' ? '#28d4c8' : '#1a2548'} strokeWidth="1" />
        <line x1="300" y1="175" x2="300" y2="197"
          stroke={hovered ? '#1e3a5f' : '#0d1f3c'} strokeWidth="1" strokeDasharray="2,3" />

        {/* ── DECISION — head ── */}
        <RegionGroup
          region={REGIONS.decision}
          isHovered={hovered === 'decision'}
          onHover={(h) => setHovered(h ? 'decision' : null)}
        >
          {/* Outer ring */}
          <circle cx="300" cy="108" r="68" fill="none"
            stroke={hovered === 'decision' ? '#7c5cff' : '#1a2548'} strokeWidth="1"
            strokeDasharray={hovered === 'decision' ? '0' : '3,4'} />
          {/* Head shape */}
          <rect x="240" y="50" width="120" height="116" rx="16"
            fill={hovered === 'decision' ? '#150e2e' : '#0a1020'}
            stroke={hovered === 'decision' ? '#7c5cff' : '#1e2d50'} strokeWidth="1.5" />
          {/* Visor */}
          <rect x="256" y="76" width="88" height="28" rx="6"
            fill={hovered === 'decision' ? '#2a1a5e' : '#0d1628'}
            stroke={hovered === 'decision' ? '#7c5cff' : '#2a3a60'} strokeWidth="1" />
          {/* Eye indicators */}
          <circle cx="282" cy="90" r="5"
            fill={hovered === 'decision' ? '#7c5cff' : '#1e2d50'}
            filter={hovered === 'decision' ? 'url(#glow-soft)' : undefined} />
          <circle cx="318" cy="90" r="5"
            fill={hovered === 'decision' ? '#7c5cff' : '#1e2d50'}
            filter={hovered === 'decision' ? 'url(#glow-soft)' : undefined} />
          {/* CPU indicator lines */}
          <rect x="262" y="115" width="76" height="3" rx="1.5"
            fill={hovered === 'decision' ? '#4a2fa0' : '#0d1628'} />
          <rect x="272" y="122" width="56" height="2" rx="1"
            fill={hovered === 'decision' ? '#3a2080' : '#0a1020'} />
          {/* Top antenna */}
          <line x1="300" y1="50" x2="300" y2="32" stroke={hovered === 'decision' ? '#7c5cff' : '#1a2548'} strokeWidth="1.5" />
          <circle cx="300" cy="28" r="4"
            fill={hovered === 'decision' ? '#7c5cff' : '#1a2548'}
            filter={hovered === 'decision' ? 'url(#glow-soft)' : undefined} />
        </RegionGroup>

        {/* ── PERCEPTION — torso ── */}
        <RegionGroup
          region={REGIONS.perception}
          isHovered={hovered === 'perception'}
          onHover={(h) => setHovered(h ? 'perception' : null)}
        >
          {/* Outer shell */}
          <rect x="218" y="197" width="164" height="196" rx="20"
            fill={hovered === 'perception' ? '#061a1a' : '#080f1e'}
            stroke={hovered === 'perception' ? '#28d4c8' : '#1e2d50'} strokeWidth="1.5" />
          {/* Chest panel */}
          <rect x="236" y="218" width="128" height="72" rx="10"
            fill={hovered === 'perception' ? '#0a2828' : '#0a1428'}
            stroke={hovered === 'perception' ? '#28d4c8' : '#1a2848'} strokeWidth="1" />
          {/* Sensor grid */}
          {[0, 1, 2].map((col) =>
            [0, 1].map((row) => (
              <circle
                key={`s-${col}-${row}`}
                cx={258 + col * 38} cy={236 + row * 34} r="6"
                fill={hovered === 'perception' ? '#28d4c8' : '#0d1e38'}
                stroke={hovered === 'perception' ? '#28d4c8' : '#1a2d50'}
                strokeWidth="1"
                filter={hovered === 'perception' ? 'url(#glow-soft)' : undefined}
              />
            ))
          )}
          {/* Status bar */}
          <rect x="236" y="301" width="128" height="4" rx="2" fill="#0a1428" />
          <rect x="236" y="301" width={hovered === 'perception' ? 96 : 48} height="4" rx="2"
            fill={hovered === 'perception' ? '#28d4c8' : '#1a3050'}
            style={{ transition: 'width 400ms ease' }} />
          {/* Bottom detail */}
          <rect x="244" y="316" width="40" height="2" rx="1"
            fill={hovered === 'perception' ? '#1a8a80' : '#0d1628'} />
          <rect x="292" y="316" width="64" height="2" rx="1"
            fill={hovered === 'perception' ? '#1a8a80' : '#0d1628'} />
          <rect x="244" y="325" width="20" height="2" rx="1"
            fill={hovered === 'perception' ? '#0e5a54' : '#080f1e'} />
        </RegionGroup>

        {/* ── MOTION — arms and legs ── */}
        <RegionGroup
          region={REGIONS.motion}
          isHovered={hovered === 'motion'}
          onHover={(h) => setHovered(h ? 'motion' : null)}
        >
          {/* Left arm */}
          <rect x="158" y="205" width="50" height="168" rx="20"
            fill={hovered === 'motion' ? '#1a1000' : '#080f1e'}
            stroke={hovered === 'motion' ? '#ffaa3c' : '#1e2d50'} strokeWidth="1.5" />
          {/* Left arm joint rings */}
          <ellipse cx="183" cy="232" rx="14" ry="6"
            fill="none" stroke={hovered === 'motion' ? '#ffaa3c' : '#1a2848'} strokeWidth="1" />
          <ellipse cx="183" cy="340" rx="14" ry="6"
            fill="none" stroke={hovered === 'motion' ? '#ffaa3c' : '#1a2848'} strokeWidth="1" />
          {/* Left arm servo indicator */}
          <rect x="174" y="272" width="18" height="36" rx="3"
            fill={hovered === 'motion' ? '#2a1800' : '#0a1020'}
            stroke={hovered === 'motion' ? '#c07820' : '#1a2848'} strokeWidth="1" />

          {/* Right arm */}
          <rect x="392" y="205" width="50" height="168" rx="20"
            fill={hovered === 'motion' ? '#1a1000' : '#080f1e'}
            stroke={hovered === 'motion' ? '#ffaa3c' : '#1e2d50'} strokeWidth="1.5" />
          <ellipse cx="417" cy="232" rx="14" ry="6"
            fill="none" stroke={hovered === 'motion' ? '#ffaa3c' : '#1a2848'} strokeWidth="1" />
          <ellipse cx="417" cy="340" rx="14" ry="6"
            fill="none" stroke={hovered === 'motion' ? '#ffaa3c' : '#1a2848'} strokeWidth="1" />
          <rect x="408" y="272" width="18" height="36" rx="3"
            fill={hovered === 'motion' ? '#2a1800' : '#0a1020'}
            stroke={hovered === 'motion' ? '#c07820' : '#1a2848'} strokeWidth="1" />

          {/* Hip connector */}
          <rect x="236" y="390" width="128" height="16" rx="6"
            fill={hovered === 'motion' ? '#1a1000' : '#080f1e'}
            stroke={hovered === 'motion' ? '#ffaa3c' : '#1a2848'} strokeWidth="1" />

          {/* Left leg */}
          <rect x="238" y="406" width="52" height="190" rx="18"
            fill={hovered === 'motion' ? '#1a1000' : '#080f1e'}
            stroke={hovered === 'motion' ? '#ffaa3c' : '#1e2d50'} strokeWidth="1.5" />
          <ellipse cx="264" cy="440" rx="15" ry="6"
            fill="none" stroke={hovered === 'motion' ? '#ffaa3c' : '#1a2848'} strokeWidth="1" />
          <ellipse cx="264" cy="540" rx="15" ry="6"
            fill="none" stroke={hovered === 'motion' ? '#ffaa3c' : '#1a2848'} strokeWidth="1" />

          {/* Right leg */}
          <rect x="310" y="406" width="52" height="190" rx="18"
            fill={hovered === 'motion' ? '#1a1000' : '#080f1e'}
            stroke={hovered === 'motion' ? '#ffaa3c' : '#1e2d50'} strokeWidth="1.5" />
          <ellipse cx="336" cy="440" rx="15" ry="6"
            fill="none" stroke={hovered === 'motion' ? '#ffaa3c' : '#1a2848'} strokeWidth="1" />
          <ellipse cx="336" cy="540" rx="15" ry="6"
            fill="none" stroke={hovered === 'motion' ? '#ffaa3c' : '#1a2848'} strokeWidth="1" />

          {/* Feet */}
          <rect x="228" y="590" width="72" height="18" rx="8"
            fill={hovered === 'motion' ? '#120c00' : '#060c18'}
            stroke={hovered === 'motion' ? '#c07820' : '#1a2848'} strokeWidth="1" />
          <rect x="300" y="590" width="72" height="18" rx="8"
            fill={hovered === 'motion' ? '#120c00' : '#060c18'}
            stroke={hovered === 'motion' ? '#c07820' : '#1a2848'} strokeWidth="1" />
        </RegionGroup>

        {/* ── Annotation lines + labels (always visible, accent color on hover) ── */}
        {Object.values(REGIONS).map((r) => {
          const active = hovered === r.id
          return (
            <g key={`ann-${r.id}`} style={{ pointerEvents: 'none' }}>
              <line
                x1={r.annotationLine.x1} y1={r.annotationLine.y1}
                x2={r.annotationLine.x2} y2={r.annotationLine.y2}
                stroke={active ? r.accent : '#1e2d50'}
                strokeWidth="1"
                strokeDasharray="3,3"
                style={{ transition: 'stroke 200ms' }}
              />
              <line
                x1={r.annotationLine.x2} y1={r.annotationLine.y2}
                x2={r.annotationLine.x2 + 30} y2={r.annotationLine.y2}
                stroke={active ? r.accent : '#1e2d50'}
                strokeWidth="1"
                style={{ transition: 'stroke 200ms' }}
              />
              <text
                x={r.annotationLine.x2 + 34}
                y={r.annotationLine.y2 + 4}
                fontSize="9"
                letterSpacing="1.5"
                fill={active ? r.accent : '#2a3c6a'}
                style={{ transition: 'fill 200ms', fontFamily: 'ui-monospace, monospace' }}
              >
                {r.labelEn}
              </text>
              <text
                x={r.annotationLine.x2 + 34}
                y={r.annotationLine.y2 + 16}
                fontSize="11"
                fill={active ? r.accent : '#3a4e7a'}
                style={{ transition: 'fill 200ms' }}
              >
                {r.label}
              </text>
            </g>
          )
        })}

        {/* Scan line animation */}
        <motion.rect
          x="100" width="400" height="8"
          fill="url(#scan)"
          animate={{ y: [20, 700] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
          opacity="0.5"
        />
      </svg>

      {/* ── Keyword bubbles (HTML overlay) ── */}
      <AnimatePresence>
        {hovered &&
          categoryById[hovered]?.children.slice(0, 3).map((leaf, i) => {
            const region = REGIONS[hovered]
            const offset = region.bubbleOffsets[i] ?? { x: 0, y: 0 }
            const xPct = ((region.anchor.x + offset.x) / 600) * 100
            const yPct = ((region.anchor.y + offset.y) / 720) * 100
            return (
              <motion.button
                key={leaf.id}
                initial={{ opacity: 0, scale: 0.7, x: '-50%', y: '-50%' }}
                animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
                exit={{ opacity: 0, scale: 0.7, x: '-50%', y: '-50%' }}
                transition={{ type: 'spring', damping: 20, stiffness: 280, delay: i * 0.05 }}
                onClick={() => onSelectLeaf(leaf)}
                style={{
                  position: 'absolute',
                  left: `${xPct}%`,
                  top: `${yPct}%`,
                  background: `rgba(6, 12, 26, 0.95)`,
                  border: `1px solid ${region.accent}`,
                  color: region.accent,
                  padding: '6px 12px',
                  borderRadius: 4,
                  fontSize: 12,
                  fontFamily: 'ui-monospace, monospace',
                  letterSpacing: '0.05em',
                  cursor: 'pointer',
                  boxShadow: `0 0 16px ${region.accent}44, inset 0 0 12px ${region.accent}0a`,
                  whiteSpace: 'nowrap',
                  backdropFilter: 'blur(4px)',
                }}
              >
                <span style={{ opacity: 0.5, marginRight: 4, fontSize: 9 }}>▶</span>
                {leaf.name}
              </motion.button>
            )
          })}
      </AnimatePresence>
    </div>
  )
}

function RegionGroup({
  region,
  isHovered,
  onHover,
  children,
}: {
  region: RegionDef
  isHovered: boolean
  onHover: (h: boolean) => void
  children: React.ReactNode
}) {
  return (
    <g
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      style={{ cursor: 'crosshair' }}
      filter={isHovered ? `url(#glow-${region.id})` : undefined}
    >
      {children}
    </g>
  )
}
