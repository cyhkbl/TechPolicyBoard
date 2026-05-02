export type TechnologyType = 'embodied-ai' | 'bci' | 'quantum' | 'fusion';

export interface TechSubComponent {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  recentResults: { text: string; link?: string }[];
  boundary: string;
}

export interface TechCategory {
  id: string;
  name: string;
  subComponents: TechSubComponent[];
  icon?: string;
}

export interface TechnologyData {
  id: TechnologyType;
  name: string;
  categories: TechCategory[];
}

export type ModuleType = 'explorer' | 'policy' | 'industry' | 'market';
