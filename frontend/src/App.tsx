/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import { ModuleType, TechnologyType } from './types';
import { cn } from './lib/utils';
import TechExplorer from './components/TechExplorer';
import PolicyTracker from './components/PolicyTracker';
import IndustryChain from './components/IndustryChain';
import MarketTrends from './components/MarketTrends';

const MODULES: { id: ModuleType; name: string; number: string }[] = [
  { id: 'explorer', name: '技术介绍', number: '01' },
  { id: 'policy', name: '政策动向', number: '02' },
  { id: 'industry', name: '产业场景', number: '03' },
  { id: 'market', name: '市场动向', number: '04' },
];

const TECHNOLOGIES: { id: TechnologyType; name: string; label: string }[] = [
  { id: 'embodied-ai', name: '具身智能', label: 'Embodied AI' },
  { id: 'bci', name: '脑机接口', label: 'BCI' },
  { id: 'quantum', name: '量子计算', label: 'Quantum' },
  { id: 'fusion', name: '核聚变', label: 'Fusion' },
];

export default function App() {
  const [activeModule, setActiveModule] = useState<ModuleType>('explorer');
  const [activeTech, setActiveTech] = useState<TechnologyType>('embodied-ai');
  const [focusIndustryId, setFocusIndustryId] = useState<string | null>(null);
  const [focusPolicyId, setFocusPolicyId] = useState<string | null>(null);

  const navigateToTech = useCallback(() => {
    setActiveModule('explorer');
  }, []);

  const navigateToIndustry = useCallback((industryId: string) => {
    setFocusIndustryId(industryId);
    setActiveModule('industry');
  }, []);

  const navigateToPolicy = useCallback((policyId: string) => {
    setFocusPolicyId(policyId);
    setActiveModule('policy');
  }, []);

  return (
    <div className="flex flex-col h-screen w-full bg-high-bg text-high-text font-sans overflow-hidden select-none">
      {/* TOP NAVIGATION: TECH SELECTION */}
      <header className="h-14 border-b border-high-text flex items-center px-6 justify-between shrink-0 bg-high-muted">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 border border-high-text flex items-center justify-center font-mono text-xs font-bold">T.E</div>
          <h1 className="font-serif italic text-lg tracking-tight">TechPolicyBoard</h1>
        </div>
        <nav className="flex gap-1 h-full items-center">
          {TECHNOLOGIES.map((tech) => (
            <button
              key={tech.id}
              onClick={() => setActiveTech(tech.id)}
              className={cn(
                "px-4 py-1 border border-high-text text-[10px] font-bold uppercase tracking-wider transition-all",
                activeTech === tech.id
                  ? "bg-high-text text-high-bg shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                  : "opacity-40 hover:opacity-100 bg-transparent"
              )}
            >
              {tech.name} ({tech.label})
            </button>
          ))}
        </nav>
      </header>

      {/* MAIN MODULE TABS GRID */}
      <div className="grid grid-cols-4 h-12 border-b border-high-text shrink-0">
        {MODULES.map((module) => (
          <button
            key={module.id}
            onClick={() => setActiveModule(module.id)}
            className={cn(
              "flex items-center justify-center gap-2 border-r last:border-r-0 border-high-text text-[11px] uppercase tracking-widest font-bold transition-all",
              activeModule === module.id
                ? "bg-high-bg"
                : "bg-high-muted opacity-60 hover:opacity-100"
            )}
          >
            <span className="opacity-30 font-mono text-[9px]">{module.number}</span> {module.name}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeModule}-${activeTech}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-1 overflow-hidden"
          >
            {activeModule === 'explorer' && (
              <TechExplorer
                techId={activeTech}
                onNavigateToPolicy={(policyId) => policyId ? navigateToPolicy(policyId) : setActiveModule('policy')}
                onNavigateToIndustry={(industryId) => industryId ? navigateToIndustry(industryId) : setActiveModule('industry')}
              />
            )}
            {activeModule === 'policy' && (
              <PolicyTracker
                currentTech={activeTech}
                focusPolicyId={focusPolicyId}
                onNavigateToTech={navigateToTech}
                onNavigateToIndustry={navigateToIndustry}
              />
            )}
            {activeModule === 'industry' && (
              <IndustryChain
                focusIndustryId={focusIndustryId}
                onNavigateToTech={navigateToTech}
                onNavigateToPolicy={navigateToPolicy}
              />
            )}
            {activeModule === 'market' && (
              <MarketTrends
                activeTech={activeTech}
                onNavigateToPolicy={navigateToPolicy}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* BOTTOM AGENT AREA */}
      <footer className="h-[140px] border-t border-high-text bg-high-muted flex flex-col p-4 shrink-0">
        <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar">
          <span className="text-[9px] font-mono uppercase py-1 opacity-50 whitespace-nowrap">Suggested Prompts:</span>
          {[
            "具身智能对劳动力市场的影响？",
            "对比国内外伺服电机厂商差异",
            "解释'端到端算法'的技术难点"
          ].map((q, i) => (
            <button
              key={i}
              onClick={() => alert(`分析建议: 关于 "${q}" 的数据正在抓取中...`)}
              className="px-3 py-1 bg-white border border-high-text text-[10px] rounded-full hover:bg-high-text hover:text-white whitespace-nowrap transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        <div className="flex-1 flex gap-4">
          <div className="w-12 h-12 bg-high-text text-high-bg flex items-center justify-center font-serif italic text-xl shrink-0">
            A
          </div>
          <form
            className="flex-1 relative"
            onSubmit={(e) => {
              e.preventDefault();
              const input = e.currentTarget.querySelector('input');
              if (input && input.value) {
                alert(`Agent 收到问题: "${input.value}"。正在基于 ${activeTech} 进行深度推理...`);
                input.value = '';
              }
            }}
          >
            <input
              type="text"
              placeholder={`向 Agent 提问，探索 ${TECHNOLOGIES.find(t => t.id === activeTech)?.name} 的更深层细节...`}
              className="w-full h-12 border border-high-text bg-high-bg px-4 text-sm placeholder-high-text/30 focus:outline-none focus:ring-1 focus:ring-high-text"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
              <span className="text-[9px] font-mono opacity-30 hidden sm:block">CMD + ENTER TO SEND</span>
              <div className="w-6 h-6 border border-high-text flex items-center justify-center">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </form>
        </div>
      </footer>
    </div>
  );
}
