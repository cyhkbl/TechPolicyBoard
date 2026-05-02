import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ExternalLink, Info } from 'lucide-react';
import { TechnologyType, TechSubComponent } from '../types';
import { TECH_DATA } from '../constants';
import { cn } from '../lib/utils';
import { TechIllustration, getTechBg } from './TechIllustration';

type HotspotCfg = { x: number; y: number; accent: string; label: string; burstAngles: number[] };

// Hotspot configs keyed by techId → categoryId
const HOTSPOT_CONFIGS: Record<string, Record<string, HotspotCfg>> = {
  'embodied-ai': {
    cognition:   { x: 50, y: 11, accent: '#a78bfa', label: '决策智能', burstAngles: [145, 168, 30] },
    perception:  { x: 50, y: 36, accent: '#38bdf8', label: '感知系统', burstAngles: [155, 180, 205] },
    motion:      { x: 50, y: 70, accent: '#fb923c', label: '运动控制', burstAngles: [-25, 25, 205] },
    intelligence:{ x: 50, y: 11, accent: '#a78bfa', label: '决策智能', burstAngles: [145, 168, 30] },
  },
  'bci': {
    // brain image (1080×809 landscape): brain=center, electrodes=top, decode=bottom-left
    perception:  { x: 50, y: 42, accent: '#38bdf8', label: '感知系统', burstAngles: [155, 180, 205] },
    motion:      { x: 47, y: 22, accent: '#fb923c', label: '运动控制', burstAngles: [20, -20, 160] },
    cognition:   { x: 22, y: 76, accent: '#a78bfa', label: '决策智能', burstAngles: [-20, 30, 80] },
    intelligence:{ x: 22, y: 76, accent: '#a78bfa', label: '决策智能', burstAngles: [-20, 30, 80] },
  },
  'quantum': {
    perception:  { x: 50, y: 40, accent: '#38bdf8', label: '感知系统', burstAngles: [155, 180, 25] },
    motion:      { x: 50, y: 22, accent: '#fb923c', label: '运动控制', burstAngles: [145, 168, 30] },
    cognition:   { x: 50, y: 72, accent: '#a78bfa', label: '决策智能', burstAngles: [155, 180, 25] },
    intelligence:{ x: 50, y: 72, accent: '#a78bfa', label: '决策智能', burstAngles: [155, 180, 25] },
  },
  'fusion': {
    perception:  { x: 50, y: 40, accent: '#38bdf8', label: '感知系统', burstAngles: [155, 180, 25] },
    motion:      { x: 50, y: 22, accent: '#fb923c', label: '运动控制', burstAngles: [145, 168, 30] },
    cognition:   { x: 50, y: 72, accent: '#a78bfa', label: '决策智能', burstAngles: [155, 180, 25] },
    intelligence:{ x: 50, y: 72, accent: '#a78bfa', label: '决策智能', burstAngles: [155, 180, 25] },
  },
};

function getAspectRatio(_techId: string) {
  return '0.72';
}

const BURST_RADIUS = 130; // px

interface TechExplorerProps {
  techId: TechnologyType;
  onNavigateToPolicy?: (policyId: string) => void;
  onNavigateToIndustry?: (industryId: string) => void;
}

export default function TechExplorer({ techId, onNavigateToPolicy, onNavigateToIndustry }: TechExplorerProps) {
  const data = TECH_DATA[techId] || TECH_DATA['embodied-ai'];
  const [hoveredCat, setHoveredCat] = useState<string | null>(null);
  const [selectedSub, setSelectedSub] = useState<TechSubComponent | null>(null);

  useEffect(() => { setSelectedSub(null); setHoveredCat(null); }, [techId]);
  useEffect(() => {
    if (!selectedSub) return;
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelectedSub(null); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [selectedSub]);

  return (
    <div className="relative w-full h-full flex overflow-hidden">
      {/* ── LEFT: Illustration with hotspots ── */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden border-r border-high-text"
        style={{ background: getTechBg(techId) }}>

        {/* Illustration container */}
        <div className="relative h-full max-h-full flex items-center justify-center"
          style={{ aspectRatio: getAspectRatio(techId) }}>
          <TechIllustration techId={techId} hoveredCat={hoveredCat} />

          {/* Tech label */}
          <div className="absolute bottom-5 left-5 pointer-events-none">
            <div className={`text-[9px] font-mono uppercase tracking-widest ${techId==='bci'?'text-white/30':'text-black/30'}`}>Tech Explorer</div>
            <div className={`text-xl font-serif italic ${techId==='bci'?'text-white/60':'text-black/60'}`}>{data.name}</div>
          </div>

          {/* ── Hotspots ── */}
          {data.categories.map((cat) => {
            const cfgMap = HOTSPOT_CONFIGS[techId] ?? HOTSPOT_CONFIGS['embodied-ai'];
            const cfg = cfgMap[cat.id];
            if (!cfg) return null;
            const isHovered = hoveredCat === cat.id;

            return (
              <div
                key={cat.id}
                className="absolute"
                style={{ left: `${cfg.x}%`, top: `${cfg.y}%`, transform: 'translate(-50%, -50%)' }}
                onMouseEnter={() => setHoveredCat(cat.id)}
                onMouseLeave={() => setHoveredCat(null)}
              >
                {/* Pulse ring */}
                <motion.div
                  className="absolute rounded-full"
                  style={{ border: `1.5px solid ${cfg.accent}`, inset: -14 }}
                  animate={{ scale: isHovered ? [1, 1.3, 1] : 1, opacity: isHovered ? 1 : 0.5 }}
                  transition={{ duration: 1.2, repeat: isHovered ? Infinity : 0 }}
                />

                {/* Center dot */}
                <motion.div
                  className="relative z-10 rounded-full cursor-pointer flex items-center justify-center"
                  style={{ width: 14, height: 14, background: cfg.accent, boxShadow: isHovered ? `0 0 18px ${cfg.accent}` : 'none' }}
                  animate={{ scale: isHovered ? 1.3 : 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="w-2 h-2 rounded-full bg-white/80" />
                </motion.div>

                {/* Category label pill — shown when NOT hovered and no sub selected */}
                <AnimatePresence>
                  {!isHovered && (
                    <motion.div
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -4 }}
                      className="absolute left-5 top-1/2 -translate-y-1/2 whitespace-nowrap pointer-events-none"
                    >
                      <span
                        className="text-[11px] font-bold px-2 py-0.5"
                        style={{ background: cfg.accent, color: 'white' }}
                      >
                        {cfg.label}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ── Burst sub-components ── */}
                <AnimatePresence>
                  {isHovered && cat.subComponents.slice(0, 3).map((sub, i) => {
                    const angleDeg = cfg.burstAngles[i] ?? (i * 60 - 60);
                    const angleRad = (angleDeg * Math.PI) / 180;
                    const tx = Math.cos(angleRad) * BURST_RADIUS;
                    const ty = Math.sin(angleRad) * BURST_RADIUS;
                    const isSelected = selectedSub?.id === sub.id;

                    return (
                      <motion.button
                        key={sub.id}
                        initial={{ x: 0, y: 0, opacity: 0, scale: 0.5 }}
                        animate={{ x: tx, y: ty, opacity: 1, scale: 1 }}
                        exit={{ x: 0, y: 0, opacity: 0, scale: 0.5 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 22, delay: i * 0.05 }}
                        onClick={(e) => { e.stopPropagation(); setSelectedSub(sub); }}
                        className={cn(
                          'absolute -translate-x-1/2 -translate-y-1/2 text-left px-3 py-2 text-[11px] font-bold leading-tight whitespace-nowrap z-20',
                          'shadow-lg backdrop-blur-sm',
                        )}
                        style={{
                          top: 7, left: 7,
                          background: isSelected ? cfg.accent : 'rgba(255,255,255,0.95)',
                          color: isSelected ? 'white' : '#141414',
                          border: `1.5px solid ${cfg.accent}`,
                          boxShadow: `0 4px 16px ${cfg.accent}33`,
                        }}
                      >
                        {sub.shortLabel || sub.name}
                        <div className="text-[9px] font-mono opacity-50 font-normal mt-0.5">
                          {sub.id}
                        </div>
                      </motion.button>
                    );
                  })}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── RIGHT: Detail Card ── */}
      <div className="w-[400px] bg-white flex flex-col relative overflow-hidden">
        <AnimatePresence mode="wait">
          {selectedSub ? (
            <motion.div
              key={selectedSub.id}
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 40, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="flex-1 flex flex-col p-8 overflow-y-auto"
            >
              <div className="flex justify-between items-start mb-8">
                <div>
                  <div className="text-[10px] font-mono text-high-accent font-bold mb-1 uppercase">
                    COMPONENT · {selectedSub.id.toUpperCase()}
                  </div>
                  <h2 className="text-3xl font-serif italic leading-none">{selectedSub.name}</h2>
                </div>
                <button
                  onClick={() => setSelectedSub(null)}
                  className="px-2 py-1 border border-high-text text-[9px] font-mono uppercase hover:bg-high-text hover:text-white transition-colors shrink-0 ml-4"
                >
                  Close [ESC]
                </button>
              </div>

              <div className="space-y-7 flex-1">
                <section>
                  <h3 className="text-[10px] font-mono border-b border-high-text pb-1 mb-3 uppercase tracking-widest font-bold">
                    名词解释 / Abstract
                  </h3>
                  <p className="text-[13px] leading-relaxed opacity-80">{selectedSub.description}</p>
                </section>

                <section>
                  <h3 className="text-[10px] font-mono border-b border-high-text pb-1 mb-3 uppercase tracking-widest font-bold">
                    能力边界 / Capability
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-green-500/5 border border-green-700/20">
                      <span className="text-[9px] font-bold text-green-700 uppercase block mb-2">✓ 能做到</span>
                      <ul className="space-y-1.5">
                        {selectedSub.capabilityCan.map((item, i) => (
                          <li key={i} className="text-[10px] leading-snug opacity-80 flex gap-1.5">
                            <span className="text-green-700 shrink-0">＋</span>{item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-3 bg-red-500/5 border border-red-700/20">
                      <span className="text-[9px] font-bold text-red-700 uppercase block mb-2">✗ 做不到</span>
                      <ul className="space-y-1.5">
                        {selectedSub.capabilityCannot.map((item, i) => (
                          <li key={i} className="text-[10px] leading-snug opacity-80 flex gap-1.5">
                            <span className="text-red-700 shrink-0">－</span>{item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </section>

                {selectedSub.recentAchievements.length > 0 && (
                  <section>
                    <h3 className="text-[10px] font-mono border-b border-high-text pb-1 mb-3 uppercase tracking-widest font-bold">
                      近期成果 / Milestones
                    </h3>
                    <ul className="space-y-3">
                      {selectedSub.recentAchievements.map((ach, i) => (
                        <li key={i} className="flex gap-3 items-start group">
                          <div className="w-2 h-2 bg-high-accent mt-1.5 shrink-0 group-hover:rotate-45 transition-transform" />
                          <div className="flex-1 min-w-0">
                            <div className="text-[9px] font-mono opacity-40 mb-0.5">{ach.date}</div>
                            <div className="text-[12px] leading-snug">{ach.title}</div>
                            {ach.source && (
                              <a
                                href={ach.source}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-1 inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider opacity-40 hover:text-high-accent hover:opacity-100 transition-all"
                              >
                                Source <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </div>

              <div className="mt-auto pt-8 flex gap-2">
                <button
                  onClick={() => onNavigateToPolicy?.('')}
                  className="flex-1 h-11 border border-high-text text-[10px] font-bold uppercase hover:bg-high-text hover:text-white transition-all"
                >
                  查看相关政策
                </button>
                <button
                  onClick={() => onNavigateToIndustry?.('')}
                  className="flex-1 h-11 border border-high-text text-[10px] font-bold uppercase hover:bg-high-text hover:text-white transition-all"
                >
                  查看产业应用
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-20 select-none">
              <Info className="w-12 h-12 mb-4 stroke-1" />
              <p className="text-xs uppercase tracking-[0.2em] font-bold">
                Hover a hotspot<br />then click a component
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── SVG Robot Illustration ──────────────────────────────────────────────────

function RobotSVG({ hoveredCat }: { hoveredCat: string | null }) {
  const aC = hoveredCat === 'cognition' || hoveredCat === 'intelligence';
  const aP = hoveredCat === 'perception';
  const aM = hoveredCat === 'motion';

  const C = '#a78bfa'; // cognition purple
  const P = '#38bdf8'; // perception sky-blue
  const M = '#fb923c'; // motion orange
  const DIM = '#1e3252';
  const BASE = '#07111f';
  const MID  = '#0c1a2e';

  const s  = (a: boolean, c: string) => a ? c : DIM;
  const f  = (a: boolean, c: string) => a ? c + '20' : BASE;
  const fi = (a: boolean, c: string) => a ? c + '35' : MID;

  return (
    <svg viewBox="0 0 380 680" className="h-full w-auto select-none" style={{ maxHeight: '100%' }}>
      <defs>
        <radialGradient id="bg" cx="50%" cy="38%" r="58%">
          <stop offset="0%" stopColor="#111c35"/>
          <stop offset="100%" stopColor="#05090f"/>
        </radialGradient>
        <pattern id="g" width="22" height="22" patternUnits="userSpaceOnUse">
          <path d="M22 0L0 0 0 22" fill="none" stroke="#ffffff" strokeWidth="0.25" opacity="0.055"/>
        </pattern>

        {/* Per-zone glow filters */}
        {[['fc',C],['fp',P],['fm',M]].map(([id,c])=>(
          <filter key={id} id={id} x="-70%" y="-70%" width="240%" height="240%">
            <feGaussianBlur stdDeviation="8" result="b"/>
            <feFlood floodColor={c} floodOpacity="0.25" result="fc"/>
            <feComposite in="fc" in2="b" operator="in" result="gc"/>
            <feMerge><feMergeNode in="gc"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        ))}
        <filter id="sg" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="4" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>

        {/* Body-part gradients for 3-D depth */}
        <linearGradient id="gHead" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={aC ? '#1e1040' : '#10192e'}/>
          <stop offset="100%" stopColor={aC ? '#0a0620' : '#060d1a'}/>
        </linearGradient>
        <linearGradient id="gTorso" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor={aP ? '#041e30' : '#0c1726'}/>
          <stop offset="100%" stopColor={aP ? '#021018' : '#060e1c'}/>
        </linearGradient>
        <linearGradient id="gLimb" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={aM ? '#1a0e00' : '#0a1020'}/>
          <stop offset="60%" stopColor={aM ? '#100800' : '#060c16'}/>
        </linearGradient>
        <linearGradient id="visor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={aC ? C+'80' : '#1a2840'}/>
          <stop offset="100%" stopColor={aC ? C+'15' : '#0c1828'}/>
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width="380" height="680" fill="url(#bg)" rx="16"/>
      <rect width="380" height="680" fill="url(#g)" rx="16"/>

      {/* ══════════════ COGNITION — HEAD ══════════════ */}
      <g filter={aC ? 'url(#fc)' : undefined}>
        {/* Helmet — wide brow, cheekbones, narrower chin */}
        <path d="M 190 32 Q 240 28 258 62 L 260 98 Q 260 128 230 132 L 190 134 L 150 132 Q 120 128 120 98 L 122 62 Q 140 28 190 32 Z"
          fill="url(#gHead)" stroke={s(aC,C)} strokeWidth="1.8"/>

        {/* Temple side panels */}
        <path d="M 122 72 Q 106 75 102 92 Q 100 108 115 112 L 122 110 Z"
          fill={fi(aC,C)} stroke={s(aC,C)} strokeWidth="1.2"/>
        <path d="M 258 72 Q 274 75 278 92 Q 280 108 265 112 L 258 110 Z"
          fill={fi(aC,C)} stroke={s(aC,C)} strokeWidth="1.2"/>
        {/* Temple vents */}
        {[76,85,94].map(y=>(
          <line key={y} x1={106} y1={y} x2={120} y2={y+2}
            stroke={s(aC,C)} strokeWidth="0.8" opacity={aC?0.8:0.3}/>
        ))}
        {[76,85,94].map(y=>(
          <line key={y+'r'} x1={260} y1={y+2} x2={274} y2={y}
            stroke={s(aC,C)} strokeWidth="0.8" opacity={aC?0.8:0.3}/>
        ))}

        {/* Visor band */}
        <path d="M 132 64 Q 132 56 140 56 L 240 56 Q 248 56 248 64 L 248 98 Q 248 106 240 106 L 140 106 Q 132 106 132 98 Z"
          fill="url(#visor)" stroke={s(aC,C)} strokeWidth="1.3"/>
        {/* Visor inner shine */}
        <path d="M 135 58 L 240 58 Q 246 58 246 64 L 246 68 Q 220 62 135 64 Z"
          fill="white" opacity={aC ? 0.08 : 0.03}/>

        {/* Eyes */}
        {[158,222].map((cx,i)=>(
          <g key={i}>
            <circle cx={cx} cy={80} r={aC?10:8} fill={aC?C+'40':BASE}
              stroke={s(aC,C)} strokeWidth="1.4"/>
            <circle cx={cx} cy={80} r={aC?6:4} fill={aC?C:MID}
              filter={aC?'url(#sg)':undefined}/>
            {aC && <circle cx={cx-2} cy={77} r={2} fill="white" opacity="0.5"/>}
          </g>
        ))}

        {/* Brow ridge */}
        <path d="M 138 54 Q 158 48 190 47 Q 222 48 242 54"
          fill="none" stroke={s(aC,C)} strokeWidth="1" opacity={aC?0.9:0.3}/>

        {/* Chin grille */}
        <rect x="152" y="112" width="76" height="18" rx="4"
          fill={fi(aC,C)} stroke={s(aC,C)} strokeWidth="1"/>
        {[0,1,2,3,4].map(i=>(
          <line key={i} x1={158+i*12} y1={114} x2={157+i*12} y2={128}
            stroke={s(aC,C)} strokeWidth="1.1" opacity={aC?0.7:0.25}/>
        ))}

        {/* Status bar */}
        <rect x="140" y="133" width="100" height="3" rx="1.5" fill={BASE}/>
        <rect x="140" y="133" width={aC?78:30} height="3" rx="1.5"
          fill={aC?C:DIM} style={{transition:'width 500ms ease'}}/>

        {/* Antenna */}
        <line x1="190" y1="32" x2="190" y2="14" stroke={s(aC,C)} strokeWidth="1.8"/>
        <path d="M 186 14 L 190 6 L 194 14 Z" fill={s(aC,C)} opacity={aC?1:0.5}/>
        {aC && <circle cx="190" cy="6" r="6" fill={C} opacity="0.3" filter="url(#sg)"/>}

        {/* Annotation */}
        <line x1="258" y1="70" x2="292" y2="52" stroke={s(aC,C)} strokeWidth="0.9"
          strokeDasharray="3,3" opacity={aC?0.9:0.2}/>
        <line x1="292" y1="52" x2="338" y2="52" stroke={s(aC,C)} strokeWidth="0.9" opacity={aC?0.9:0.2}/>
        <text x="296" y="47" fontSize="8" fontFamily="monospace" letterSpacing="1.5"
          fill={s(aC,C)} opacity={aC?1:0.35}>COGNITION</text>
        <text x="296" y="58" fontSize="7" fontFamily="monospace"
          fill={s(aC,C)} opacity={aC?0.6:0.2}>决策智能</text>
      </g>

      {/* NECK */}
      <rect x="170" y="135" width="40" height="22" rx="5"
        fill={MID} stroke={DIM} strokeWidth="1"/>
      {[177,184,191,198,205].map(x=>(
        <line key={x} x1={x} y1={136} x2={x} y2={156}
          stroke={DIM} strokeWidth="0.7" opacity="0.6"/>
      ))}

      {/* ══════════════ PERCEPTION — TORSO ══════════════ */}
      <g filter={aP ? 'url(#fp)' : undefined}>
        {/* Shoulder pauldrons — wide sweeping curves */}
        <path d="M 170 157 Q 128 152 96 158 Q 64 166 60 192 Q 56 218 78 224 L 104 226 Q 108 214 110 200 L 110 157 Z"
          fill={fi(aP,P)} stroke={s(aP,P)} strokeWidth="1.4"/>
        <path d="M 210 157 Q 252 152 284 158 Q 316 166 320 192 Q 324 218 302 224 L 276 226 Q 272 214 270 200 L 270 157 Z"
          fill={fi(aP,P)} stroke={s(aP,P)} strokeWidth="1.4"/>
        {/* Shoulder detail lines */}
        {[168,180,192].map(y=>(
          <line key={y} x1={66} y1={y} x2={106} y2={y-2} stroke={s(aP,P)} strokeWidth="0.7" opacity={aP?0.5:0.2}/>
        ))}
        {[168,180,192].map(y=>(
          <line key={y+'r'} x1={274} y1={y-2} x2={314} y2={y} stroke={s(aP,P)} strokeWidth="0.7" opacity={aP?0.5:0.2}/>
        ))}

        {/* Main torso — trapezoid narrowing to waist */}
        <path d="M 110 157 L 270 157 Q 280 157 282 170 L 280 290 Q 278 312 250 316 L 190 318 L 130 316 Q 102 312 100 290 L 98 170 Q 100 157 110 157 Z"
          fill="url(#gTorso)" stroke={s(aP,P)} strokeWidth="1.8"/>

        {/* Chest plate */}
        <path d="M 124 170 Q 124 162 132 162 L 248 162 Q 256 162 256 170 L 258 250 Q 258 256 250 256 L 130 256 Q 122 256 122 250 Z"
          fill={aP?'#031c30':BASE} stroke={s(aP,P)} strokeWidth="1.1"/>

        {/* Sensor grid 3×2 */}
        {[0,1,2].map(col=>[0,1].map(row=>{
          const cx = 148+col*34, cy = 186+row*42;
          return (
            <g key={`${col}${row}`}>
              <circle cx={cx} cy={cy} r="13" fill={aP?P+'12':BASE}
                stroke={s(aP,P)} strokeWidth="1.1"/>
              <circle cx={cx} cy={cy} r="6" fill={aP?P:MID}
                filter={aP?'url(#sg)':undefined}/>
              {aP && <circle cx={cx-3} cy={cy-3} r="2.5" fill="white" opacity="0.2"/>}
            </g>
          );
        }))}

        {/* Torso side panel lines */}
        {[272,286,300].map(y=>(
          <g key={y}>
            <line x1={100} y1={y} x2={118} y2={y-2} stroke={s(aP,P)} strokeWidth="0.8" opacity={aP?0.5:0.18}/>
            <line x1={262} y1={y-2} x2={280} y2={y} stroke={s(aP,P)} strokeWidth="0.8" opacity={aP?0.5:0.18}/>
          </g>
        ))}

        {/* Core energy cell */}
        <ellipse cx="190" cy="278" rx="20" ry="14" fill={aP?P+'18':BASE}
          stroke={s(aP,P)} strokeWidth="1.3"/>
        <ellipse cx="190" cy="278" rx="9" ry="6" fill={aP?P:MID}
          filter={aP?'url(#sg)':undefined}/>

        {/* Energy bar */}
        <rect x="124" y="260" width="132" height="4" rx="2" fill={BASE}/>
        <rect x="124" y="260" width={aP?100:42} height="4" rx="2"
          fill={aP?P:DIM} style={{transition:'width 500ms ease'}}/>

        {/* Waist band */}
        <path d="M 100 290 Q 100 316 130 318 L 250 318 Q 280 316 280 290 L 280 296 Q 278 314 250 314 L 130 314 Q 102 314 100 296 Z"
          fill={fi(aP,P)} stroke={s(aP,P)} strokeWidth="1.1"/>

        {/* Annotation */}
        <line x1={100} y1={210} x2={64} y2={194} stroke={s(aP,P)} strokeWidth="0.9"
          strokeDasharray="3,3" opacity={aP?0.9:0.2}/>
        <line x1={64} y1={194} x2={22} y2={194} stroke={s(aP,P)} strokeWidth="0.9" opacity={aP?0.9:0.2}/>
        <text x="26" y="189" fontSize="8" fontFamily="monospace" letterSpacing="1.5"
          fill={s(aP,P)} opacity={aP?1:0.35}>SENSOR</text>
        <text x="26" y="200" fontSize="7" fontFamily="monospace"
          fill={s(aP,P)} opacity={aP?0.6:0.2}>感知系统</text>
      </g>

      {/* ══════════════ MOTION — ARMS + LEGS ══════════════ */}
      <g filter={aM ? 'url(#fm)' : undefined}>
        {/* ── LEFT ARM ── */}
        <circle cx="84" cy="170" r="17" fill={fi(aM,M)} stroke={s(aM,M)} strokeWidth="1.5"/>
        <circle cx="84" cy="170" r="7" fill={aM?M+'50':MID}/>
        {/* Upper arm — tapered cylinder */}
        <path d="M 68 178 Q 58 212 60 264 Q 60 278 78 280 Q 96 280 96 266 Q 98 214 100 178 Z"
          fill="url(#gLimb)" stroke={s(aM,M)} strokeWidth="1.5"/>
        {/* Elbow joint */}
        <ellipse cx="80" cy="272" rx="20" ry="12" fill={fi(aM,M)} stroke={s(aM,M)} strokeWidth="1.4"/>
        {/* Forearm */}
        <path d="M 62 276 Q 56 318 60 350 Q 60 362 78 364 Q 96 364 98 352 Q 102 320 96 276 Z"
          fill="url(#gLimb)" stroke={s(aM,M)} strokeWidth="1.5"/>
        {/* Forearm servo */}
        <rect x="64" y="300" width="30" height="38" rx="5"
          fill={aM?'#1c1000':BASE} stroke={s(aM,M)} strokeWidth="1"/>
        <line x1="79" y1="304" x2="79" y2="334" stroke={s(aM,M)} strokeWidth="0.8"/>
        {/* Hand */}
        <path d="M 60 358 Q 56 372 62 380 Q 68 386 80 384 Q 92 382 96 374 Q 100 366 96 358 Z"
          fill={fi(aM,M)} stroke={s(aM,M)} strokeWidth="1.3"/>
        {/* Wrist ring */}
        <ellipse cx="78" cy="362" rx="18" ry="8" fill="none" stroke={s(aM,M)} strokeWidth="1"/>

        {/* ── RIGHT ARM ── */}
        <circle cx="296" cy="170" r="17" fill={fi(aM,M)} stroke={s(aM,M)} strokeWidth="1.5"/>
        <circle cx="296" cy="170" r="7" fill={aM?M+'50':MID}/>
        <path d="M 280 178 Q 282 214 284 266 Q 284 280 302 280 Q 320 280 320 264 Q 322 212 312 178 Z"
          fill="url(#gLimb)" stroke={s(aM,M)} strokeWidth="1.5"/>
        <ellipse cx="300" cy="272" rx="20" ry="12" fill={fi(aM,M)} stroke={s(aM,M)} strokeWidth="1.4"/>
        <path d="M 282 276 Q 278 320 284 352 Q 284 364 302 364 Q 320 364 320 350 Q 324 318 318 276 Z"
          fill="url(#gLimb)" stroke={s(aM,M)} strokeWidth="1.5"/>
        <rect x="286" y="300" width="30" height="38" rx="5"
          fill={aM?'#1c1000':BASE} stroke={s(aM,M)} strokeWidth="1"/>
        <line x1="301" y1="304" x2="301" y2="334" stroke={s(aM,M)} strokeWidth="0.8"/>
        <path d="M 284 358 Q 280 372 284 380 Q 290 386 302 384 Q 314 382 318 374 Q 322 366 318 358 Z"
          fill={fi(aM,M)} stroke={s(aM,M)} strokeWidth="1.3"/>
        <ellipse cx="302" cy="362" rx="18" ry="8" fill="none" stroke={s(aM,M)} strokeWidth="1"/>

        {/* ── PELVIS ── */}
        <path d="M 130 318 Q 110 320 106 336 L 106 354 Q 106 368 126 370 L 190 372 L 254 370 Q 274 368 274 354 L 274 336 Q 270 320 250 318 Z"
          fill={fi(aM,M)} stroke={s(aM,M)} strokeWidth="1.5"/>
        {/* Hip joint circles */}
        <circle cx="142" cy="352" r="14" fill={fi(aM,M)} stroke={s(aM,M)} strokeWidth="1.3"/>
        <circle cx="238" cy="352" r="14" fill={fi(aM,M)} stroke={s(aM,M)} strokeWidth="1.3"/>
        <circle cx="142" cy="352" r="5" fill={aM?M+'60':MID}/>
        <circle cx="238" cy="352" r="5" fill={aM?M+'60':MID}/>

        {/* ── LEFT THIGH ── */}
        <path d="M 126 360 Q 114 406 118 456 Q 118 472 138 474 Q 158 472 158 456 Q 162 406 150 360 Z"
          fill="url(#gLimb)" stroke={s(aM,M)} strokeWidth="1.5"/>
        {/* Left knee */}
        <ellipse cx="138" cy="468" rx="22" ry="14" fill={fi(aM,M)} stroke={s(aM,M)} strokeWidth="1.4"/>
        <ellipse cx="138" cy="468" rx="10" ry="6" fill={aM?M+'40':MID}/>
        {/* Left shin */}
        <path d="M 118 474 Q 112 524 116 556 Q 116 568 136 570 Q 158 568 160 556 Q 162 524 158 474 Z"
          fill="url(#gLimb)" stroke={s(aM,M)} strokeWidth="1.5"/>
        {/* Left shin guard */}
        <rect x="118" y="492" width="40" height="50" rx="6"
          fill={aM?'#180e00':BASE} stroke={s(aM,M)} strokeWidth="1"/>
        {/* Left ankle + foot */}
        <ellipse cx="138" cy="566" rx="20" ry="10" fill={fi(aM,M)} stroke={s(aM,M)} strokeWidth="1.2"/>
        <path d="M 108 572 Q 104 584 110 590 L 168 590 Q 172 584 168 572 Z"
          fill={fi(aM,M)} stroke={s(aM,M)} strokeWidth="1.3"/>

        {/* ── RIGHT THIGH ── */}
        <path d="M 230 360 Q 218 406 222 456 Q 222 472 242 474 Q 262 472 262 456 Q 264 406 254 360 Z"
          fill="url(#gLimb)" stroke={s(aM,M)} strokeWidth="1.5"/>
        <ellipse cx="242" cy="468" rx="22" ry="14" fill={fi(aM,M)} stroke={s(aM,M)} strokeWidth="1.4"/>
        <ellipse cx="242" cy="468" rx="10" ry="6" fill={aM?M+'40':MID}/>
        <path d="M 224 474 Q 218 524 222 556 Q 222 568 242 570 Q 264 568 264 556 Q 266 524 262 474 Z"
          fill="url(#gLimb)" stroke={s(aM,M)} strokeWidth="1.5"/>
        <rect x="224" y="492" width="40" height="50" rx="6"
          fill={aM?'#180e00':BASE} stroke={s(aM,M)} strokeWidth="1"/>
        <ellipse cx="242" cy="566" rx="20" ry="10" fill={fi(aM,M)} stroke={s(aM,M)} strokeWidth="1.2"/>
        <path d="M 212 572 Q 208 584 214 590 L 274 590 Q 278 584 272 572 Z"
          fill={fi(aM,M)} stroke={s(aM,M)} strokeWidth="1.3"/>

        {/* Annotation */}
        <line x1={274} y1={460} x2={312} y2={480} stroke={s(aM,M)} strokeWidth="0.9"
          strokeDasharray="3,3" opacity={aM?0.9:0.2}/>
        <line x1={312} y1={480} x2={356} y2={480} stroke={s(aM,M)} strokeWidth="0.9" opacity={aM?0.9:0.2}/>
        <text x="318" y="475" fontSize="8" fontFamily="monospace" letterSpacing="1.5"
          fill={s(aM,M)} opacity={aM?1:0.35}>MOTION</text>
        <text x="318" y="486" fontSize="7" fontFamily="monospace"
          fill={s(aM,M)} opacity={aM?0.6:0.2}>运动控制</text>
      </g>

      {/* Centre spine */}
      <line x1="190" y1="156" x2="190" y2="318"
        stroke="#1e3050" strokeWidth="0.6" strokeDasharray="5,10"/>

      {/* Corner brackets */}
      {([[16,16],[364,16],[16,664],[364,664]] as [number,number][]).map(([x,y],i)=>{
        const sx=x<190?1:-1, sy=y<340?1:-1;
        return <path key={i} d={`M${x} ${y+sy*18}L${x} ${y}L${x+sx*18} ${y}`}
          fill="none" stroke="#1e3a5e" strokeWidth="1.2"/>;
      })}
    </svg>
  );
}


