import { Loader2, AlertCircle, RotateCcw, CheckCircle2 } from 'lucide-react';
import type { LLMModule } from '../lib/llmClient';
import { cn } from '../lib/utils';

interface AgentStatusBarProps {
  model: string;
  loading: boolean;
  error: string | null;
  lastModule: LLMModule | null;
  hasOverride: boolean;
  onReset: () => void;
  onDismissError: () => void;
}

const MODULE_LABEL: Record<LLMModule, string> = {
  policy: '政策动向',
  industry: '产业场景',
  market: '市场动向',
};

export default function AgentStatusBar({
  model,
  loading,
  error,
  lastModule,
  hasOverride,
  onReset,
  onDismissError,
}: AgentStatusBarProps) {
  return (
    <div className="h-8 border-t border-b border-high-text/40 bg-high-muted/60 flex items-center px-4 gap-4 shrink-0 text-[10px] font-mono">
      <div className="flex items-center gap-1.5">
        <div className={cn('w-1.5 h-1.5 rounded-full', loading ? 'bg-high-accent animate-pulse' : 'bg-high-text/40')} />
        <span className="opacity-60 uppercase">Agent</span>
        <span className="font-bold truncate max-w-[200px]">{model || '未配置模型'}</span>
      </div>

      {loading && (
        <div className="flex items-center gap-1.5 text-high-accent">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>正在生成...</span>
        </div>
      )}

      {!loading && lastModule && hasOverride && (
        <div className="flex items-center gap-1.5 text-green-700">
          <CheckCircle2 className="w-3 h-3" />
          <span>
            <strong>{MODULE_LABEL[lastModule]}</strong> 已按最近提问刷新
          </span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-1.5 text-red-700 flex-1 min-w-0">
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span className="truncate">{error}</span>
          <button
            onClick={onDismissError}
            className="ml-auto text-[9px] opacity-60 hover:opacity-100 underline shrink-0"
          >
            dismiss
          </button>
        </div>
      )}

      <div className="ml-auto flex items-center gap-2">
        {hasOverride && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 border border-high-text px-2 py-0.5 hover:bg-high-text hover:text-high-bg transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            恢复原始数据
          </button>
        )}
      </div>
    </div>
  );
}
