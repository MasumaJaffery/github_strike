import { generateStrikeCard, generateCompactStrikeCard, calculateStrikeRank } from '../../src/cards/strike-card';
import { GitHubStats, GitHubUser } from '../../src/types';

describe('Strike Card', () => {
  const mockUser: GitHubUser = {
    login: 'testuser',
    name: 'Test User',
    avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
    bio: 'Test bio',
    company: 'Test Company',
    location: 'Test City',
    blog: 'https://test.com',
    followers: 100,
    following: 50,
    publicRepos: 25,
    createdAt: '2020-01-01T00:00:00Z',
  };

  const mockStats: GitHubStats = {
    totalStars: 150,
    totalForks: 30,
    totalCommits: 500,
    totalPRs: 75,
    totalPRsMerged: 60,
    totalPRsReviewed: 40,
    totalIssues: 25,
    totalContributions: 1200,
    contributionStreak: 15,
    longestStreak: 45,
    currentStreak: 15,
  };

  describe('calculateStrikeRank', () => {
    it('should return Spark rank for low scores', () => {
      const lowStats: GitHubStats = {
        ...mockStats,
        totalCommits: 50,
        totalPRs: 5,
        totalPRsMerged: 3,
        totalStars: 10,
        totalIssues: 5,
        currentStreak: 3,
      };
      const rank = calculateStrikeRank(lowStats);
      expect(rank.rank).toBe('Spark');
      expect(rank.percentile).toBe(25);
    });

    it('should return Bolt rank for moderate scores', () => {
      const rank = calculateStrikeRank(mockStats);
      expect(rank.rank).toBe('Bolt');
      expect(rank.score).toBeGreaterThan(1000);
    });

    it('should return Thunder rank for higher scores', () => {
      const highStats: GitHubStats = {
        ...mockStats,
        totalCommits: 2000,
        totalPRs: 300,
        totalPRsMerged: 250,
        totalStars: 500,
      };
      const rank = calculateStrikeRank(highStats);
      expect(rank.rank).toBe('Thunder');
    });

    it('should return Lightning rank for high scores', () => {
      const veryHighStats: GitHubStats = {
        ...mockStats,
        totalCommits: 5000,
        totalPRs: 500,
        totalPRsMerged: 400,
        totalStars: 1000,
        currentStreak: 100,
      };
      const rank = calculateStrikeRank(veryHighStats);
      expect(rank.rank).toBe('Lightning');
    });

    it('should return Storm rank for very high scores', () => {
      const extremeStats: GitHubStats = {
        ...mockStats,
        totalCommits: 10000,
        totalPRs: 1000,
        totalPRsMerged: 800,
        totalStars: 2000,
        currentStreak: 200,
      };
      const rank = calculateStrikeRank(extremeStats);
      expect(rank.rank).toBe('Storm');
    });

    it('should return Tempest rank for exceptional scores', () => {
      const exceptionalStats: GitHubStats = {
        ...mockStats,
        totalCommits: 30000,
        totalPRs: 3000,
        totalPRsMerged: 2500,
        totalStars: 10000,
        totalIssues: 1000,
        currentStreak: 500,
      };
      const rank = calculateStrikeRank(exceptionalStats);
      expect(rank.rank).toBe('Tempest');
      expect(rank.percentile).toBe(99);
    });
  });

  describe('generateStrikeCard', () => {
    it('should generate a valid SVG', () => {
      const svg = generateStrikeCard({ user: mockUser, stats: mockStats });
      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
    });

    it('should include the username', () => {
      const svg = generateStrikeCard({ user: mockUser, stats: mockStats });
      expect(svg).toContain("Test User&#039;s GitHub Strike");
    });

    it('should include stats values', () => {
      const svg = generateStrikeCard({ user: mockUser, stats: mockStats });
      expect(svg).toContain('150');
      expect(svg).toContain('500');
    });

    it('should apply custom theme', () => {
      const svg = generateStrikeCard(
        { user: mockUser, stats: mockStats },
        { theme: 'midnight' }
      );
      expect(svg).toContain('#0f0f23');
    });

    it('should respect custom dimensions', () => {
      const svg = generateStrikeCard(
        { user: mockUser, stats: mockStats },
        { width: 600, height: 250 }
      );
      expect(svg).toContain('width="600"');
      expect(svg).toMatch(/viewBox="0 0 \d+ 250"/);
    });

    it('should hide specified stats', () => {
      const svg = generateStrikeCard(
        { user: mockUser, stats: mockStats },
        { hideStats: ['stars', 'commits'] }
      );
      expect(svg).not.toContain('Total Stars');
      expect(svg).not.toContain('Total Commits');
    });

    it('should disable animations when requested', () => {
      const svg = generateStrikeCard(
        { user: mockUser, stats: mockStats },
        { animate: false }
      );
      expect(svg).not.toContain('@keyframes');
    });

    it('should hide border when requested', () => {
      const svg = generateStrikeCard(
        { user: mockUser, stats: mockStats },
        { showBorder: false }
      );
      // The main rect border should not have stroke attribute when border is hidden
      expect(svg).toMatch(/<rect[^>]*fill="url\(#bgGradient\)"[^>]*\/>/);
      expect(svg).not.toMatch(/<rect[^>]*fill="url\(#bgGradient\)"[^>]*stroke="[^"]+"/);
    });
  });

  describe('generateCompactStrikeCard', () => {
    it('should generate a compact SVG', () => {
      const svg = generateCompactStrikeCard({ user: mockUser, stats: mockStats });
      expect(svg).toContain('<svg');
      expect(svg).toContain('width="400"');
      expect(svg).toMatch(/viewBox="0 0 \d+ 120"/);
    });

    it('should include username', () => {
      const svg = generateCompactStrikeCard({ user: mockUser, stats: mockStats });
      expect(svg).toContain(mockUser.login);
    });

    it('should show rank badge', () => {
      const svg = generateCompactStrikeCard({ user: mockUser, stats: mockStats });
      // Should contain one of the valid rank names
      const validRanks = ['Spark', 'Bolt', 'Thunder', 'Lightning', 'Storm', 'Tempest'];
      const hasRank = validRanks.some(rank => svg.includes(rank));
      expect(hasRank).toBe(true);
    });
  });
});
