import { generateContributionTimeline, generateStreakCard } from '../../src/cards/contribution-timeline';
import { ContributionCalendar } from '../../src/types';

describe('Contribution Timeline', () => {
  const mockCalendar: ContributionCalendar = {
    totalContributions: 1234,
    weeks: Array.from({ length: 52 }, (_, weekIndex) => ({
      days: Array.from({ length: 7 }, (_, dayIndex) => ({
        date: new Date(2025, 0, weekIndex * 7 + dayIndex + 1).toISOString().split('T')[0],
        count: Math.floor(Math.random() * 10),
        level: Math.floor(Math.random() * 5) as 0 | 1 | 2 | 3 | 4,
      })),
    })),
  };

  describe('generateContributionTimeline', () => {
    it('should generate a valid SVG', () => {
      const svg = generateContributionTimeline(mockCalendar);
      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
    });

    it('should include title', () => {
      const svg = generateContributionTimeline(mockCalendar);
      expect(svg).toContain('Contribution Timeline');
    });

    it('should show total contributions', () => {
      const svg = generateContributionTimeline(mockCalendar);
      expect(svg).toContain('1,234');
    });

    it('should render contribution cells', () => {
      const svg = generateContributionTimeline(mockCalendar);
      const rectCount = (svg.match(/<rect/g) || []).length;
      expect(rectCount).toBeGreaterThan(300);
    });

    it('should include legend', () => {
      const svg = generateContributionTimeline(mockCalendar);
      expect(svg).toContain('Less');
      expect(svg).toContain('More');
    });

    it('should show month labels by default', () => {
      const svg = generateContributionTimeline(mockCalendar);
      expect(svg).toMatch(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/);
    });

    it('should hide month labels when requested', () => {
      const svg = generateContributionTimeline(mockCalendar, { showMonthLabels: false });
      expect(svg).not.toContain('Jan');
    });

    it('should show day labels by default', () => {
      const svg = generateContributionTimeline(mockCalendar);
      expect(svg).toContain('Mon');
      expect(svg).toContain('Wed');
      expect(svg).toContain('Fri');
    });

    it('should hide day labels when requested', () => {
      const svg = generateContributionTimeline(mockCalendar, { showDayLabels: false });
      expect(svg).not.toContain('Mon');
    });

    it('should apply custom theme', () => {
      const svg = generateContributionTimeline(mockCalendar, { theme: 'frost' });
      expect(svg).toContain('#0a1628');
    });

    it('should apply custom dimensions', () => {
      const svg = generateContributionTimeline(mockCalendar, { width: 900, height: 200 });
      expect(svg).toContain('max-width: 900px');
      expect(svg).toMatch(/viewBox="0 0 \d+ 200"/);
    });

    it('should disable animations when requested', () => {
      const svg = generateContributionTimeline(mockCalendar, { animate: false });
      expect(svg).not.toContain('animation:');
    });
  });

  describe('generateStreakCard', () => {
    it('should generate a valid SVG', () => {
      const svg = generateStreakCard(mockCalendar, 15, 45);
      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
    });

    it('should include title', () => {
      const svg = generateStreakCard(mockCalendar, 15, 45);
      expect(svg).toContain('Contribution Streak');
    });

    it('should show current streak', () => {
      const svg = generateStreakCard(mockCalendar, 15, 45);
      expect(svg).toContain('>15<');
      expect(svg).toContain('Current Streak');
    });

    it('should show longest streak', () => {
      const svg = generateStreakCard(mockCalendar, 15, 45);
      expect(svg).toContain('>45<');
      expect(svg).toContain('Longest Streak');
    });

    it('should show total contributions', () => {
      const svg = generateStreakCard(mockCalendar, 15, 45);
      expect(svg).toContain('1.2k');
      expect(svg).toContain('This Year');
    });

    it('should apply custom theme', () => {
      const svg = generateStreakCard(mockCalendar, 15, 45, { theme: 'neon' });
      expect(svg).toContain('#0a0a0a');
    });

    it('should apply custom dimensions', () => {
      const svg = generateStreakCard(mockCalendar, 15, 45, { width: 500, height: 180 });
      expect(svg).toContain('max-width: 500px');
      expect(svg).toMatch(/viewBox="0 0 \d+ 180"/);
    });
  });
});
