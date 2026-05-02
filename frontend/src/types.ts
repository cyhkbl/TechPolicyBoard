export type TechnologyType = 'embodied-ai' | 'bci' | 'quantum' | 'fusion';

export interface RecentAchievement {
  title: string;
  date: string;
  source: string;
}

export interface TechSubComponent {
  id: string;
  name: string;
  shortLabel?: string;
  description: string;
  capabilityCan: string[];
  capabilityCannot: string[];
  recentAchievements: RecentAchievement[];
}

export interface TechCategory {
  id: string;
  name: string;
  nameEn?: string;
  subComponents: TechSubComponent[];
}

export interface TechnologyData {
  id: TechnologyType;
  name: string;
  nameEn?: string;
  tagline?: string;
  categories: TechCategory[];
}

export type ModuleType = 'explorer' | 'policy' | 'industry' | 'market';

export type PolicyDepartment = 'MoST' | 'MIIT' | 'NDRC' | 'International';

export type PolicyLevel = 'supranational' | 'national' | 'ministerial' | 'local';

export type InnovationStage = 'basic-research' | 'applied-rd' | 'pilot' | 'commercialization';

export interface Policy {
  id: string;
  title: string;
  country: string;
  department: PolicyDepartment;
  departmentLabel: string;
  level: 'national' | 'ministerial' | 'local';
  date: string;
  summary: string;
  fullTextUrl: string;
  relatedTechnologies: string[];
  relatedIndustries: string[];
  marketReactionDays?: number;
  iso3?: string;
  coordinates?: { x: number; y: number };
  innovationStage?: InnovationStage;
  similarIds?: string[];
  highlights?: string[];
  keywords?: string[];
}

export interface RegionPolicyRef {
  id: string;
  targetTrack: string;
  focus: string;
}

export interface RegionScenario {
  name: string;
  description: string;
  technologies: string[];
}

export interface Region {
  id: string;
  name: string;
  englishName: string;
  coordinates: { x: number; y: number };
  endowment: string;
  policies: RegionPolicyRef[];
  scenarios: RegionScenario[];
}

export interface FundingEvent {
  id: string;
  company: string;
  round: string;
  amount: string;
  date: string;
  track: string;
  techId?: TechnologyType;
}

export type Heat = 'hot' | 'warm' | 'cold';

export interface ChainItem {
  name: string;
  heat: Heat;
  amount: string;
  gap?: boolean;
  reason?: string;
}

export interface ChainLayer {
  layer: '上游' | '中游' | '下游';
  items: ChainItem[];
}

export interface IndustryChainStage {
  id: string;
  name: string;
  shortLabel: string;
  description: string;
  technologyIds: string[];
}

export interface CapitalFlowPoint {
  stage: string;
  amount: number;
  trend: 'up' | 'down' | 'stable';
  heat: 'hot' | 'warm' | 'cool';
}

export interface Industry {
  id: string;
  name: string;
  tagline: string;
  description: string;
  nationalPlanRef: string;
  chainStages: IndustryChainStage[];
  relatedPolicies: string[];
  capitalFlow: CapitalFlowPoint[];
}
