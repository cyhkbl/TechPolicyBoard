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
