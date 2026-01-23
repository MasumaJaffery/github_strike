import { generateLanguageCard } from '../../src/cards/language-radar';
import { LanguageStats } from '../../src/types';

describe('Language Card', () => {
  const mockLanguages: LanguageStats = {
    TypeScript: { size: 50000, percentage: 40, color: '#3178c6' },
    JavaScript: { size: 30000, percentage: 24, color: '#f1e05a' },
    Python: { size: 20000, percentage: 16, color: '#3572A5' },
    Go: { size: 15000, percentage: 12, color: '#00ADD8' },
    Rust: { size: 10000, percentage: 8, color: '#dea584' },
  };

  describe('generateLanguageCard', () => {
    it('should generate a valid SVG', () => {
      const svg = generateLanguageCard(mockLanguages);
      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
    });

    it('should include language names', () => {
      const svg = generateLanguageCard(mockLanguages);
      expect(svg).toContain('TypeScript');
      expect(svg).toContain('JavaScript');
      expect(svg).toContain('Python');
    });

    describe('radar layout', () => {
      it('should generate radar visualization', () => {
        const svg = generateLanguageCard(mockLanguages, { layout: 'radar' });
        expect(svg).toContain('polygon');
        expect(svg).toContain('Language Proficiency Radar');
      });

      it('should include data points', () => {
        const svg = generateLanguageCard(mockLanguages, { layout: 'radar' });
        expect(svg).toContain('<circle');
      });
    });

    describe('donut layout', () => {
      it('should generate donut visualization', () => {
        const svg = generateLanguageCard(mockLanguages, { layout: 'donut' });
        expect(svg).toContain('<path');
        expect(svg).toContain('Languages');
      });

      it('should show percentages', () => {
        const svg = generateLanguageCard(mockLanguages, { layout: 'donut', showPercentage: true });
        expect(svg).toContain('40.0%');
      });

      it('should hide percentages when requested', () => {
        const svg = generateLanguageCard(mockLanguages, { layout: 'donut', showPercentage: false });
        expect(svg).not.toContain('40.0%');
      });
    });

    describe('bars layout', () => {
      it('should generate bar visualization', () => {
        const svg = generateLanguageCard(mockLanguages, { layout: 'bars' });
        expect(svg).toContain('Top Languages');
        expect(svg).toContain('<rect');
      });

      it('should show progress bars', () => {
        const svg = generateLanguageCard(mockLanguages, { layout: 'bars' });
        const rectCount = (svg.match(/<rect/g) || []).length;
        expect(rectCount).toBeGreaterThan(10);
      });
    });

    describe('compact layout', () => {
      it('should generate compact visualization', () => {
        const svg = generateLanguageCard(mockLanguages, { layout: 'compact' });
        expect(svg).toContain('Languages');
      });

      it('should have smaller height', () => {
        const svg = generateLanguageCard(mockLanguages, { layout: 'compact' });
        expect(svg).toContain('height="100"');
      });
    });

    it('should limit number of languages', () => {
      const svg = generateLanguageCard(mockLanguages, { maxLanguages: 3 });
      expect(svg).toContain('TypeScript');
      expect(svg).toContain('JavaScript');
      expect(svg).toContain('Python');
      expect(svg).not.toContain('Rust');
    });

    it('should apply custom theme', () => {
      const svg = generateLanguageCard(mockLanguages, { theme: 'aurora' });
      expect(svg).toContain('#0a192f');
    });

    it('should apply custom dimensions', () => {
      const svg = generateLanguageCard(mockLanguages, { width: 500, height: 400 });
      expect(svg).toContain('width="500"');
      expect(svg).toContain('height="400"');
    });
  });
});
