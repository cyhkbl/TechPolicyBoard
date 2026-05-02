import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ExternalLink, Info, ShieldAlert, Zap } from 'lucide-react';
import { TechnologyType, TechCategory, TechSubComponent } from '../types';
import { TECH_DATA } from '../constants';
import { cn } from '../lib/utils';

interface TechExplorerProps {
  techId: TechnologyType;
}

export default function TechExplorer({ techId }: TechExplorerProps) {
  const data = TECH_DATA[techId] || TECH_DATA['embodied-ai'];
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [selectedSub, setSelectedSub] = useState<TechSubComponent | null>(null);

  // SVG positions for categories in a balanced layout
  const categoryPositions: Record<string, { x: number; y: number; color: string }> = useMemo(() => {
    return {
      'perception': { x: 30, y: 35, color: '#141414' },
      'motion': { x: 70, y: 55, color: '#141414' },
      'intelligence': { x: 35, y: 75, color: '#141414' },
    };
  }, []);

  return (
    <div className="relative w-full h-full flex overflow-hidden">
      {/* Left: The Visual Engine */}
      <div className="flex-1 relative flex flex-col p-8 border-r border-high-text overflow-hidden">
        <div className="absolute top-8 left-8 flex flex-col z-10 pointer-events-none">
          <span className="text-[10px] font-mono uppercase opacity-50">Current System View</span>
          <span className="text-3xl font-serif italic">{data.name} 核心架构</span>
        </div>

        {/* SVG Area */}
        <div className="flex-1 flex items-center justify-center">
          <div className="relative w-full max-w-2xl aspect-square">
            <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
              <defs>
                <pattern id="dotPattern" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
                  <circle cx="0.5" cy="0.5" r="0.5" fill="#141414" opacity="0.1" />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#dotPattern)" />

              {/* Central Abstract Body */}
              <rect x="45" y="40" width="10" height="20" fill="none" stroke="#141414" strokeWidth="0.5" strokeDasharray="1,1" />
              
              {/* Connection Lines */}
              {data.categories.map((cat) => {
                const pos = categoryPositions[cat.id as keyof typeof categoryPositions] || { x: 50, y: 50 };
                return (
                  <motion.line
                    key={`line-${cat.id}`}
                    x1="50" y1="50" x2={pos.x} y2={pos.y}
                    stroke="#141414"
                    strokeWidth="0.3"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: hoveredCategory === cat.id ? 1 : 0.2 }}
                  />
                );
              })}

              {/* Category Clusters */}
              {data.categories.map((cat) => {
                const pos = categoryPositions[cat.id as keyof typeof categoryPositions] || { x: 50, y: 50 };
                const isHovered = hoveredCategory === cat.id;

                return (
                  <g 
                    key={cat.id} 
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredCategory(cat.id)}
                    onMouseLeave={() => setHoveredCategory(null)}
                  >
                    {/* Node */}
                    <motion.circle
                      cx={pos.x}
                      cy={pos.y}
                      r={isHovered ? 2.5 : 1.5}
                      fill={isHovered ? "#141414" : "none"}
                      stroke="#141414"
                      strokeWidth="0.5"
                      animate={{ scale: isHovered ? 1.2 : 1 }}
                    />
                    
                    {/* Label */}
                    <text
                      x={pos.x + (pos.x > 50 ? 4 : -4)}
                      y={pos.y + 0.5}
                      textAnchor={pos.x > 50 ? "start" : "end"}
                      className={cn(
                        "text-[2.2px] font-bold fill-high-text transition-all duration-300 uppercase tracking-widest bg-white",
                        isHovered ? "opacity-100" : "opacity-40"
                      )}
                    >
                      {cat.name}
                    </text>

                    {/* Exploded Sub-components */}
                    <AnimatePresence>
                      {isHovered && (
                        <g>
                          {cat.subComponents.map((sub, idx) => {
                            const angle = (idx / (cat.subComponents.length - 1 || 1)) * (Math.PI * 0.8) - (Math.PI * 0.4);
                            const dir = pos.x > 50 ? 1 : -1;
                            const radius = 12;
                            const dx = Math.cos(angle) * (radius * dir);
                            const dy = Math.sin(angle) * radius;

                            return (
                              <motion.g
                                key={sub.id}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1, x: dx, y: dy }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedSub(sub);
                                }}
                              >
                                <rect 
                                  x={pos.x - 5} y={pos.y - 1.5} 
                                  width="10" height="3" 
                                  className="fill-white stroke-high-text stroke-[0.2] cursor-pointer hover:fill-high-text group"
                                />
                                <text
                                  x={pos.x} y={pos.y + 0.5}
                                  textAnchor="middle"
                                  className="text-[1.5px] font-bold fill-high-text pointer-events-none group-hover:fill-white"
                                >
                                  {sub.name}
                                </text>
                                
                                {/* Connection to parent node */}
                                <line x1={pos.x} y1={pos.y} x2={pos.x} y2={pos.y} stroke="#141414" strokeWidth="0.1" opacity="0.5" />
                              </motion.g>
                            );
                          })}
                        </g>
                      )}
                    </AnimatePresence>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-8 left-8 flex gap-6 text-[9px] font-mono uppercase opacity-40">
          <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 border border-high-text" /> 核心模块 / Node</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-high-text" /> 数据链路 / Bus</div>
          <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-high-text" /> 子项 / Component</div>
        </div>
      </div>

      {/* Right: Technical Drill-down Card */}
      <div className="w-[400px] bg-white flex flex-col relative overflow-hidden">
        <AnimatePresence mode="wait">
          {selectedSub ? (
            <motion.div
              key={selectedSub.id}
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              className="flex-1 flex flex-col p-8 overflow-y-auto"
            >
              <div className="flex justify-between items-start mb-8">
                <div>
                  <div className="text-[10px] font-mono text-high-accent font-bold mb-1 uppercase">COMPONENT_ID: {selectedSub.id.toUpperCase()}</div>
                  <h2 className="text-4xl font-serif italic leading-none">{selectedSub.name}</h2>
                  <p className="text-[11px] text-high-text/40 mt-1 uppercase tracking-tighter font-medium">Technical Specification</p>
                </div>
                <button 
                  onClick={() => setSelectedSub(null)}
                  className="px-2 py-1 border border-high-text text-[9px] font-mono uppercase hover:bg-high-text hover:text-white transition-colors"
                >
                  Close [ESC]
                </button>
              </div>

              <div className="space-y-8 flex-1">
                <section>
                  <h3 className="text-[10px] font-mono border-b border-high-text pb-1 mb-3 uppercase tracking-widest font-bold">名词解释 / Abstract</h3>
                  <p className="text-[13px] leading-relaxed text-high-text opacity-80">
                    {selectedSub.description}
                  </p>
                </section>

                <section>
                  <h3 className="text-[10px] font-mono border-b border-high-text pb-1 mb-3 uppercase tracking-widest font-bold">近期成果 / Milestone</h3>
                  <ul className="space-y-4">
                    {selectedSub.recentResults.map((res, i) => (
                      <li key={i} className="flex gap-3 items-start group">
                        <div className="w-2 h-2 bg-high-accent mt-1 shrink-0 group-hover:rotate-45 transition-transform" />
                        <div className="text-[12px] leading-snug">
                          {res.text}
                          {res.link && <ExternalLink className="w-2 h-2 inline ml-1 opacity-30" />}
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>

                <section>
                  <h3 className="text-[10px] font-mono border-b border-high-text pb-1 mb-3 uppercase tracking-widest font-bold">能力边界 / Boundaries</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-high-muted/30 border border-high-text/10">
                      <span className="text-[9px] font-bold text-green-700 uppercase block mb-2 tracking-tighter">Current Capacity</span>
                      <p className="text-[10px] leading-tight opacity-70">支持高频次精确解算，适应大规模分布式部署场景。</p>
                    </div>
                    <div className="p-3 bg-red-500/5 border border-red-500/10">
                      <span className="text-[9px] font-bold text-red-700 uppercase block mb-2 tracking-tighter">Constraints</span>
                      <p className="text-[10px] leading-tight opacity-70">{selectedSub.boundary}</p>
                    </div>
                  </div>
                </section>
              </div>

              <div className="mt-auto pt-10 flex gap-2">
                <button className="flex-1 h-12 border border-high-text text-[10px] font-bold uppercase hover:bg-high-text hover:text-white transition-all transform active:scale-[0.98]">
                  查看相关政策
                </button>
                <button className="flex-1 h-12 border border-high-text text-[10px] font-bold uppercase hover:bg-high-text hover:text-white transition-all transform active:scale-[0.98]">
                  查看产业应用
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-20 select-none">
              <Info className="w-12 h-12 mb-4 stroke-1" />
              <p className="text-xs uppercase tracking-[0.2em] font-bold">Select Component<br/>to analyze</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
