import { generateAchievementCard, calculateAchievements } from '../../src/cards/achievement-bolts';
import { GitHubStats } from '../../src/types';

describe('Achievement Bolts', () => {
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

  describe('calculateAchievements', () => {
    it('should return all achievement definitions', () => {
      const achievements = calculateAchievements(mockStats);
      expect(achievements.length).toBe(8);
    });

    it('should mark first_strike as unlocked', () => {
      const achievements = calculateAchievements(mockStats);
      const firstStrike = achievements.find((a) => a.id === 'first_strike');
      expect(firstStrike?.unlocked).toBe(true);
    });

    it('should mark commit_storm as unlocked for 500+ commits', () => {
      const achievements = calculateAchievements(mockStats);
      const commitStorm = achievements.find((a) => a.id === 'commit_storm');
      expect(commitStorm?.unlocked).toBe(true);
      expect(commitStorm?.tier).toBe('silver');
    });

    it('should calculate correct tier for star_power', () => {
      const achievements = calculateAchievements(mockStats);
      const starPower = achievements.find((a) => a.id === 'star_power');
      expect(starPower?.unlocked).toBe(true);
      expect(starPower?.tier).toBe('gold');
    });

    it('should track progress for achievements', () => {
      const achievements = calculateAchievements(mockStats);
      const prThunder = achievements.find((a) => a.id === 'pr_thunder');
      expect(prThunder?.progress).toBe(75);
    });

    it('should mark locked achievements for low stats', () => {
      const lowStats: GitHubStats = {
        ...mockStats,
        totalStars: 5,
        totalPRs: 3,
        totalIssues: 2,
        longestStreak: 3,
        totalForks: 1,
      };
      const achievements = calculateAchievements(lowStats);
      const starPower = achievements.find((a) => a.id === 'star_power');
      expect(starPower?.unlocked).toBe(false);
    });

    it('should assign diamond tier for exceptional stats', () => {
      const exceptionalStats: GitHubStats = {
        ...mockStats,
        totalCommits: 15000,
        totalStars: 2000,
        totalPRs: 600,
        longestStreak: 400,
      };
      const achievements = calculateAchievements(exceptionalStats);
      const commitStorm = achievements.find((a) => a.id === 'commit_storm');
      expect(commitStorm?.tier).toBe('diamond');
    });
  });

  describe('generateAchievementCard', () => {
    it('should generate a valid SVG', () => {
      const svg = generateAchievementCard(mockStats);
      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
    });

    it('should include title', () => {
      const svg = generateAchievementCard(mockStats);
      expect(svg).toContain('Achievement Bolts');
    });

    it('should show unlock count', () => {
      const svg = generateAchievementCard(mockStats);
      expect(svg).toMatch(/\d+\/8 Unlocked/);
    });

    describe('grid layout', () => {
      it('should generate grid layout by default', () => {
        const svg = generateAchievementCard(mockStats, { layout: 'grid' });
        expect(svg).toContain('Achievement Bolts');
      });

      it('should show achievement names', () => {
        const svg = generateAchievementCard(mockStats, { layout: 'grid' });
        expect(svg).toContain('First Strike');
        expect(svg).toContain('Commit Storm');
      });
    });

    describe('list layout', () => {
      it('should generate list layout', () => {
        const svg = generateAchievementCard(mockStats, { layout: 'list' });
        expect(svg).toContain('Achievement Bolts');
      });

      it('should show descriptions in list layout', () => {
        const svg = generateAchievementCard(mockStats, { layout: 'list' });
        expect(svg).toContain('Make your first commit');
      });

      it('should show progress bars', () => {
        const svg = generateAchievementCard(mockStats, { layout: 'list' });
        const rectCount = (svg.match(/<rect/g) || []).length;
        expect(rectCount).toBeGreaterThan(8);
      });
    });

    it('should hide locked achievements when requested', () => {
      const svg = generateAchievementCard(mockStats, { showLocked: false });
      const lowStats: GitHubStats = {
        ...mockStats,
        totalStars: 5,
      };
      const svgLow = generateAchievementCard(lowStats, { showLocked: false });
      expect(svgLow.length).toBeLessThan(svg.length);
    });

    it('should limit achievements shown', () => {
      const svg = generateAchievementCard(mockStats, { maxAchievements: 4 });
      expect(svg).toContain('First Strike');
    });

    it('should apply custom theme', () => {
      const svg = generateAchievementCard(mockStats, { theme: 'ember' });
      expect(svg).toContain('#1a0a0a');
    });
  });
});
