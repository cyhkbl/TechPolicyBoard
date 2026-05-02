import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, Minus, Flame } from 'lucide-react';
import { POLICY_DATA, INDUSTRY_DATA, DEPT_COLORS } from '../constants';
import { cn } from '../lib/utils';

const HEAT_COLORS = {
  hot: { fill: '#f97316', label: '过热' },
  warm: { fill: '#facc15', label: '适中' },
  cool: { fill: '#60a5fa', label: '不足' },
};

export default function MarketTrends() {
  const [activeIndustryId, setActiveIndustryId] = useState<string>(INDUSTRY_DATA[0].id);

  const industry = useMemo(
    () => INDUSTRY_DATA.find(i => i.id === activeIndustryId) || INDUSTRY_DATA[0],
    [activeIndustryId],
  );

  const reactionStats = useMemo(() => {
    const items = POLICY_DATA
      .filter(p => typeof p.marketReactionDays === 'number')
      .sort((a, b) => (a.marketReactionDays ?? 999) - (b.marketReactionDays ?? 999));
    const maxDays = Math.max(...items.map(p => p.marketReactionDays ?? 0));
    return { items, maxDays };
  }, []);

  const maxCapital = useMemo(() => Math.max(...industry.capitalFlow.map(p => p.amount)), [industry]);

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-high-bg">
      <div className="px-8 pt-6 pb-4 border-b border-high-text/10 shrink-0">
        <div className="flex items-baseline justify-between gap-6 flex-wrap">
          <div>
            <span className="text-[10px] font-mono uppercase opacity-50">Current System View</span>
            <h2 className="text-3xl font-serif italic leading-tight">市场动向 · Market Trends</h2>
            <p className="text-[11px] mt-1 opacity-50">政策 → 市场反应时间 & 资本流向 (Static Demo)</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono uppercase opacity-50 mr-1">Industry</span>
            {INDUSTRY_DATA.map(ind => {
              const active = ind.id === activeIndustryId;
              return (
                <button
                  key={ind.id}
                  onClick={() => setActiveIndustryId(ind.id)}
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
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Policy → Market Reaction */}
          <section className="bg-white border border-high-text p-6">
            <div className="flex items-baseline justify-between mb-4">
              <div>
                <h3 className="text-[10px] font-mono uppercase tracking-widest font-bold mb-1">
                  政策 → 市场反应时间 / Policy Reaction Lag
                </h3>
                <p className="text-[11px] opacity-50">一级市场（创投）从政策发布到首轮投资反应的天数</p>
              </div>
              <div className="text-[9px] font-mono uppercase opacity-50">n={reactionStats.items.length}</div>
            </div>

            <div className="space-y-3">
              {reactionStats.items.map(p => {
                const days = p.marketReactionDays ?? 0;
                const pct = (days / reactionStats.maxDays) * 100;
                const color = DEPT_COLORS[p.department].fill;
                return (
                  <div key={p.id} className="group">
                    <div className="flex items-baseline gap-3 mb-1">
                      <span className="text-[9px] font-mono w-16 shrink-0 opacity-50">{p.date}</span>
                      <span className="flex-1 text-[12px] leading-tight truncate" title={p.title}>
                        {p.title.replace(/《|》/g, '')}
                      </span>
                      <span className="text-[12px] font-mono font-bold tabular-nums">{days}d</span>
                    </div>
                    <div className="relative h-1.5 bg-high-muted">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6 }}
                        className="h-full"
                        style={{ background: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-high-text/10 grid grid-cols-4 gap-3 text-[9px] font-mono uppercase">
              {(['MoST', 'MIIT', 'NDRC', 'International'] as const).map(d => (
                <div key={d} className="flex items-center gap-1.5 opacity-60">
                  <span className="w-2 h-2 rounded-full" style={{ background: DEPT_COLORS[d].fill }} />
                  {DEPT_COLORS[d].label}
                </div>
              ))}
            </div>
          </section>

          {/* Capital Flow */}
          <section className="bg-white border border-high-text p-6">
            <div className="flex items-baseline justify-between mb-4">
              <div>
                <h3 className="text-[10px] font-mono uppercase tracking-widest font-bold mb-1">
                  资本流向 / Capital Flow · {industry.name}
                </h3>
                <p className="text-[11px] opacity-50">产业链各环节资本流入规模（近 12 个月，示意数据）</p>
              </div>
              <div className="text-[9px] font-mono uppercase opacity-50">unit: B¥</div>
            </div>

            <div className="space-y-4">
              {industry.capitalFlow.map((node, idx) => {
                const pct = (node.amount / maxCapital) * 100;
                const heatColor = HEAT_COLORS[node.heat].fill;
                const trendIcon =
                  node.trend === 'up' ? (
                    <TrendingUp className="w-3 h-3 text-green-700" />
                  ) : node.trend === 'down' ? (
                    <TrendingDown className="w-3 h-3 text-red-700" />
                  ) : (
                    <Minus className="w-3 h-3 opacity-50" />
                  );
                return (
                  <div key={idx}>
                    <div className="flex items-baseline gap-3 mb-1">
                      <span className="text-[9px] font-mono w-6 shrink-0 opacity-50">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className="flex-1 text-[12px] font-bold">{node.stage}</span>
                      <span className="flex items-center gap-1">{trendIcon}</span>
                      <span className="text-[12px] font-mono font-bold tabular-nums">{node.amount}</span>
                    </div>
                    <div className="relative h-3 bg-high-muted">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, delay: idx * 0.05 }}
                        className="h-full flex items-center justify-end pr-1"
                        style={{ background: heatColor }}
                      >
                        {node.heat === 'hot' && <Flame className="w-2.5 h-2.5 text-white" />}
                      </motion.div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-high-text/10 flex items-center gap-4 text-[9px] font-mono uppercase">
              {(Object.keys(HEAT_COLORS) as (keyof typeof HEAT_COLORS)[]).map(k => (
                <div key={k} className="flex items-center gap-1.5 opacity-60">
                  <span className="w-2 h-2" style={{ background: HEAT_COLORS[k].fill }} />
                  {HEAT_COLORS[k].label}
                </div>
              ))}
              <div className="ml-auto opacity-40">资本不足环节 → 政策可发力方向</div>
            </div>
          </section>

          {/* Capital Summary: all industries */}
          <section className="xl:col-span-2 bg-white border border-high-text p-6">
            <div className="mb-4">
              <h3 className="text-[10px] font-mono uppercase tracking-widest font-bold mb-1">
                产业群图 / Industry Group Map
              </h3>
              <p className="text-[11px] opacity-50">节点大小 = 市场规模 · 颜色 = 资本热度</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {INDUSTRY_DATA.map(ind => {
                const maxA = Math.max(...ind.capitalFlow.map(s => s.amount));
                const total = ind.capitalFlow.reduce((a, s) => a + s.amount, 0);
                return (
                  <div
                    key={ind.id}
                    className={cn(
                      'border border-high-text p-4 cursor-pointer transition-all',
                      ind.id === activeIndustryId
                        ? 'bg-high-muted shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                        : 'hover:shadow-[2px_2px_0px_rgba(0,0,0,1)]',
                    )}
                    onClick={() => setActiveIndustryId(ind.id)}
                  >
                    <div className="flex items-baseline justify-between mb-2">
                      <span className="font-serif italic text-lg">{ind.name}</span>
                      <span className="text-[10px] font-mono opacity-50">{total}B</span>
                    </div>
                    <div className="flex items-end gap-1 h-16">
                      {ind.capitalFlow.map((s, i) => (
                        <div
                          key={i}
                          className="flex-1 flex flex-col justify-end"
                          title={`${s.stage}: ${s.amount}B`}
                        >
                          <div
                            className="w-full"
                            style={{
                              height: `${(s.amount / maxA) * 100}%`,
                              background: HEAT_COLORS[s.heat].fill,
                            }}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 flex gap-1 text-[8px] font-mono uppercase opacity-40 justify-between">
                      {ind.capitalFlow.map((s, i) => (
                        <span key={i} className="truncate">{s.stage}</span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
