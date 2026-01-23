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

export interface StrikeRank {
  rank: 'Spark' | 'Bolt' | 'Thunder' | 'Lightning' | 'Storm' | 'Tempest';
  score: number;
  percentile: number;
}
