import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import type { Policy, PolicyDepartment, TechnologyType } from '../types';
import { POLICY_DATA, DEPT_COLORS, INNOVATION_STAGES, INDUSTRY_BY_ID, ALL_SUB_TECHS } from '../constants';
import { cn } from '../lib/utils';

type RegionFilter = 'ALL' | 'CHN' | 'USA' | 'EUU' | 'JPN' | 'KOR' | 'GBR' | 'OTH';
type LevelFilter = 'ALL' | 'national' | 'ministerial' | 'local' | 'supranational';
type DomainFilter = 'ALL' | PolicyDepartment;

const LEVEL_LABEL: Record<Exclude<LevelFilter, 'ALL'>, string> = {
  national: '国家级',
  ministerial: '部委级',
  local: '地方级',
  supranational: '超国家',
};

interface PolicyTrackerProps {
  onNavigateToTech?: (techId: string) => void;
  onNavigateToIndustry?: (industryId: string) => void;
  currentTech?: TechnologyType;
  focusPolicyId?: string | null;
  policies?: Policy[];
}

export default function PolicyTracker({
  onNavigateToTech,
  onNavigateToIndustry,
  focusPolicyId,
  policies,
}: PolicyTrackerProps) {
  const dataset = policies ?? POLICY_DATA;
  const [region, setRegion] = useState<RegionFilter>('ALL');
  const [level, setLevel] = useState<LevelFilter>('ALL');
  const [domain, setDomain] = useState<DomainFilter>('ALL');
  const [selected, setSelected] = useState<Policy | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!focusPolicyId) return;
    const p = dataset.find(x => x.id === focusPolicyId);
    if (p) {
      setRegion('ALL');
      setLevel('ALL');
      setDomain('ALL');
      setSelected(p);
    }
  }, [focusPolicyId, dataset]);

  const filtered = useMemo(() => {
    return dataset.filter(p =>
      (region === 'ALL' || (p.iso3 ?? 'OTH') === region) &&
      (level === 'ALL' || p.level === level) &&
      (domain === 'ALL' || p.department === domain),
    );
  }, [dataset, region, level, domain]);

  useEffect(() => {
    let raf = 0;
    let pos = 0;
    const el = scrollRef.current;
    const tick = () => {
      if (!el || el.matches(':hover') || filtered.length < 4 || selected) {
        raf = requestAnimationFrame(tick);
        return;
      }
      pos += 0.25;
      if (pos >= el.scrollHeight / 2) pos = 0;
      el.scrollTop = pos;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [filtered, selected]);

  return (
    <div className="relative w-full h-full text-high-text font-sans overflow-hidden bg-[#efedea]">
      <AnimatePresence mode="wait">
        {!selected ? (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex w-full h-full"
          >
            {/* LEFT COLUMN: LIVE FEED */}
            <div className="w-[380px] shrink-0 border-r border-high-text flex flex-col bg-[#efedea] z-10">
              {/* Filters */}
              <div className="flex flex-col border-b border-high-text bg-high-muted shrink-0 divide-y divide-high-text/20">
                <FilterRow label="Region">
                  {(['ALL', 'CHN', 'USA', 'EUU', 'GBR', 'JPN', 'KOR', 'OTH'] as RegionFilter[]).map(r => (
                    <FilterPill key={r} active={region === r} onClick={() => setRegion(r)}>{r}</FilterPill>
                  ))}
                </FilterRow>
                <FilterRow label="Level">
                  {(['ALL', 'national', 'ministerial', 'local', 'supranational'] as LevelFilter[]).map(lv => (
                    <FilterPill key={lv} active={level === lv} onClick={() => setLevel(lv)}>
                      {lv === 'ALL' ? 'ALL' : LEVEL_LABEL[lv]}
                    </FilterPill>
                  ))}
                </FilterRow>
                <FilterRow label="Domain">
                  {(['ALL', 'MoST', 'MIIT', 'NDRC', 'International'] as DomainFilter[]).map(d => (
                    <FilterPill key={d} active={domain === d} onClick={() => setDomain(d)}>
                      {d === 'ALL' ? 'ALL' : DEPT_COLORS[d].label}
                    </FilterPill>
                  ))}
                </FilterRow>
              </div>

              {/* Scrolling list */}
              <div className="flex-1 overflow-hidden relative">
                <div className="absolute top-2 right-3 flex items-center gap-1 z-10 pointer-events-none opacity-60">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                  </span>
                  <span className="text-[8px] font-mono italic">STREAM</span>
                </div>
                <div ref={scrollRef} className="h-full overflow-y-auto no-scrollbar scroll-smooth">
                  {filtered.length === 0 ? (
                    <div className="p-8 text-center text-xs font-mono opacity-50">No policies match current filters.</div>
                  ) : (
                    <div className="flex flex-col">
                      {[...filtered, ...(filtered.length > 2 ? filtered : [])].map((p, idx) => (
                        <PolicyCard key={`${p.id}-${idx}`} policy={p} onClick={() => setSelected(p)} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: TIMELINE */}
            <div className="flex-1 flex flex-col relative bg-white overflow-hidden">
              <div className="absolute inset-0 flex flex-col p-10 bg-high-bg/30 overflow-y-auto no-scrollbar">
                <div className="mb-16 shrink-0">
                  <h2 className="text-4xl font-serif italic mb-2 tracking-tight">
                    {region === 'ALL' ? 'Global' : region} Innovation Lifecycle
                  </h2>
                  <p className="text-[11px] uppercase tracking-widest opacity-50 font-mono">
                    Policy trajectory across the innovation chain
                    {domain !== 'ALL' ? ` • ${DEPT_COLORS[domain as PolicyDepartment].label}` : ''}
                    {level !== 'ALL' ? ` • ${LEVEL_LABEL[level]}` : ''}
                  </p>
                </div>

                <div className="flex-1 relative flex items-stretch justify-between pb-8 min-h-[560px]">
                  <div className="absolute left-10 right-10 top-1/2 -translate-y-1/2 h-px bg-high-text/30" />
                  <div className="absolute right-10 top-1/2 border-t border-r border-high-text/50 w-2 h-2 rotate-45 -mt-[5px]" />

                  {INNOVATION_STAGES.map((stage, i) => {
                    const stagePolicies = filtered.filter(p => p.innovationStage === stage.id);
                    return (
                      <div key={stage.id} className="relative z-10 flex flex-col items-center flex-1 min-w-0">
                        <div className="flex-1 w-full flex flex-col-reverse justify-start items-center gap-2 pb-3 overflow-hidden px-2 min-h-0">
                          {stagePolicies.slice(0, 2).map((p, idx) => (
                            <motion.div
                              key={p.id}
                              onClick={() => setSelected(p)}
                              className="w-[180px] p-3 border border-high-text bg-white shadow-[4px_4px_0_rgba(0,0,0,0.15)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all cursor-pointer group relative shrink-0"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0, transition: { delay: idx * 0.08 } }}
                            >
                              <div className="text-[8px] font-mono opacity-50 mb-1.5 flex justify-between">
                                <span>{p.date}</span>
                                <span className="uppercase text-high-accent font-bold">{LEVEL_LABEL[p.level]}</span>
                              </div>
                              <div className="font-bold text-xs font-serif leading-tight group-hover:text-high-accent transition-colors line-clamp-2">
                                {p.title}
                              </div>
                            </motion.div>
                          ))}
                          {stagePolicies.length > 2 && (
                            <div className="text-[9px] font-mono opacity-40 uppercase tracking-widest">
                              +{stagePolicies.length - 2} more
                            </div>
                          )}
                        </div>
                        <div className="relative w-5 h-5 bg-white border-2 border-high-text rotate-45 shadow-[0_0_0_5px_rgba(228,227,224,1)] z-20 flex justify-center items-center shrink-0">
                          <div className="w-1.5 h-1.5 bg-high-text" />
                        </div>
                        <div className="flex-1 flex flex-col items-center pt-5 shrink-0 min-h-0">
                          <div className="text-[10px] font-bold uppercase tracking-widest font-mono bg-high-text text-white px-2 py-1 shadow-[2px_2px_0_rgba(0,0,0,0.3)]">
                            {stage.name}
                          </div>
                          <div className="text-[9px] font-mono opacity-40 mt-1 uppercase">PHASE 0{i + 1}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="selected"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex flex-col h-full z-20 bg-white overflow-hidden"
          >
            <div className="h-14 border-b border-high-text flex items-center px-6 bg-high-muted shrink-0 gap-3">
              <button
                onClick={() => setSelected(null)}
                className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest border border-high-text bg-white px-3 py-1.5 hover:bg-high-text hover:text-white transition-colors"
              >
                ← Back to Trends
              </button>
              <div className="ml-auto flex items-center gap-2">
                {selected.relatedTechnologies.slice(0, 2).map(techId => {
                  const sub = ALL_SUB_TECHS.find(t => t.id === techId);
                  if (!sub || !onNavigateToTech) return null;
                  return (
                    <button
                      key={techId}
                      onClick={() => onNavigateToTech(techId)}
                      className="text-[10px] uppercase font-bold tracking-widest border border-high-text bg-white px-3 py-1.5 hover:bg-high-text hover:text-white transition-colors"
                    >
                      查看技术 · {sub.name}
                    </button>
                  );
                })}
                {selected.relatedIndustries[0] && onNavigateToIndustry && (
                  <button
                    onClick={() => onNavigateToIndustry(selected.relatedIndustries[0])}
                    className="text-[10px] uppercase font-bold tracking-widest border border-high-text bg-white px-3 py-1.5 hover:bg-high-text hover:text-white transition-colors"
                  >
                    查看产业 · {INDUSTRY_BY_ID[selected.relatedIndustries[0]]?.name ?? ''}
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 p-10 overflow-y-auto no-scrollbar shrink-0 border-b border-high-text">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-[10px] font-mono tracking-widest bg-high-text text-high-bg px-1.5 py-0.5 uppercase">
                      {selected.country}
                    </span>
                    <span className="text-[8px] font-mono uppercase bg-high-text/10 px-1 font-bold border border-high-text/20">
                      {LEVEL_LABEL[selected.level]}
                    </span>
                    <span className="text-[8px] font-mono uppercase bg-high-text/10 px-1 font-bold border border-high-text/20">
                      {selected.departmentLabel}
                    </span>
                    <span className="text-[8px] font-mono uppercase text-high-accent font-bold border border-high-accent/30 px-1">
                      Phase: {INNOVATION_STAGES.find(s => s.id === selected.innovationStage)?.name ?? '—'}
                    </span>
                  </div>
                  <h2 className="text-3xl font-serif italic mb-4 max-w-2xl">{selected.title}</h2>
                  <div className="text-[10px] font-mono opacity-50 uppercase">Date of Issue: {selected.date}</div>
                </div>
                <a
                  href={selected.fullTextUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 border border-high-text px-3 py-1.5 hover:bg-high-text hover:text-high-bg transition-colors text-[10px] uppercase font-bold tracking-widest font-mono shrink-0"
                >
                  原文链接 <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>

              <div className="grid grid-cols-3 gap-12 mt-8">
                <div className="col-span-2 space-y-8">
                  <section>
                    <h3 className="text-[10px] font-mono border-b border-high-text pb-1 mb-3 uppercase tracking-widest font-bold">概述 / Overview</h3>
                    <p className="text-[13px] leading-loose opacity-90">{selected.summary}</p>
                  </section>
                  {selected.highlights && selected.highlights.length > 0 && (
                    <section>
                      <h3 className="text-[10px] font-mono border-b border-high-text pb-1 mb-3 uppercase tracking-widest font-bold">亮点措施 / Highlights</h3>
                      <ul className="space-y-3">
                        {selected.highlights.map((h, i) => (
                          <li key={i} className="flex gap-3 text-[13px] items-start">
                            <span className="text-high-accent text-lg leading-none mt-0.5">※</span>
                            <span className="opacity-90 leading-relaxed">{h}</span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}
                </div>

                <div className="col-span-1 border-l border-high-text/20 pl-8">
                  <h3 className="text-[10px] font-mono border-b border-high-text pb-1 mb-3 uppercase tracking-widest font-bold">关键词 / Tagging</h3>
                  <div className="flex flex-wrap gap-2">
                    {(selected.keywords ?? []).map(kw => (
                      <span key={kw} className="px-2 py-1 border border-high-text bg-high-muted/50 text-[10px] font-bold shadow-[2px_2px_0_rgba(0,0,0,0.1)]">
                        {kw}
                      </span>
                    ))}
                  </div>
                  {selected.marketReactionDays !== undefined && (
                    <div className="mt-6">
                      <h3 className="text-[10px] font-mono border-b border-high-text pb-1 mb-2 uppercase tracking-widest font-bold">市场反应 / Reaction</h3>
                      <div className="text-[12px] font-mono">
                        <span className="text-high-accent text-2xl font-bold">{selected.marketReactionDays}</span>
                        <span className="opacity-50 ml-1">days</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="h-10 flex items-center px-4 overflow-x-auto no-scrollbar">
      <span className="text-[9px] font-mono font-bold mr-4 opacity-50 uppercase shrink-0 w-[50px]">{label}</span>
      <div className="flex gap-2">{children}</div>
    </div>
  );
}

function FilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'text-[9px] px-2 py-0.5 font-bold border transition-all whitespace-nowrap',
        active ? 'bg-high-text text-high-bg border-high-text' : 'border-high-text/50 bg-transparent hover:bg-high-text/10',
      )}
    >
      {children}
    </button>
  );
}

function PolicyCard({ policy, onClick }: { policy: Policy; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="p-5 border-b border-high-text/20 cursor-pointer transition-all duration-300 group hover:bg-high-text/5"
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex gap-2">
          <span className="text-[9px] font-mono tracking-widest uppercase border border-high-text px-1 opacity-60">{policy.date}</span>
          <span className="text-[9px] font-mono tracking-widest bg-high-accent text-white px-1 opacity-90">
            {LEVEL_LABEL[policy.level]}
          </span>
        </div>
        <span className="text-[10px] font-bold font-mono text-high-text">{policy.iso3 ?? '—'}</span>
      </div>
      <h3 className="font-serif font-bold text-[13px] mb-2 leading-snug group-hover:text-high-accent transition-colors">
        {policy.title}
      </h3>
      <div className="flex gap-2 mb-1 flex-wrap">
        <span className="text-[8px] px-1 bg-high-text/10 text-high-text/70 uppercase font-bold">
          {INNOVATION_STAGES.find(s => s.id === policy.innovationStage)?.name ?? '—'}
        </span>
        <span className="text-[8px] px-1 bg-high-text/10 text-high-text/70 uppercase font-bold">{policy.departmentLabel}</span>
      </div>
    </div>
  );
}
