import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, KeyRound, Globe, Cpu, Shield } from 'lucide-react';
import type { LLMConfig } from '../hooks/useLLMConfig';
import { cn } from '../lib/utils';

interface SettingsDrawerProps {
  open: boolean;
  config: LLMConfig;
  onSave: (next: LLMConfig) => void;
  onClose: () => void;
}

const PRESETS: Array<{ label: string; baseURL: string; model: string }> = [
  { label: 'OpenAI', baseURL: 'https://api.openai.com/v1', model: 'gpt-4o-mini' },
  { label: 'DeepSeek', baseURL: 'https://api.deepseek.com/v1', model: 'deepseek-chat' },
  { label: '智谱 GLM', baseURL: 'https://open.bigmodel.cn/api/paas/v4', model: 'glm-4-flash' },
  { label: '通义 Qwen', baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1', model: 'qwen-plus' },
  { label: 'Ollama 本地', baseURL: 'http://localhost:11434/v1', model: 'llama3.1' },
];

export default function SettingsDrawer({ open, config, onSave, onClose }: SettingsDrawerProps) {
  const [form, setForm] = useState<LLMConfig>(config);

  useEffect(() => {
    if (open) setForm(config);
  }, [open, config]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40"
          />
          <motion.aside
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.25 }}
            className="fixed right-0 top-0 h-full w-[420px] bg-high-bg border-l border-high-text z-50 flex flex-col"
          >
            <header className="h-14 border-b border-high-text flex items-center justify-between px-5 shrink-0 bg-high-muted">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest opacity-50">Agent Config</div>
                <h2 className="font-serif italic text-lg">模型接入设置</h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 border border-high-text flex items-center justify-center hover:bg-high-text hover:text-high-bg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              <section>
                <label className="text-[10px] font-mono uppercase tracking-widest font-bold flex items-center gap-2 mb-2">
                  <Globe className="w-3 h-3" /> 预设端点
                </label>
                <div className="flex flex-wrap gap-2">
                  {PRESETS.map(p => {
                    const active = form.baseURL === p.baseURL;
                    return (
                      <button
                        key={p.label}
                        onClick={() => setForm(f => ({ ...f, baseURL: p.baseURL, model: p.model }))}
                        className={cn(
                          'text-[10px] px-2 py-1 border border-high-text transition-colors',
                          active ? 'bg-high-text text-high-bg' : 'bg-transparent hover:bg-high-text/10',
                        )}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </section>

              <section>
                <label className="text-[10px] font-mono uppercase tracking-widest font-bold flex items-center gap-2 mb-2">
                  <KeyRound className="w-3 h-3" /> API Key
                </label>
                <input
                  type="password"
                  value={form.apiKey}
                  onChange={e => setForm(f => ({ ...f, apiKey: e.target.value }))}
                  placeholder="sk-... / 你的 API Key"
                  className="w-full border border-high-text bg-white px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-high-text"
                />
                <p className="text-[10px] opacity-50 mt-1">仅存 localStorage,不经过后端。生产场景请走后端代理。</p>
              </section>

              <section>
                <label className="text-[10px] font-mono uppercase tracking-widest font-bold flex items-center gap-2 mb-2">
                  <Globe className="w-3 h-3" /> Base URL
                </label>
                <input
                  type="text"
                  value={form.baseURL}
                  onChange={e => setForm(f => ({ ...f, baseURL: e.target.value }))}
                  placeholder="https://api.openai.com/v1"
                  className="w-full border border-high-text bg-white px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-high-text"
                />
                <p className="text-[10px] opacity-50 mt-1">OpenAI 兼容的 /chat/completions 端点,不含末尾 /chat/completions。</p>
              </section>

              <section>
                <label className="text-[10px] font-mono uppercase tracking-widest font-bold flex items-center gap-2 mb-2">
                  <Cpu className="w-3 h-3" /> Model
                </label>
                <input
                  type="text"
                  value={form.model}
                  onChange={e => setForm(f => ({ ...f, model: e.target.value }))}
                  placeholder="gpt-4o-mini / deepseek-chat / qwen-plus ..."
                  className="w-full border border-high-text bg-white px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-high-text"
                />
              </section>

              <section>
                <label className="text-[10px] font-mono uppercase tracking-widest font-bold flex items-center gap-2 mb-2">
                  <Shield className="w-3 h-3" /> 走后端代理(避免 CORS)
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setForm(f => ({ ...f, useProxy: true }))}
                    className={cn(
                      'flex-1 text-[10px] px-3 py-2 border border-high-text transition-colors',
                      form.useProxy ? 'bg-high-text text-high-bg' : 'bg-transparent hover:bg-high-text/10',
                    )}
                  >
                    ON · 默认推荐
                  </button>
                  <button
                    onClick={() => setForm(f => ({ ...f, useProxy: false }))}
                    className={cn(
                      'flex-1 text-[10px] px-3 py-2 border border-high-text transition-colors',
                      !form.useProxy ? 'bg-high-text text-high-bg' : 'bg-transparent hover:bg-high-text/10',
                    )}
                  >
                    OFF · 浏览器直连
                  </button>
                </div>
                <p className="text-[10px] opacity-50 mt-1">
                  ON:前端→FastAPI(/api/llm/chat)→上游。自建/企业端点一般都不带 CORS,推荐 ON。OFF 仅适合 OpenAI/DeepSeek 等明确开 CORS 的官方端点。
                </p>
              </section>
            </div>

            <footer className="h-16 border-t border-high-text flex items-center justify-end gap-2 px-5 shrink-0 bg-high-muted">
              <button
                onClick={onClose}
                className="text-[10px] uppercase font-bold tracking-widest border border-high-text bg-white px-4 py-2 hover:bg-high-text hover:text-high-bg transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => {
                  onSave(form);
                  onClose();
                }}
                className="text-[10px] uppercase font-bold tracking-widest border border-high-text bg-high-text text-high-bg px-4 py-2 hover:bg-high-accent transition-colors"
              >
                保存
              </button>
            </footer>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
