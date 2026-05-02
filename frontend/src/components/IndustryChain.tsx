import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Info, Factory } from 'lucide-react';
import type { Industry, IndustryChainStage } from '../types';
import { INDUSTRY_DATA, ALL_SUB_TECHS, POLICY_BY_ID, DEPT_COLORS } from '../constants';
import { cn } from '../lib/utils';

interface IndustryChainProps {
  focusIndustryId?: string | null;
  onNavigateToTech?: (techId: string) => void;
  onNavigateToPolicy?: (policyId: string) => void;
}

export default function IndustryChain({ focusIndustryId, onNavigateToTech, onNavigateToPolicy }: IndustryChainProps) {
  const defaultId = focusIndustryId && INDUSTRY_DATA.find(i => i.id === focusIndustryId) ? focusIndustryId : INDUSTRY_DATA[0].id;
  const [activeId, setActiveId] = useState<string>(defaultId);
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);

  const industry = useMemo<Industry>(
    () => INDUSTRY_DATA.find(i => i.id === activeId) || INDUSTRY_DATA[0],
    [activeId],
  );

  const selectedStage: IndustryChainStage | null = useMemo(
    () => industry.chainStages.find(s => s.id === selectedStageId) || null,
    [industry, selectedStageId],
  );

  return (
    <div className="relative w-full h-full flex overflow-hidden">
      <div className="flex-1 relative flex flex-col p-8 border-r border-high-text overflow-hidden">
        <div className="flex flex-col z-10 mb-6">
          <span className="text-[10px] font-mono uppercase opacity-50">Current System View</span>
          <span className="text-3xl font-serif italic">{industry.name} 产业链 · Value Chain</span>
          <span className="text-[11px] mt-1 opacity-50">{industry.tagline}</span>
        </div>

        {/* Industry selector */}
        <div className="flex items-center gap-2 mb-8 flex-wrap">
          <div className="flex items-center gap-1.5 mr-2 text-[9px] font-mono uppercase opacity-50">
            <Factory className="w-3 h-3" /> Industry
          </div>
          {INDUSTRY_DATA.map(ind => {
            const active = activeId === ind.id;
            return (
              <button
                key={ind.id}
                onClick={() => {
                  setActiveId(ind.id);
                  setSelectedStageId(null);
                }}
                className={cn(
                  'px-3 py-1 border border-high-text text-[10px] font-bold uppercase tracking-wider transition-all',
                  active
                    ? 'bg-high-text text-high-bg shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                    : 'opacity-60 hover:opacity-100 bg-transparent',
                )}
              >
                {ind.name}
              </button>
            );
          })}
          <div className="ml-auto text-[10px] font-mono opacity-50 uppercase">
            ref: {industry.nationalPlanRef}
          </div>
        </div>

        {/* Chain row */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="text-[9px] font-mono uppercase opacity-50 mb-3 tracking-widest">
            基础研究 → 工程实现 → 零部件 → 整机/系统 → 产业应用
          </div>
          <div className="flex items-stretch gap-0 overflow-x-auto no-scrollbar">
            {industry.chainStages.map((stage, idx) => {
              const active = selectedStageId === stage.id;
              const isLast = idx === industry.chainStages.length - 1;
              return (
                <div key={stage.id} className="flex items-stretch">
                  <motion.button
                    onClick={() => setSelectedStageId(stage.id)}
                    className={cn(
                      'relative flex-1 min-w-[140px] border border-high-text px-4 py-5 text-left transition-all',
                      active
                        ? 'bg-high-text text-high-bg shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                        : 'bg-white hover:shadow-[2px_2px_0px_rgba(0,0,0,1)]',
                    )}
                    whileHover={{ y: -2 }}
                  >
                    <div className={cn('text-[9px] font-mono uppercase tracking-widest mb-1', active ? 'opacity-60' : 'text-high-accent')}>
                      {String(idx + 1).padStart(2, '0')} / {String(industry.chainStages.length).padStart(2, '0')}
                    </div>
                    <div className={cn('font-serif italic text-lg leading-tight mb-1')}>{stage.shortLabel}</div>
                    <div className={cn('text-[10px] leading-snug', active ? 'opacity-70' : 'opacity-50')}>
                      {stage.name}
                    </div>
                    {stage.technologyIds.length > 0 && (
                      <div className={cn('mt-2 text-[9px] font-mono uppercase', active ? 'opacity-60' : 'opacity-40')}>
                        · {stage.technologyIds.length} Tech
                      </div>
                    )}
                  </motion.button>
                  {!isLast && (
                    <div className="flex items-center justify-center w-6 shrink-0">
                      <ChevronRight className="w-4 h-4 opacity-50" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Related policies strip */}
          <div className="mt-10">
            <div className="text-[9px] font-mono uppercase opacity-50 mb-3 tracking-widest">关联政策 / Policies</div>
            <div className="flex flex-wrap gap-2">
              {industry.relatedPolicies.map(pid => {
                const policy = POLICY_BY_ID[pid];
                if (!policy) return null;
                const color = DEPT_COLORS[policy.department].fill;
                return (
                  <button
                    key={pid}
                    onClick={() => onNavigateToPolicy?.(pid)}
                    className="px-2.5 py-1 bg-white border border-high-text text-[10px] font-bold uppercase tracking-wider hover:bg-high-text hover:text-white transition-colors flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
                    <span className="opacity-60 font-mono normal-case">{policy.date}</span>
                    <span>{policy.title.replace(/《|》/g, '').slice(0, 14)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex gap-6 text-[9px] font-mono uppercase opacity-40 mt-6">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 border border-high-text" />
            环节 / Stage
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-high-text" />
            当前选中 / Active
          </div>
          <div className="flex items-center gap-1.5">
            <ChevronRight className="w-3 h-3" />
            价值流向 / Flow
          </div>
        </div>
      </div>

      {/* RIGHT: stage detail */}
      <div className="w-[400px] bg-white flex flex-col relative overflow-hidden">
        <AnimatePresence mode="wait">
          {selectedStage ? (
            <motion.div
              key={`${industry.id}-${selectedStage.id}`}
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              className="flex-1 flex flex-col p-8 overflow-y-auto"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-mono text-high-accent font-bold mb-1 uppercase">
                    STAGE · {selectedStage.id.toUpperCase()}
                  </div>
                  <h2 className="text-3xl font-serif italic leading-tight">{selectedStage.name}</h2>
                  <p className="text-[11px] text-high-text/40 mt-1 uppercase tracking-tighter font-medium">
                    in {industry.name}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedStageId(null)}
                  className="px-2 py-1 border border-high-text text-[9px] font-mono uppercase hover:bg-high-text hover:text-white transition-colors shrink-0 ml-2"
                >
                  Close
                </button>
              </div>

              <div className="space-y-6 flex-1">
                <section>
                  <h3 className="text-[10px] font-mono border-b border-high-text pb-1 mb-3 uppercase tracking-widest font-bold">
                    环节说明 / Description
                  </h3>
                  <p className="text-[13px] leading-relaxed text-high-text opacity-80">
                    {selectedStage.description}
                  </p>
                </section>

                <section>
                  <h3 className="text-[10px] font-mono border-b border-high-text pb-1 mb-3 uppercase tracking-widest font-bold">
                    关联技术 / Tech Stack
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedStage.technologyIds.length === 0 && (
                      <span className="text-[11px] opacity-40">此环节未标注关联技术</span>
                    )}
                    {selectedStage.technologyIds.map(techId => {
                      const tech = ALL_SUB_TECHS.find(t => t.id === techId);
                      if (!tech) return null;
                      return (
                        <button
                          key={techId}
                          onClick={() => onNavigateToTech?.(techId)}
                          className="px-2.5 py-1 border border-high-text text-[10px] font-bold uppercase tracking-wider hover:bg-high-text hover:text-white transition-colors"
                          title={tech.categoryName}
                        >
                          {tech.name}
                        </button>
                      );
                    })}
                  </div>
                </section>

                <section>
                  <h3 className="text-[10px] font-mono border-b border-high-text pb-1 mb-3 uppercase tracking-widest font-bold">
                    产业链位置 / Position
                  </h3>
                  <div className="flex items-center gap-1 text-[10px] font-mono uppercase">
                    {industry.chainStages.map((s, i) => (
                      <div key={s.id} className="flex items-center gap-1">
                        <span
                          className={cn(
                            'px-1.5 py-0.5 border',
                            s.id === selectedStage.id
                              ? 'bg-high-text text-high-bg border-high-text'
                              : 'border-high-text/40 opacity-60',
                          )}
                        >
                          {s.shortLabel}
                        </span>
                        {i < industry.chainStages.length - 1 && <ChevronRight className="w-3 h-3 opacity-40" />}
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={`${industry.id}-overview`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col p-8 overflow-y-auto"
            >
              <div className="mb-6">
                <div className="text-[10px] font-mono text-high-accent font-bold mb-1 uppercase">
                  INDUSTRY · {industry.id.toUpperCase()}
                </div>
                <h2 className="text-3xl font-serif italic leading-tight">{industry.name}</h2>
                <p className="text-[11px] text-high-text/40 mt-1 uppercase tracking-tighter font-medium">
                  {industry.nationalPlanRef}
                </p>
              </div>

              <section className="mb-6">
                <h3 className="text-[10px] font-mono border-b border-high-text pb-1 mb-3 uppercase tracking-widest font-bold">
                  产业简介 / Overview
                </h3>
                <p className="text-[13px] leading-relaxed text-high-text opacity-80">{industry.description}</p>
              </section>

              <div className="mt-auto text-center text-[11px] opacity-40 uppercase tracking-[0.2em] py-4 border-t border-high-text/10">
                <Info className="w-8 h-8 mx-auto mb-2 stroke-1" />
                点击左侧环节 查看详情
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
