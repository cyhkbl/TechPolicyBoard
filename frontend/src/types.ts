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
