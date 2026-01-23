export interface GitHubUser {
  login: string;
  name: string | null;
  avatarUrl: string;
  bio: string | null;
  company: string | null;
  location: string | null;
  blog: string | null;
  followers: number;
  following: number;
  publicRepos: number;
  createdAt: string;
}

export interface GitHubStats {
  totalStars: number;
  totalForks: number;
  totalCommits: number;
  totalPRs: number;
  totalPRsMerged: number;
  totalPRsReviewed: number;
  totalIssues: number;
  totalContributions: number;
  contributionStreak: number;
  longestStreak: number;
  currentStreak: number;
}

export interface LanguageStats {
  [language: string]: {
    size: number;
    percentage: number;
    color: string;
  };
}

export interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface ContributionWeek {
  days: ContributionDay[];
}

export interface ContributionCalendar {
  totalContributions: number;
  weeks: ContributionWeek[];
}

export interface Repository {
  name: string;
  description: string | null;
  url: string;
  stars: number;
  forks: number;
  primaryLanguage: string | null;
  isPrivate: boolean;
  isFork: boolean;
  updatedAt: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
}

export interface StrikeRank {
  rank: 'Spark' | 'Bolt' | 'Thunder' | 'Lightning' | 'Storm' | 'Tempest';
  score: number;
  percentile: number;
}

export interface CardOptions {
  theme?: ThemeName;
  width?: number;
  height?: number;
  showBorder?: boolean;
  borderRadius?: number;
  animate?: boolean;
  locale?: string;
  hideStats?: string[];
  customColors?: Partial<ThemeColors>;
}

export interface ThemeColors {
  background: string;
  backgroundGradient?: string;
  text: string;
  textSecondary: string;
  accent: string;
  accentGlow: string;
  border: string;
  icon: string;
  progressBackground: string;
  progressFill: string;
}

export type ThemeName =
  | 'electric'
  | 'midnight'
  | 'aurora'
  | 'ember'
  | 'frost'
  | 'neon'
  | 'sunset'
  | 'ocean'
  | 'forest'
  | 'cyber';

export interface FlukebaseProject {
  id: number;
  name: string;
  description: string;
  stage: string;
  collaborators: number;
  agreements: number;
  createdAt: string;
}

export interface FlukebaseStats {
  totalProjects: number;
  activeCollaborations: number;
  completedAgreements: number;
  projectsByStage: Record<string, number>;
}
