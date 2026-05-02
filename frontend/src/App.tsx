/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Settings } from 'lucide-react';
import type { ChainLayer, FundingEvent, ModuleType, Policy, Region, TechnologyType } from './types';
import { cn } from './lib/utils';
import TechExplorer from './components/TechExplorer';
import PolicyTracker from './components/PolicyTracker';
import IndustryChain from './components/IndustryChain';
import MarketTrends from './components/MarketTrends';
import SettingsDrawer from './components/SettingsDrawer';
import AgentStatusBar from './components/AgentStatusBar';
import { useLLMConfig } from './hooks/useLLMConfig';
import { askLLM, type LLMModule, type LLMResponse } from './lib/llmClient';
import { DEMO_PRESETS } from './lib/demoPresets';

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
];interface LLMOverride {
  policy?: Policy[];
  industry?: Region[];
  market?: { chain: ChainLayer[]; fundingEvents: FundingEvent[] };
}

export default function App() {
  const [activeModule, setActiveModule] = useState<ModuleType>('explorer');
  const [activeTech, setActiveTech] = useState<TechnologyType>('embodied-ai');
  const [focusIndustryId, setFocusIndustryId] = useState<string | null>(null);
  const [focusPolicyId, setFocusPolicyId] = useState<string | null>(null);

  const { config, setConfig, isConfigured } = useLLMConfig();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [llmOverride, setLLMOverride] = useState<LLMOverride>({});
  const [agentLoading, setAgentLoading] = useState(false);
  const [agentError, setAgentError] = useState<string | null>(null);
  const [lastAgentModule, setLastAgentModule] = useState<LLMModule | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

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

  const applyResponse = useCallback((resp: LLMResponse) => {
    setLLMOverride(prev => {
      if (resp.module === 'policy') {
        return { ...prev, policy: (resp.payload as { policies: Policy[] }).policies };
      }
      if (resp.module === 'industry') {
        return { ...prev, industry: (resp.payload as { regions: Region[] }).regions };
      }
      const m = resp.payload as { chain: ChainLayer[]; fundingEvents: FundingEvent[] };
      return { ...prev, market: { chain: m.chain, fundingEvents: m.fundingEvents } };
    });
    setLastAgentModule(resp.module);
    setActiveModule(resp.module);
    setAgentError(null);
  }, []);

  const submitQuestion = useCallback(async (question: string) => {
    const q = question.trim();
    if (!q) return;

    if (!isConfigured) {
      setAgentError('未配置 API Key / Base URL / 模型,请点右上齿轮');
      setSettingsOpen(true);
      return;
    }

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setAgentLoading(true);
    setAgentError(null);
    try {
      const resp = await askLLM(q, activeTech, config, ctrl.signal);
      applyResponse(resp);
    } catch (e) {
      if (ctrl.signal.aborted) return;
      setAgentError(e instanceof Error ? e.message : String(e));
    } finally {
      if (abortRef.current === ctrl) abortRef.current = null;
      setAgentLoading(false);
    }
  }, [activeTech, config, isConfigured, applyResponse]);

  const resetOverride = useCallback(() => {
    setLLMOverride({});
    setLastAgentModule(null);
    setAgentError(null);
  }, []);

  const hasOverride = Boolean(llmOverride.policy || llmOverride.industry || llmOverride.market);

  return (
    <div className="flex flex-col h-screen w-full bg-high-bg text-high-text font-sans overflow-hidden select-none">
      {/* TOP NAVIGATION */}
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
                'px-4 py-1 border border-high-text text-[10px] font-bold uppercase tracking-wider transition-all',
                activeTech === tech.id
                  ? 'bg-high-text text-high-bg shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                  : 'opacity-40 hover:opacity-100 bg-transparent',
              )}
            >
              {tech.name} ({tech.label})
            </button>
          ))}
          <button
            onClick={() => setSettingsOpen(true)}
            title="模型接入设置"
            className={cn(
              'ml-3 w-8 h-8 border border-high-text flex items-center justify-center transition-colors',
              isConfigured ? 'bg-high-text text-high-bg hover:bg-high-accent' : 'bg-white hover:bg-high-text hover:text-high-bg',
            )}
          >
            <Settings className="w-4 h-4" />
          </button>
        </nav>
      </header>

      <div className="grid grid-cols-4 h-12 border-b border-high-text shrink-0">
        {MODULES.map((module) => (
          <button
            key={module.id}
            onClick={() => setActiveModule(module.id)}
            className={cn(
              'flex items-center justify-center gap-2 border-r last:border-r-0 border-high-text text-[11px] uppercase tracking-widest font-bold transition-all',
              activeModule === module.id ? 'bg-high-bg' : 'bg-high-muted opacity-60 hover:opacity-100',
            )}
          >
            <span className="opacity-30 font-mono text-[9px]">{module.number}</span> {module.name}
            {(module.id === 'policy' && llmOverride.policy) ||
            (module.id === 'industry' && llmOverride.industry) ||
            (module.id === 'market' && llmOverride.market) ? (
              <span className="ml-1 text-[8px] font-mono bg-high-accent text-white px-1">AI</span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden relative">
        <AnimatePresence mode="sync">
          <motion.div
            key={activeModule}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex-1 overflow-hidden"
          >
            {activeModule === 'explorer' && (
              <TechExplorer
                techId={activeTech}
                onNavigateToPolicy={(policyId) => (policyId ? navigateToPolicy(policyId) : setActiveModule('policy'))}
                onNavigateToIndustry={(industryId) => (industryId ? navigateToIndustry(industryId) : setActiveModule('industry'))}
              />
            )}
            {activeModule === 'policy' && (
              <PolicyTracker
                currentTech={activeTech}
                focusPolicyId={focusPolicyId}
                onNavigateToTech={navigateToTech}
                onNavigateToIndustry={navigateToIndustry}
                policies={llmOverride.policy}
              />
            )}
            {activeModule === 'industry' && (
              <IndustryChain
                focusIndustryId={focusIndustryId}
                onNavigateToTech={navigateToTech}
                onNavigateToPolicy={navigateToPolicy}
                regions={llmOverride.industry}
              />
            )}
            {activeModule === 'market' && (
              <MarketTrends
                activeTech={activeTech}
                onNavigateToPolicy={navigateToPolicy}
                chain={llmOverride.market?.chain}
                fundingEvents={llmOverride.market?.fundingEvents}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <AgentStatusBar
        model={config.model}
        loading={agentLoading}
        error={agentError}
        lastModule={lastAgentModule}
        hasOverride={hasOverride}
        onReset={resetOverride}
        onDismissError={() => setAgentError(null)}
      />

      {/* BOTTOM AGENT AREA */}
      <footer className="h-[140px] border-t border-high-text bg-high-muted flex flex-col p-4 shrink-0">
        <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar">
          <span className="text-[9px] font-mono uppercase py-1 opacity-50 whitespace-nowrap">
            Demo Presets:
          </span>
          {DEMO_PRESETS.map((preset, i) => (
            <button
              key={i}
              onClick={() => applyResponse(preset.response)}
              disabled={agentLoading}
              title="一键加载预制数据,不调用 LLM"
              className="px-3 py-1 bg-white border border-high-text text-[10px] rounded-full hover:bg-high-text hover:text-white whitespace-nowrap transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {preset.label}
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
              const v = inputRef.current?.value ?? '';
              if (!v.trim()) return;
              submitQuestion(v);
              if (inputRef.current) inputRef.current.value = '';
            }}
          >
            <input
              ref={inputRef}
              type="text"
              disabled={agentLoading}
              placeholder={
                agentLoading
                  ? '正在推理,请稍候...'
                  : `向 Agent 提问,探索 ${TECHNOLOGIES.find(t => t.id === activeTech)?.name} 的更深层细节...`
              }
              className="w-full h-12 border border-high-text bg-high-bg px-4 text-sm placeholder-high-text/30 focus:outline-none focus:ring-1 focus:ring-high-text disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={agentLoading}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 disabled:opacity-40"
            >
              <span className="text-[9px] font-mono opacity-30 hidden sm:block">ENTER TO SEND</span>
              <div className="w-6 h-6 border border-high-text flex items-center justify-center hover:bg-high-text hover:text-high-bg transition-colors">
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>
          </form>
        </div>
      </footer>

      <SettingsDrawer
        open={settingsOpen}
        config={config}
        onSave={setConfig}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}
