import { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ExternalLink, Info, Filter } from 'lucide-react';
import type { Policy, PolicyDepartment, TechnologyType } from '../types';
import { POLICY_DATA, DEPT_COLORS, ALL_SUB_TECHS, INDUSTRY_BY_ID } from '../constants';
import { cn } from '../lib/utils';

type DeptFilter = 'all' | PolicyDepartment;

interface PolicyTrackerProps {
  onNavigateToTech?: (techId: string) => void;
  onNavigateToIndustry?: (industryId: string) => void;
  currentTech?: TechnologyType;
  focusPolicyId?: string | null;
}

const TIMELINE_START = 2020;
const TIMELINE_END = 2026;
const LANE_ORDER: PolicyDepartment[] = ['MoST', 'MIIT', 'NDRC', 'International'];
const LANE_Y: Record<PolicyDepartment, number> = {
  MoST: 70,
  MIIT: 115,
  NDRC: 160,
  International: 205,
};

function parseDateToYear(date: string): number {
  const [y, m] = date.split('-').map(Number);
  return y + ((m || 1) - 1) / 12;
}

export default function PolicyTracker({ onNavigateToTech, onNavigateToIndustry, focusPolicyId }: PolicyTrackerProps) {
  const [deptFilter, setDeptFilter] = useState<DeptFilter>('all');
  const [selected, setSelected] = useState<Policy | null>(null);

  useEffect(() => {
    if (!focusPolicyId) return;
    const p = POLICY_DATA.find(x => x.id === focusPolicyId);
    if (p) {
      setDeptFilter('all');
      setSelected(p);
    }
  }, [focusPolicyId]);

  const filteredPolicies = useMemo(() => {
    if (deptFilter === 'all') return POLICY_DATA;
    return POLICY_DATA.filter(p => p.department === deptFilter);
  }, [deptFilter]);

  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelected(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected]);

  const yearTicks = useMemo(() => {
    const ticks: number[] = [];
    for (let y = TIMELINE_START; y <= TIMELINE_END; y++) ticks.push(y);
    return ticks;
  }, []);

  const xOf = (date: string) => {
    const f = parseDateToYear(date);
    const pct = (f - TIMELINE_START) / (TIMELINE_END - TIMELINE_START);
    return 60 + pct * 900;
  };

  return (
    <div className="relative w-full h-full flex overflow-hidden">
      {/* LEFT: timeline */}
      <div className="flex-1 relative flex flex-col p-8 border-r border-high-text overflow-hidden">
        <div className="flex flex-col z-10 mb-6">
          <span className="text-[10px] font-mono uppercase opacity-50">Current System View</span>
          <span className="text-3xl font-serif italic">政策时间轴 · Policy Timeline</span>
          <span className="text-[11px] mt-1 opacity-50">横轴 {TIMELINE_START}–{TIMELINE_END} · 节点按部委着色 · 点击展开详情</span>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <div className="flex items-center gap-1.5 mr-2 text-[9px] font-mono uppercase opacity-50">
            <Filter className="w-3 h-3" /> Department
          </div>
          {(['all', ...LANE_ORDER] as DeptFilter[]).map(d => {
            const label = d === 'all' ? '全部' : DEPT_COLORS[d].label;
            const color = d === 'all' ? '#141414' : DEPT_COLORS[d].fill;
            const active = deptFilter === d;
            return (
              <button
                key={d}
                onClick={() => setDeptFilter(d)}
                className={cn(
                  'px-3 py-1 border border-high-text text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-2',
                  active
                    ? 'bg-high-text text-high-bg shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                    : 'opacity-60 hover:opacity-100 bg-transparent',
                )}
              >
                {d !== 'all' && (
                  <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                )}
                {label}
              </button>
            );
          })}
          <div className="ml-auto text-[10px] font-mono opacity-50">
            {filteredPolicies.length} / {POLICY_DATA.length} 条
          </div>
        </div>

        {/* Timeline SVG */}
        <div className="flex-1 relative flex items-center">
          <svg viewBox="0 0 1000 280" className="w-full h-full overflow-visible">
            <defs>
              <pattern id="policyDot" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="0.5" cy="0.5" r="0.5" fill="#141414" opacity="0.08" />
              </pattern>
            </defs>
            <rect width="1000" height="280" fill="url(#policyDot)" />

            {/* Year axis */}
            <line x1="60" y1="245" x2="960" y2="245" stroke="#141414" strokeWidth="0.6" />
            {yearTicks.map(y => {
              const x = xOf(`${y}-01`);
              return (
                <g key={y}>
                  <line x1={x} y1="240" x2={x} y2="250" stroke="#141414" strokeWidth="0.6" />
                  <text x={x} y="265" textAnchor="middle" className="text-[9px] font-mono fill-high-text opacity-60">
                    {y}
                  </text>
                </g>
              );
            })}

            {/* Lane labels */}
            {LANE_ORDER.map(dept => (
              <g key={dept}>
                <line x1="60" y1={LANE_Y[dept]} x2="960" y2={LANE_Y[dept]} stroke="#141414" strokeOpacity="0.08" strokeWidth="0.4" strokeDasharray="2,3" />
                <text
                  x="54"
                  y={LANE_Y[dept] + 3}
                  textAnchor="end"
                  className="text-[9px] font-mono fill-high-text opacity-60 uppercase tracking-widest"
                >
                  {DEPT_COLORS[dept].label}
                </text>
                <circle cx="45" cy={LANE_Y[dept]} r="2" fill={DEPT_COLORS[dept].fill} />
              </g>
            ))}

            {/* Policy nodes */}
            {filteredPolicies.map(p => {
              const x = xOf(p.date);
              const y = LANE_Y[p.department];
              const color = DEPT_COLORS[p.department].fill;
              const isActive = selected?.id === p.id;
              return (
                <motion.g
                  key={p.id}
                  className="cursor-pointer"
                  onClick={() => setSelected(p)}
                  whileHover={{ scale: 1.1 }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <line x1={x} y1={y} x2={x} y2="245" stroke={color} strokeWidth="0.5" strokeOpacity="0.3" />
                  <circle
                    cx={x}
                    cy={y}
                    r={isActive ? 8 : 6}
                    fill={isActive ? color : '#fff'}
                    stroke={color}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  {p.level === 'national' && (
                    <circle cx={x} cy={y} r="2" fill={isActive ? '#fff' : color} />
                  )}
                  <text
                    x={x}
                    y={y - 12}
                    textAnchor="middle"
                    className={cn(
                      'text-[8px] font-mono fill-high-text uppercase tracking-wider transition-opacity',
                      isActive ? 'opacity-100 font-bold' : 'opacity-55',
                    )}
                  >
                    {p.date}
                  </text>
                </motion.g>
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex gap-6 text-[9px] font-mono uppercase opacity-50 mt-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full border border-high-text" />
            部委级 / Ministerial
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-high-text border border-high-text" />
            国家级 / National
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-high-text opacity-40" />
            时间轴 / Time Axis
          </div>
        </div>
      </div>

      {/* RIGHT: detail card */}
      <div className="w-[400px] bg-white flex flex-col relative overflow-hidden">
        <AnimatePresence mode="wait">
          {selected ? (
            <motion.div
              key={selected.id}
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              className="flex-1 flex flex-col p-8 overflow-y-auto"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-mono font-bold mb-1 uppercase" style={{ color: DEPT_COLORS[selected.department].fill }}>
                    {selected.country} · {DEPT_COLORS[selected.department].label} · {selected.date}
                  </div>
                  <h2 className="text-2xl font-serif italic leading-tight mb-1">{selected.title}</h2>
                  <p className="text-[11px] text-high-text/40 uppercase tracking-tighter font-medium">
                    Policy · {selected.level}
                  </p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="px-2 py-1 border border-high-text text-[9px] font-mono uppercase hover:bg-high-text hover:text-white transition-colors shrink-0 ml-2"
                >
                  Close [ESC]
                </button>
              </div>

              <div className="space-y-6 flex-1">
                <section>
                  <h3 className="text-[10px] font-mono border-b border-high-text pb-1 mb-3 uppercase tracking-widest font-bold">
                    通俗摘要 / Abstract
                  </h3>
                  <p className="text-[13px] leading-relaxed text-high-text opacity-80">{selected.summary}</p>
                </section>

                <section>
                  <h3 className="text-[10px] font-mono border-b border-high-text pb-1 mb-3 uppercase tracking-widest font-bold">
                    关联技术 / Related Tech
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selected.relatedTechnologies.length === 0 && (
                      <span className="text-[11px] opacity-40">暂无</span>
                    )}
                    {selected.relatedTechnologies.map(techId => {
                      const tech = ALL_SUB_TECHS.find(t => t.id === techId);
                      if (!tech) return null;
                      return (
                        <button
                          key={techId}
                          onClick={() => onNavigateToTech?.(techId)}
                          className="px-2.5 py-1 border border-high-text text-[10px] font-bold uppercase tracking-wider hover:bg-high-text hover:text-white transition-colors"
                          title={`${tech.categoryName} · ${tech.name}`}
                        >
                          {tech.name}
                        </button>
                      );
                    })}
                  </div>
                </section>

                {selected.relatedIndustries.length > 0 && (
                  <section>
                    <h3 className="text-[10px] font-mono border-b border-high-text pb-1 mb-3 uppercase tracking-widest font-bold">
                      关联产业 / Related Industry
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selected.relatedIndustries.map(indId => {
                        const ind = INDUSTRY_BY_ID[indId];
                        if (!ind) return null;
                        return (
                          <button
                            key={indId}
                            onClick={() => onNavigateToIndustry?.(indId)}
                            className="px-2.5 py-1 bg-high-muted border border-high-text text-[10px] font-bold uppercase tracking-wider hover:bg-high-text hover:text-white transition-colors"
                          >
                            {ind.name}
                          </button>
                        );
                      })}
                    </div>
                  </section>
                )}

                {typeof selected.marketReactionDays === 'number' && (
                  <section>
                    <h3 className="text-[10px] font-mono border-b border-high-text pb-1 mb-3 uppercase tracking-widest font-bold">
                      市场反应 / Market Reaction
                    </h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-serif italic">{selected.marketReactionDays}</span>
                      <span className="text-[11px] font-mono uppercase opacity-60">Days · 一级市场首轮反应</span>
                    </div>
                  </section>
                )}
              </div>

              <a
                href={selected.fullTextUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 h-12 flex items-center justify-center gap-2 border border-high-text text-[10px] font-bold uppercase hover:bg-high-text hover:text-white transition-all active:scale-[0.98]"
              >
                查看原文 / View Source <ExternalLink className="w-3 h-3" />
              </a>
            </motion.div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-20 select-none">
              <Info className="w-12 h-12 mb-4 stroke-1" />
              <p className="text-xs uppercase tracking-[0.2em] font-bold">Select Policy Node<br />to view detail</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
