import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, Activity, Flame, Snowflake, Target, AlertCircle, Search } from 'lucide-react';
import type { ChainItem, ChainLayer, FundingEvent, TechnologyType } from '../types';
import { POLICY_DATA, FUNDING_EVENTS, CHAIN_MAP } from '../constants';
import { cn } from '../lib/utils';

interface MarketTrendsProps {
  activeTech?: TechnologyType;
  onNavigateToPolicy?: (policyId: string) => void;
  chain?: ChainLayer[];
  fundingEvents?: FundingEvent[];
}

export default function MarketTrends({
  activeTech = 'embodied-ai',
  onNavigateToPolicy,
  chain: chainOverride,
  fundingEvents: fundingOverride,
}: MarketTrendsProps) {
  const [selectedGap, setSelectedGap] = useState<ChainItem | null>(null);
  const [showInsight, setShowInsight] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const chain = chainOverride ?? CHAIN_MAP[activeTech] ?? [];

  const fundingEvents = useMemo(() => {
    if (fundingOverride && fundingOverride.length > 0) return fundingOverride;
    const forTech = FUNDING_EVENTS.filter(e => e.techId === activeTech);
    return forTech.length ? forTech : FUNDING_EVENTS;
  }, [activeTech, fundingOverride]);

  const policyTimeline = useMemo(() => {
    return POLICY_DATA
      .filter(p => typeof p.marketReactionDays === 'number')
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-6);
  }, []);

  const maxFunding = useMemo(() => {
    const vals = fundingEvents.map(e => numericAmount(e.amount));
    return Math.max(1, ...vals);
  }, [fundingEvents]);

  useEffect(() => {
    // reset gap panel on tech change
    setSelectedGap(null);
  }, [activeTech]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let raf = 0;
    let pos = 0;
    const tick = () => {
      if (el.matches(':hover')) {
        raf = requestAnimationFrame(tick);
        return;
      }
      pos += 0.35;
      if (pos >= el.scrollHeight / 2) pos = 0;
      el.scrollTop = pos;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [fundingEvents]);

  const displayEvents = [...fundingEvents, ...fundingEvents];

  return (
    <div className="flex w-full h-full text-[#141414] font-sans bg-[#efedea] overflow-hidden relative">
      {/* LEFT: Reaction timeline + funding feed */}
      <div className="w-[420px] shrink-0 border-r border-[#141414] flex flex-col bg-[#E4E3E0]/50 z-10">
        <div className="border-b border-[#141414] p-6 flex-1 flex flex-col overflow-y-auto no-scrollbar">
          <div className="mb-6">
            <h3 className="font-serif italic text-2xl font-bold mb-1">政策-市场反应延迟分析</h3>
            <p className="text-[10px] font-mono opacity-60 uppercase">监管事件与资本流入之间的延迟相关性分析。</p>
          </div>

          <div className="bg-[#141414]/5 border border-[#141414]/20 p-4 mb-8 text-xs leading-relaxed flex flex-col gap-3">
            <div className="flex gap-3 items-start">
              <Activity className="w-4 h-4 mt-0.5 shrink-0 text-[#f97316]" />
              <div>
                <span className="font-bold uppercase text-[10px] tracking-widest block mb-1">深度洞察</span>
                一级市场资本对顶层政策的响应存在显著的
                <strong className="bg-[#f97316]/20 px-1 mx-1">1–2 季度（3–6 个月）延迟</strong>
                。政策筑底后，大额融资往往集中在细分技术突破期爆发。
              </div>
            </div>
            <button
              onClick={() => setShowInsight(true)}
              className="mt-1 self-end text-[10px] uppercase font-bold text-[#f97316] hover:text-[#141414] transition-colors cursor-pointer"
            >
              查看详细信息 →
            </button>
          </div>

          <div className="relative flex-1 py-4 mt-4">
            <div className="absolute left-[30%] top-0 bottom-0 w-px bg-[#141414]/20 border-r border-dashed border-[#141414]/30" />
            {policyTimeline.map((p, idx) => {
              const days = p.marketReactionDays ?? 0;
              return (
                <div key={p.id} className="flex items-center w-full mb-8 relative">
                  <div className="w-[30%] pr-4 text-right relative">
                    <div className="text-[10px] font-mono font-bold bg-[#efedea] pr-2 inline-block relative z-10">{p.date}</div>
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0, transition: { delay: idx * 0.08 } }}
                      onClick={() => onNavigateToPolicy?.(p.id)}
                      className="mt-2 text-left bg-[#141414] text-white p-2 text-[9px] shadow-[2px_2px_0_rgba(0,0,0,0.2)] float-right w-full relative cursor-pointer"
                    >
                      <div className="font-mono text-[#f97316] mb-0.5 tracking-tighter">● POLICY</div>
                      <span className="leading-tight block line-clamp-2">{p.title}</span>
                      <div className="absolute right-[-4px] top-3 w-0 h-0 border-y-[3px] border-y-transparent border-l-[4px] border-l-[#141414]" />
                    </motion.div>
                  </div>
                  <div className="w-[70%] pl-4">
                    <div className="flex flex-col justify-center min-h-[32px]">
                      <motion.div
                        className="flex items-center gap-2"
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: '100%', opacity: 1, transition: { delay: idx * 0.08 + 0.15 } }}
                      >
                        <div
                          className="h-3 bg-[#f97316]"
                          style={{ width: `${Math.min(100, days * 4)}px` }}
                        />
                        <span className="text-[9px] font-mono font-bold shrink-0">{days} 天</span>
                      </motion.div>
                      <div className="text-[9px] mt-1.5 opacity-60 leading-tight border-l-2 border-[#f97316] pl-2">
                        {p.departmentLabel} · {p.summary.slice(0, 36)}…
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Funding feed */}
        <div className="h-[220px] bg-[#E4E3E0] border-t border-[#141414] text-[#141414] p-6 overflow-hidden shrink-0 flex flex-col relative">
          <div className="absolute top-6 right-6 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f97316] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#f97316]" />
          </div>
          <h4 className="text-[10px] font-mono uppercase tracking-widest font-bold mb-4 flex items-center gap-2 shrink-0">
            <TrendingUp className="w-3 h-3 text-[#f97316]" /> 即时巨额融资动态
          </h4>
          <div ref={scrollRef} className="flex flex-col gap-3 flex-1 overflow-y-hidden">
            {displayEvents.map((deal, i) => {
              const val = numericAmount(deal.amount);
              const barWidth = Math.max(6, (val / maxFunding) * 60);
              return (
                <div key={`${deal.id}-${i}`} className="flex justify-between items-center border-b border-[#141414]/10 pb-2 last:border-0 hover:bg-white/30 p-1 -mx-1 rounded transition-colors shrink-0">
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-bold truncate">{deal.company}</span>
                    <span className="text-[9px] font-mono opacity-60 truncate">{deal.date} · {deal.round} · {deal.track}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="h-1.5 bg-[#141414]/30" style={{ width: `${barWidth}px` }} />
                    <div className="text-[11px] font-mono text-[#141414] font-bold bg-[#141414]/5 px-1.5 py-0.5">
                      {deal.amount}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT: Heatmap + gap */}
      <div className="flex-1 flex flex-col relative bg-white overflow-y-auto no-scrollbar p-10">
        <div className="mb-10 w-full flex justify-between items-end">
          <div>
            <h2 className="text-4xl font-serif italic mb-2 tracking-tight">产业链热力分布图</h2>
            <p className="text-[11px] uppercase tracking-widest opacity-50 font-mono">
              产业链各环节的资本分布与政府引导干预映射 · {activeTech.toUpperCase()}
            </p>
          </div>
          <div className="flex gap-4 text-[9px] font-mono uppercase font-bold">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-white border-2 border-[#141414] shadow-[2px_2px_0_#141414]" /> 高热度 / 资本充裕</div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-white border border-[#141414]" /> 中热度 / 结构平衡</div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-[#efedea] border border-dashed border-[#141414]/40" /> 冷门 / 投资盲区</div>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-8 w-full max-w-5xl">
          {chain.map((layerInfo, stageIdx) => (
            <div key={layerInfo.layer} className="relative w-full">
              <div className="text-[10px] font-mono font-bold uppercase tracking-widest mb-4 border-b border-[#141414]/20 pb-1 w-full text-[#141414]/60">
                {layerInfo.layer} · {stageIdx === 0 ? 'Upstream' : stageIdx === 1 ? 'Midstream' : 'Downstream'}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                {layerInfo.items.map((item, i) => {
                  const isHot = item.heat === 'hot';
                  const isWarm = item.heat === 'warm';
                  const isGap = Boolean(item.gap);
                  const isSelected = selectedGap?.name === item.name;
                  return (
                    <motion.div
                      key={item.name}
                      onClick={() => (isGap ? setSelectedGap(isSelected ? null : item) : undefined)}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0, transition: { delay: stageIdx * 0.1 + i * 0.05 } }}
                      className={cn(
                        'relative flex flex-col p-4 transition-all',
                        isHot && 'bg-white border-2 border-[#141414] shadow-[4px_4px_0_rgba(20,20,20,1)] hover:shadow-[6px_6px_0_rgba(20,20,20,1)]',
                        isWarm && 'bg-white border border-[#141414] shadow-sm hover:shadow-md',
                        !isHot && !isWarm && 'bg-[#E4E3E0]/40 border border-dashed border-[#141414]/40',
                        isGap ? 'cursor-pointer group' : 'cursor-default',
                        isSelected && 'ring-2 ring-red-500 bg-red-50/50',
                      )}
                    >
                      <div className="flex justify-between items-start mb-4">
                        {isHot && <Flame className="w-4 h-4 text-[#f97316]" strokeWidth={2.5} />}
                        {isWarm && <Activity className="w-4 h-4 text-[#141414]/60" />}
                        {!isHot && !isWarm && <Snowflake className="w-4 h-4 text-[#141414]/30" />}
                        <span className={cn('text-[9px] font-mono font-bold px-1.5 py-0.5', isHot ? 'bg-[#141414] text-white' : 'bg-white border border-[#141414]/20')}>
                          {item.amount}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm leading-snug flex-1 mb-2">{item.name}</h4>
                      {isGap && (
                        <div className="-mx-4 -mb-4 mt-2 bg-red-500/10 border-t border-red-500/30 p-2 flex items-center gap-2 group-hover:bg-red-500/20 transition-colors">
                          <Target className="w-3 h-3 text-red-600" />
                          <span className="text-[9px] font-mono text-red-600 font-bold uppercase tracking-widest">政策干预靶向</span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <AnimatePresence>
          {selectedGap && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="absolute bottom-6 left-10 right-10 bg-[#141414] text-[#E4E3E0] p-6 shadow-2xl flex gap-6"
            >
              <div className="w-1/3 shrink-0 border-r border-[#E4E3E0]/20 pr-6">
                <div className="text-[10px] font-mono text-red-400 border border-red-400 px-1 inline-block mb-3">STATE-CAPITAL INTERVENTION REQUIRED</div>
                <h3 className="text-2xl font-serif italic">{selectedGap.name}</h3>
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-sm leading-relaxed opacity-90">
                    <strong>盲区诊断 (Gap Diagnosis)：</strong>
                    {selectedGap.reason ?? '市场化资金追求短期回报，在该赛道布局严重不足。'} 市场化资金由于追求短期回报率（IRR）与高流动性，在此赛道布局严重不足。
                  </p>
                </div>
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => {
                      // naive: jump to first policy in current tech's related list
                      const match = POLICY_DATA.find(p => p.relatedTechnologies.length > 0);
                      if (match && onNavigateToPolicy) onNavigateToPolicy(match.id);
                    }}
                    className="px-3 py-1.5 bg-white text-[#141414] text-[10px] font-bold uppercase hover:bg-red-500 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Search className="w-3 h-3" /> 搜集相关政策、技术成果、公司及案例
                  </button>
                </div>
              </div>
              <button
                onClick={() => setSelectedGap(null)}
                className="absolute top-4 right-4 text-[10px] font-mono opacity-50 hover:opacity-100 cursor-pointer"
              >
                [ 关闭 ]
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showInsight && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[540px] bg-white border-2 border-[#141414] shadow-[12px_12px_0_#141414] p-8 z-50 text-[#141414]"
          >
            <div className="flex justify-between items-start border-b border-[#141414] pb-4 mb-6">
              <h3 className="font-serif italic text-2xl font-bold">深度洞察详细信息</h3>
              <button
                onClick={() => setShowInsight(false)}
                className="text-[10px] uppercase font-mono tracking-widest opacity-50 hover:opacity-100 cursor-pointer px-2 py-1 bg-[#efedea]"
              >
                [ 关闭 ]
              </button>
            </div>
            <div className="space-y-4 text-sm leading-relaxed">
              <p>指导性政策往往需要更长时间落实到具体的政府引导基金，资本端表现为 <strong>3–6 个月</strong> 的观望期。</p>
              <p>带有明确补贴或采购意向的“真金白银”政策，市场反应延迟仅为 <strong>1–2 个月</strong>，往往极速引发产业上游核心部件或基础设施的抢投资浪潮。</p>
              <div className="bg-[#efedea]/50 p-4 border-l-4 border-[#f97316] font-mono text-xs mt-4">
                <strong>案例参考：</strong>在《人形机器人创新发展指导意见》发布后，整机代工企业首先获得资金支持；随后经过一个季度的技术评估，资本才逐渐向中上游的“柔性传感器”与“精密电机”等更底层的赛道转移。
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function numericAmount(raw: string): number {
  // Parse things like "$1.5B", "¥1.2B", "¥600M", "$100M", "¥250M"
  const m = raw.match(/([\d.]+)\s*([BMK])/i);
  if (!m) return 0;
  const n = parseFloat(m[1]);
  const unit = m[2].toUpperCase();
  const scale = unit === 'B' ? 1000 : unit === 'M' ? 1 : 0.001;
  // Rough CNY→USD for ranking fairness
  const cnyFactor = /¥/.test(raw) ? 1 / 7.2 : 1;
  return n * scale * cnyFactor;
}
