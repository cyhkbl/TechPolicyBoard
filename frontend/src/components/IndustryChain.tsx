import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Map, Cpu, FileText, Factory, ChevronLeft, Target } from 'lucide-react';
import type { Region } from '../types';
import { REGIONS, POLICY_BY_ID, ALL_SUB_TECHS } from '../constants';
import { cn } from '../lib/utils';

interface IndustryChainProps {
  focusIndustryId?: string | null;
  onNavigateToTech?: (techId: string) => void;
  onNavigateToPolicy?: (policyId: string) => void;
  regions?: Region[];
}

export default function IndustryChain({ focusIndustryId, onNavigateToTech, onNavigateToPolicy, regions }: IndustryChainProps) {
  const dataset = regions ?? REGIONS;
  const regionsById = useMemo(
    () => dataset.reduce<Record<string, Region>>((acc, r) => ({ ...acc, [r.id]: r }), {}),
    [dataset],
  );
  const [selected, setSelected] = useState<Region | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    if (!focusIndustryId) return;
    const byRegion = regionsById[focusIndustryId];
    if (byRegion) {
      setSelected(byRegion);
      return;
    }
    const byScenario = dataset.find(r => r.scenarios.some(s => s.technologies.includes(focusIndustryId)));
    if (byScenario) setSelected(byScenario);
  }, [focusIndustryId, dataset, regionsById]);

  const renderMap = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
      <path
        d="M20 20 L80 15 L95 40 L85 85 L60 95 L25 85 L10 50 Z"
        fill="none"
        stroke="#141414"
        strokeWidth="0.2"
        strokeDasharray="1 2"
        className="opacity-20"
      />
      <g className="opacity-30">
        {dataset.map((a, i) => dataset.slice(i + 1).map(b => {
          const dx = a.coordinates.x - b.coordinates.x;
          const dy = a.coordinates.y - b.coordinates.y;
          if (Math.hypot(dx, dy) > 28) return null;
          return (
            <line
              key={`${a.id}-${b.id}`}
              x1={a.coordinates.x} y1={a.coordinates.y}
              x2={b.coordinates.x} y2={b.coordinates.y}
              stroke="#141414" strokeWidth="0.4"
            />
          );
        }))}
      </g>

      {dataset.map(region => {
        const isHovered = hovered === region.id;
        return (
          <g
            key={region.id}
            transform={`translate(${region.coordinates.x}, ${region.coordinates.y})`}
            onMouseEnter={() => setHovered(region.id)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => setSelected(region)}
            className="cursor-pointer"
          >
            {isHovered && <circle r="6" fill="#f97316" className="opacity-20 animate-ping" />}
            <circle r={isHovered ? '3.5' : '2'} fill={isHovered ? '#f97316' : '#141414'} className="transition-all duration-300" />
            <circle
              r="6"
              fill="transparent"
              stroke={isHovered ? '#f97316' : '#141414'}
              strokeWidth="0.3"
              strokeDasharray="0.5 1"
              className={cn('transition-all duration-500', isHovered ? 'rotate-180' : '')}
              style={{ transformOrigin: 'center' }}
            />
            <text x="5" y="-4" className={cn('text-[2.5px] font-bold font-mono tracking-widest transition-all', isHovered ? 'fill-[#f97316]' : 'fill-[#141414]')}>
              {region.englishName.toUpperCase()}
            </text>
            <text x="5" y="0" className={cn('text-[2px] transition-all', isHovered ? 'fill-[#141414] font-bold' : 'fill-[#141414] opacity-50')}>
              {region.name}
            </text>
          </g>
        );
      })}
    </svg>
  );

  return (
    <div className="relative w-full h-full text-[#141414] font-sans flex overflow-hidden bg-[#efedea]">
      <AnimatePresence mode="wait">
        {!selected ? (
          <motion.div
            key="map-view"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full flex"
          >
            <div className="w-1/2 relative bg-[#E4E3E0] border-r border-[#141414] p-8 flex flex-col items-center justify-center">
              <div className="absolute top-8 left-8">
                <h2 className="text-3xl font-serif italic mb-2 tracking-tight">Geo-Industrial<br />Synergy Graph</h2>
                <div className="text-[10px] font-mono uppercase opacity-50 flex items-center gap-2">
                  <Map className="w-3 h-3" /> Select a hub to analyze
                </div>
              </div>
              <div className="w-full max-w-lg aspect-square relative mt-16">
                {renderMap()}
              </div>
            </div>

            <div className="w-1/2 bg-[#efedea] p-12 flex flex-col justify-center">
              {hovered ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                  <div className="space-y-2">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-[#f97316] font-bold border border-[#f97316] inline-block px-1.5 py-0.5">
                      HUB_ID: {regionsById[hovered]?.englishName.toUpperCase()}
                    </div>
                    <h3 className="text-4xl font-serif italic">{regionsById[hovered]?.name}</h3>
                    <div className="text-xs uppercase font-mono tracking-widest opacity-50 border-b border-[#141414]/30 pb-4">
                      {regionsById[hovered]?.englishName}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-mono uppercase tracking-widest border-l-2 border-[#141414] pl-2 mb-3 font-bold">产业禀赋 / Endowment</h4>
                    <p className="text-lg leading-relaxed bg-[#141414]/5 p-4 border border-[#141414]/10">
                      {regionsById[hovered]?.endowment}
                    </p>
                  </div>
                  <div className="text-xs font-mono opacity-50 flex items-center gap-2">
                    <div className="w-4 h-px bg-[#141414]" />
                    Click node on map to drill down into policies and scenarios
                  </div>
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-20 text-center">
                  <Target className="w-16 h-16 mb-4 stroke-1" />
                  <p className="text-sm font-mono uppercase tracking-widest">Awaiting spatial selection.</p>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="detail-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex flex-col overflow-hidden bg-white z-20"
          >
            <div className="h-16 border-b border-[#141414] bg-[#DCDAD7] flex items-center px-8 shrink-0 justify-between">
              <button
                onClick={() => setSelected(null)}
                className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest border border-[#141414] bg-white px-4 py-2 hover:bg-[#141414] hover:text-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Back to Matrix
              </button>
              <div className="flex gap-4 items-center">
                <span className="text-[10px] font-mono font-bold uppercase bg-[#141414] text-white px-2 py-1 shadow-[2px_2px_0px_rgba(249,115,22,1)]">
                  {selected.englishName.toUpperCase()}
                </span>
                <h2 className="text-xl font-serif italic pr-4 border-r border-[#141414]/30">{selected.name}</h2>
                <span className="text-xs font-mono uppercase opacity-50 tracking-widest">{selected.englishName}</span>
              </div>
            </div>

            <div className="bg-[#141414]/5 border-b border-[#141414] p-6 shrink-0 text-center">
              <span className="text-[9px] font-mono font-bold uppercase text-[#f97316] mb-1 block tracking-widest">Core Endowment</span>
              <p className="text-sm font-bold tracking-wide">{selected.endowment}</p>
            </div>

            <div className="flex-1 flex overflow-hidden">
              <div className="w-[450px] shrink-0 border-r border-[#141414] bg-[#E4E3E0]/30 flex flex-col">
                <div className="h-12 border-b border-[#141414] flex items-center px-6 bg-[#DCDAD7]">
                  <FileText className="w-4 h-4 mr-2" />
                  <h3 className="text-xs font-mono font-bold uppercase tracking-widest">区域产业政策</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {selected.policies.map((ref, idx) => {
                    const policy = POLICY_BY_ID[ref.id];
                    return (
                      <div
                        key={`${ref.id}-${idx}`}
                        onClick={() => onNavigateToPolicy?.(ref.id)}
                        className="bg-white border border-[#141414] p-5 shadow-[4px_4px_0_rgba(0,0,0,0.1)] relative group hover:-translate-y-1 hover:shadow-[6px_6px_0_rgba(0,0,0,0.15)] transition-all cursor-pointer"
                      >
                        <div className="absolute top-0 right-0 border-b border-l border-[#141414] bg-[#141414] text-white text-[9px] font-mono px-2 py-1 flex items-center gap-1">
                          <Target className="w-3 h-3" /> {ref.targetTrack}
                        </div>
                        <div className="text-[10px] font-mono opacity-50 mb-3 uppercase flex items-center gap-2 mt-2">
                          <span className="inline-block w-1.5 h-1.5 bg-[#f97316]" /> {policy?.date ?? '—'}
                        </div>
                        <h4 className="font-serif font-bold text-sm mb-4 leading-snug">《{policy?.title ?? ref.id}》</h4>
                        <div className="text-xs bg-[#141414]/5 p-3 border-l-2 border-[#141414] leading-relaxed">
                          <strong className="text-[9px] font-mono uppercase tracking-widest font-bold opacity-60 block mb-1">Focus Area</strong>
                          {ref.focus}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex-1 flex flex-col bg-white">
                <div className="h-12 border-b border-[#141414] flex items-center px-6 bg-[#DCDAD7]">
                  <Factory className="w-4 h-4 mr-2" />
                  <h3 className="text-xs font-mono font-bold uppercase tracking-widest">产业应用案例场景</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-8 content-start bg-[radial-gradient(#141414_1px,transparent_1px)] [background-size:16px_16px] [background-position:-8px_-8px] relative before:absolute before:inset-0 before:bg-white/90">
                  {selected.scenarios.map((scenario, idx) => (
                    <div key={idx} className="bg-white border-2 border-[#141414] p-6 relative z-10 flex flex-col shadow-[8px_8px_0_rgba(20,20,20,1)]">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full border border-[#141414] flex items-center justify-center bg-[#DCDAD7] shrink-0 font-serif italic font-bold">
                          {idx + 1}
                        </div>
                        <h4 className="font-bold text-lg leading-tight">{scenario.name}</h4>
                      </div>
                      <p className="text-sm opacity-80 leading-relaxed mb-6 flex-1">{scenario.description}</p>
                      <div className="border-t border-[#141414] pt-4 mt-auto">
                        <div className="text-[9px] font-mono uppercase tracking-widest opacity-50 mb-3 flex items-center gap-2">
                          <Cpu className="w-3 h-3" /> Core Technologies Applied
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {scenario.technologies.map(techId => {
                            const sub = ALL_SUB_TECHS.find(t => t.id === techId);
                            const label = sub?.name ?? techId;
                            const clickable = Boolean(sub && onNavigateToTech);
                            return (
                              <span
                                key={techId}
                                onClick={() => clickable && onNavigateToTech!(techId)}
                                className={cn(
                                  'px-2 py-1 border border-[#141414]/30 bg-[#efedea] text-[10px] font-bold',
                                  clickable && 'cursor-pointer hover:bg-[#141414] hover:text-white transition-colors',
                                )}
                              >
                                {label}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
