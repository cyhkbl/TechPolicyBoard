import { useCallback, useEffect, useState } from 'react';

export interface LLMConfig {
  apiKey: string;
  baseURL: string;
  model: string;
  useProxy: boolean;
}

const STORAGE_KEY = 'tpb:llmConfig';

const DEFAULT_CONFIG: LLMConfig = {
  apiKey: '',
  baseURL: 'https://api.openai.com/v1',
  model: 'gpt-4o-mini',
  useProxy: true,
};

function readFromStorage(): LLMConfig {
  if (typeof window === 'undefined') return DEFAULT_CONFIG;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CONFIG;
    const parsed = JSON.parse(raw) as Partial<LLMConfig>;
    return {
      apiKey: parsed.apiKey ?? '',
      baseURL: parsed.baseURL || DEFAULT_CONFIG.baseURL,
      model: parsed.model || DEFAULT_CONFIG.model,
      useProxy: parsed.useProxy ?? DEFAULT_CONFIG.useProxy,
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function useLLMConfig() {
  const [config, setConfigState] = useState<LLMConfig>(() => readFromStorage());

  const setConfig = useCallback((next: LLMConfig) => {
    setConfigState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // storage unavailable (private mode, quota) — keep in-memory only
    }
  }, []);

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setConfigState(readFromStorage());
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const isConfigured = Boolean(config.apiKey && config.baseURL && config.model);
  return { config, setConfig, isConfigured };
}
