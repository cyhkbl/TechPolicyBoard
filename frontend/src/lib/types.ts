export interface Achievement {
  title: string
  date: string
  source: string
}

export interface LeafTech {
  id: string
  name: string
  description: string
  capability?: string
  achievements?: Achievement[]
}

export interface CategoryTech {
  id: string
  name: string
  description?: string
  children: LeafTech[]
}

export interface RootTech {
  id: string
  name: string
  description: string
  children: CategoryTech[]
}

export type CategoryId = 'perception' | 'motion' | 'decision'
