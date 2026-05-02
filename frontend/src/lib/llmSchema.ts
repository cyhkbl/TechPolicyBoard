// 纯文本 schema,注入到 system prompt 给 LLM 看。不做运行时验证。
// 字段与 src/types.ts 保持一致;枚举要显式列出便于小模型对齐。

export const POLICY_SCHEMA = `type Policy = {
  id: string;                       // 独特 kebab-case id
  title: string;                    // 政策名称 / 中文
  country: string;                  // 例如 "中国" / "美国" / "欧盟"
  department: 'MoST' | 'MIIT' | 'NDRC' | 'International';
  departmentLabel: string;          // "科技部" / "工信部" / "发改委" / "国际"
  level: 'national' | 'ministerial' | 'local';
  date: string;                     // "YYYY-MM"
  summary: string;                  // 1-3 句话的摘要
  fullTextUrl: string;              // 原文链接,允许占位 "#"
  relatedTechnologies: string[];    // 子技术 id,例如 ["servo-motor","computer-vision"]
  relatedIndustries: string[];      // 产业 id,例如 ["humanoid-robot","compute-grid"]
  marketReactionDays?: number;      // 政策落地到资本响应的天数,1-180
  iso3?: string;                    // "CHN" | "USA" | "EUU" | "JPN" | "KOR" | "GBR" | "OTH"
  innovationStage?: 'basic-research' | 'applied-rd' | 'pilot' | 'commercialization';
  keywords?: string[];              // 3-5 个中文短词
  highlights?: string[];            // 2-4 条要点
};`;

export const REGION_SCHEMA = `type RegionPolicyRef = {
  id: string;                       // 对应 Policy.id;若不存在可随意给 demo id
  targetTrack: string;              // 例如 "具身智能 / 感知"
  focus: string;                    // 1 句话 focus
};
type RegionScenario = {
  name: string;                     // 场景名,如 "中关村具身智能产业园"
  description: string;              // 2-3 句话
  technologies: string[];           // 子技术 id 列表
};
type Region = {
  id: string;                       // kebab-case
  name: string;                     // 中文地区名
  englishName: string;              // 英文别名
  coordinates: { x: number; y: number };  // 0-100 抽象坐标
  endowment: string;                // 一句话禀赋描述
  policies: RegionPolicyRef[];      // 2-4 条
  scenarios: RegionScenario[];      // 2-3 条
};`;

export const CHAIN_SCHEMA = `type Heat = 'hot' | 'warm' | 'cold';
type ChainItem = {
  name: string;                     // 环节名
  heat: Heat;
  amount: string;                   // 例如 "$4.2B" / "¥18B" / "—"
  gap?: boolean;                    // 是否卡脖子 / 投资盲区
  reason?: string;                  // gap=true 时给出一句诊断
};
type ChainLayer = {
  layer: '上游' | '中游' | '下游';
  items: ChainItem[];               // 每层 4-6 条
};`;

export const FUNDING_EVENT_SCHEMA = `type FundingEvent = {
  id: string;
  company: string;                  // 公司名
  round: string;                    // "Series C" / "Pre-A" / "B+" 等
  amount: string;                   // "$1.5B" / "¥600M"
  date: string;                     // "YYYY-MM"
  track: string;                    // 赛道短描述
  techId?: 'embodied-ai' | 'bci' | 'quantum' | 'fusion';
};`;

export const ROUTING_ENVELOPE = `{
  "module": "policy" | "industry" | "market",
  "payload": {
    // module=policy:   { "policies": Policy[] }         // 8-12 条
    // module=industry: { "regions":  Region[] }         // 6-8 条
    // module=market:   { "chain": ChainLayer[]; "fundingEvents": FundingEvent[] }  // 3 层 + 8-12 条
  }
}`;
