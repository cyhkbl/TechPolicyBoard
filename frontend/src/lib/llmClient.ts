import type {
  ChainLayer,
  FundingEvent,
  Policy,
  Region,
  TechnologyType,
} from '../types';
import type { LLMConfig } from '../hooks/useLLMConfig';
import {
  POLICY_SCHEMA,
  REGION_SCHEMA,
  CHAIN_SCHEMA,
  FUNDING_EVENT_SCHEMA,
  ROUTING_ENVELOPE,
} from './llmSchema';

export type LLMModule = 'policy' | 'industry' | 'market';

export interface LLMPolicyPayload {
  policies: Policy[];
}
export interface LLMIndustryPayload {
  regions: Region[];
}
export interface LLMMarketPayload {
  chain: ChainLayer[];
  fundingEvents: FundingEvent[];
}
export type LLMPayload = LLMPolicyPayload | LLMIndustryPayload | LLMMarketPayload;

export interface LLMResponse {
  module: LLMModule;
  payload: LLMPayload;
}

function buildSystemPrompt(currentTech: TechnologyType): string {
  return [
    '你是一个科技产业看板 agent。用户会用中文提出科技/政策/产业相关问题。',
    '你必须根据问题判断它最适合展示在以下哪个板块:',
    '  - policy   (政策动向):涉及法规、部委文件、国家规划、治理标准',
    '  - industry (产业场景):涉及地区/产业集群/应用场景/厂商',
    '  - market   (市场动向):涉及资本、融资、产业链资本分布、热点/冷门',
    '然后生成与该板块匹配的 JSON 数据,数量和字段需要符合下面的 schema。',
    '',
    `当前用户聚焦的技术:${currentTech}。生成数据应与该技术强相关。`,
    '',
    '必须严格返回下面形状的 JSON,不要使用 markdown 代码块,不要加注释,不要加额外文本:',
    ROUTING_ENVELOPE,
    '',
    '类型定义 (仅供参照,输出 JSON 时移除类型注释):',
    POLICY_SCHEMA,
    REGION_SCHEMA,
    CHAIN_SCHEMA,
    FUNDING_EVENT_SCHEMA,
    '',
    '数量要求:',
    '- policy: policies 8-12 条,innovationStage 覆盖 4 个阶段',
    '- industry: regions 6-8 条,每个 scenarios 2-3 条',
    '- market: chain 3 层(上游/中游/下游)每层 4-6 条;fundingEvents 8-12 条',
    '只输出 JSON 本身。',
  ].join('\n');
}

function stripCodeFences(raw: string): string {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  return (fenced ? fenced[1] : raw).trim();
}

function validate(resp: unknown): LLMResponse {
  if (!resp || typeof resp !== 'object') throw new Error('响应不是 JSON 对象');
  const r = resp as { module?: string; payload?: unknown };
  if (r.module !== 'policy' && r.module !== 'industry' && r.module !== 'market') {
    throw new Error(`module 字段无效: ${String(r.module)}`);
  }
  if (!r.payload || typeof r.payload !== 'object') {
    throw new Error('payload 缺失或不是对象');
  }
  const payload = r.payload as Record<string, unknown>;
  if (r.module === 'policy') {
    if (!Array.isArray(payload.policies) || payload.policies.length === 0) {
      throw new Error('policy 板块 payload.policies 必须是非空数组');
    }
    normalizePolicies(payload.policies as Array<Record<string, unknown>>);
  } else if (r.module === 'industry') {
    if (!Array.isArray(payload.regions) || payload.regions.length === 0) {
      throw new Error('industry 板块 payload.regions 必须是非空数组');
    }
    normalizeRegions(payload.regions as Array<Record<string, unknown>>);
  } else {
    if (!Array.isArray(payload.chain) || payload.chain.length === 0) {
      throw new Error('market 板块 payload.chain 必须是非空数组');
    }
    if (!Array.isArray(payload.fundingEvents)) {
      throw new Error('market 板块 payload.fundingEvents 必须是数组');
    }
  }
  return resp as LLMResponse;
}

const VALID_DEPT = new Set(['MoST', 'MIIT', 'NDRC', 'International']);
const VALID_LEVEL = new Set(['national', 'ministerial', 'local', 'supranational']);
const VALID_STAGE = new Set(['basic-research', 'applied-rd', 'pilot', 'commercialization']);

function normalizePolicies(arr: Array<Record<string, unknown>>) {
  for (const p of arr) {
    const country = String(p.country ?? '');
    if (!VALID_DEPT.has(String(p.department))) {
      // Map unknown depts to International for foreign, NDRC for domestic top-level
      p.department = /中|国|CPC|State|国务院/.test(country + String(p.departmentLabel ?? '')) ? 'NDRC' : 'International';
    }
    if (!VALID_LEVEL.has(String(p.level))) {
      p.level = 'national';
    }
    if (p.innovationStage !== undefined && !VALID_STAGE.has(String(p.innovationStage))) {
      p.innovationStage = 'applied-rd';
    }
    if (!Array.isArray(p.relatedTechnologies)) p.relatedTechnologies = [];
    if (!Array.isArray(p.relatedIndustries)) p.relatedIndustries = [];
    if (!p.departmentLabel) {
      const depts: Record<string, string> = { MoST: '科技部', MIIT: '工信部', NDRC: '发改委', International: '国际' };
      p.departmentLabel = depts[String(p.department)] ?? String(p.department);
    }
  }
}

function normalizeRegions(arr: Array<Record<string, unknown>>) {
  for (const r of arr) {
    if (!r.coordinates || typeof r.coordinates !== 'object') {
      r.coordinates = { x: 50, y: 50 };
    }
    if (!Array.isArray(r.policies)) r.policies = [];
    if (!Array.isArray(r.scenarios)) r.scenarios = [];
    if (!r.englishName) r.englishName = String(r.id ?? r.name ?? 'region');
  }
}

export async function askLLM(
  question: string,
  currentTech: TechnologyType,
  config: LLMConfig,
  signal?: AbortSignal,
): Promise<LLMResponse> {
  if (!config.apiKey) throw new Error('未配置 API Key,请先点右上齿轮设置');
  if (!config.baseURL) throw new Error('未配置 baseURL');
  if (!config.model) throw new Error('未配置模型名');

  const messages = [
    { role: 'system' as const, content: buildSystemPrompt(currentTech) },
    { role: 'user' as const, content: question },
  ];

  let data: unknown;

  if (config.useProxy) {
    // Go through our FastAPI proxy (/api/llm/chat) to dodge browser CORS.
    const res = await fetch('/api/llm/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        baseURL: config.baseURL,
        apiKey: config.apiKey,
        model: config.model,
        temperature: 0.3,
        response_format: { type: 'json_object' },
        messages,
      }),
      signal,
    });
    if (!res.ok) {
      let detail: string;
      try {
        const j = await res.json();
        detail = typeof j.detail === 'string' ? j.detail : JSON.stringify(j.detail ?? j);
      } catch {
        detail = await res.text().catch(() => '');
      }
      throw new Error(`proxy ${res.status}: ${detail.slice(0, 400)}`);
    }
    data = await res.json();
  } else {
    const url = `${config.baseURL.replace(/\/$/, '')}/chat/completions`;
    const body = {
      model: config.model,
      temperature: 0.3,
      stream: false,
      response_format: { type: 'json_object' as const },
      messages,
    };
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify(body),
      signal,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`${res.status} ${res.statusText}: ${text.slice(0, 300)}`);
    }
    data = await res.json();
  }

  const content: string | undefined = (data as { choices?: Array<{ message?: { content?: string } }> })
    ?.choices?.[0]?.message?.content;
  if (!content) throw new Error('响应中没有 choices[0].message.content');

  let parsed: unknown;
  try {
    parsed = JSON.parse(stripCodeFences(content));
  } catch (e) {
    throw new Error('返回内容不是合法 JSON: ' + (e instanceof Error ? e.message : String(e)));
  }

  return validate(parsed);
}
