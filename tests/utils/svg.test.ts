import {
  createSvgWrapper,
  adjustColor,
  formatNumber,
  createProgressBar,
  createIcon,
  createText,
  escapeHtml,
} from '../../src/utils/svg';
import { ThemeColors } from '../../src/types';

describe('SVG Utils', () => {
  const mockTheme: ThemeColors = {
    background: '#0d1117',
    backgroundGradient: 'linear-gradient(135deg, #0d1117 0%, #161b22 100%)',
    text: '#e6edf3',
    textSecondary: '#7d8590',
    accent: '#58a6ff',
    accentGlow: '#58a6ff40',
    border: '#30363d',
    icon: '#f0883e',
    progressBackground: '#21262d',
    progressFill: '#58a6ff',
  };

  describe('createSvgWrapper', () => {
    it('should create valid SVG structure', () => {
      const svg = createSvgWrapper('<rect/>', 400, 200, mockTheme);
      expect(svg).toContain('<svg');
      expect(svg).toContain('width="400"');
      expect(svg).toContain('height="200"');
      expect(svg).toContain('viewBox="0 0 400 200"');
      expect(svg).toContain('</svg>');
    });

    it('should include content', () => {
      const content = '<text>Hello</text>';
      const svg = createSvgWrapper(content, 400, 200, mockTheme);
      expect(svg).toContain(content);
    });

    it('should include animations when enabled', () => {
      const svg = createSvgWrapper('<rect/>', 400, 200, mockTheme, { animate: true });
      expect(svg).toContain('@keyframes');
      expect(svg).toContain('fadeIn');
    });

    it('should exclude animations when disabled', () => {
      const svg = createSvgWrapper('<rect/>', 400, 200, mockTheme, { animate: false });
      expect(svg).not.toContain('@keyframes');
    });

    it('should include border when showBorder is true', () => {
      const svg = createSvgWrapper('<rect/>', 400, 200, mockTheme, { showBorder: true });
      expect(svg).toContain('stroke-width="1"');
    });

    it('should exclude border when showBorder is false', () => {
      const svg = createSvgWrapper('<rect/>', 400, 200, mockTheme, { showBorder: false });
      expect(svg).not.toContain('stroke-width="1"');
    });

    it('should apply border radius', () => {
      const svg = createSvgWrapper('<rect/>', 400, 200, mockTheme, { borderRadius: 20 });
      expect(svg).toContain('rx="20"');
      expect(svg).toContain('ry="20"');
    });

    it('should include gradient definitions', () => {
      const svg = createSvgWrapper('<rect/>', 400, 200, mockTheme);
      expect(svg).toContain('<defs>');
      expect(svg).toContain('linearGradient');
      expect(svg).toContain('bgGradient');
    });
  });

  describe('adjustColor', () => {
    it('should lighten color with positive percent', () => {
      const result = adjustColor('#000000', 50);
      expect(result).toBe('#7f7f7f');
    });

    it('should darken color with negative percent', () => {
      const result = adjustColor('#ffffff', -50);
      expect(result).toBe('#808080');
    });

    it('should not exceed #ffffff', () => {
      const result = adjustColor('#ffffff', 100);
      expect(result).toBe('#ffffff');
    });

    it('should not go below #000000', () => {
      const result = adjustColor('#000000', -100);
      expect(result).toBe('#000000');
    });

    it('should handle colors with different hex values', () => {
      const result = adjustColor('#58a6ff', 10);
      expect(result).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });

  describe('formatNumber', () => {
    it('should format numbers under 1000 as-is', () => {
      expect(formatNumber(0)).toBe('0');
      expect(formatNumber(100)).toBe('100');
      expect(formatNumber(999)).toBe('999');
    });

    it('should format thousands with k suffix', () => {
      expect(formatNumber(1000)).toBe('1.0k');
      expect(formatNumber(1500)).toBe('1.5k');
      expect(formatNumber(10000)).toBe('10.0k');
    });

    it('should format millions with M suffix', () => {
      expect(formatNumber(1000000)).toBe('1.0M');
      expect(formatNumber(2500000)).toBe('2.5M');
    });
  });

  describe('createProgressBar', () => {
    it('should create progress bar SVG', () => {
      const bar = createProgressBar(10, 20, 100, 10, 50, mockTheme);
      expect(bar).toContain('<g');
      expect(bar).toContain('<rect');
    });

    it('should include background rect', () => {
      const bar = createProgressBar(10, 20, 100, 10, 50, mockTheme);
      expect(bar).toContain(`fill="${mockTheme.progressBackground}"`);
    });

    it('should calculate filled width based on progress', () => {
      const bar = createProgressBar(0, 0, 100, 10, 75, mockTheme);
      expect(bar).toContain('width="75"');
    });

    it('should cap progress at 100%', () => {
      const bar = createProgressBar(0, 0, 100, 10, 150, mockTheme);
      expect(bar).toContain('width="100"');
    });

    it('should not go below 0%', () => {
      const bar = createProgressBar(0, 0, 100, 10, -50, mockTheme);
      expect(bar).toContain('width="0"');
    });
  });

  describe('createIcon', () => {
    it('should create icon SVG group', () => {
      const icon = createIcon('star', 10, 20, 24, '#ff0000');
      expect(icon).toContain('<g');
      expect(icon).toContain('transform');
    });

    it('should apply position transform', () => {
      const icon = createIcon('star', 50, 100, 24, '#ff0000');
      expect(icon).toContain('translate(50, 100)');
    });

    it('should apply scale based on size', () => {
      const icon = createIcon('star', 0, 0, 48, '#ff0000');
      expect(icon).toContain('scale(2)');
    });

    it('should apply color', () => {
      const icon = createIcon('star', 0, 0, 24, '#ff0000');
      expect(icon).toContain('stroke="#ff0000"');
    });

    it('should handle different icon types', () => {
      const starIcon = createIcon('star', 0, 0, 24, '#000');
      const commitIcon = createIcon('commit', 0, 0, 24, '#000');
      expect(starIcon).not.toBe(commitIcon);
    });
  });

  describe('createText', () => {
    it('should create text element', () => {
      const text = createText('Hello', 10, 20);
      expect(text).toContain('<text');
      expect(text).toContain('Hello');
      expect(text).toContain('</text>');
    });

    it('should apply position', () => {
      const text = createText('Hello', 100, 200);
      expect(text).toContain('x="100"');
      expect(text).toContain('y="200"');
    });

    it('should apply custom color', () => {
      const text = createText('Hello', 0, 0, { color: '#ff0000' });
      expect(text).toContain('fill="#ff0000"');
    });

    it('should apply font size', () => {
      const text = createText('Hello', 0, 0, { size: 20 });
      expect(text).toContain('font-size="20"');
    });

    it('should apply font weight', () => {
      const text = createText('Hello', 0, 0, { weight: 'bold' });
      expect(text).toContain('font-weight="bold"');
    });

    it('should apply text anchor', () => {
      const text = createText('Hello', 0, 0, { anchor: 'middle' });
      expect(text).toContain('text-anchor="middle"');
    });

    it('should apply class name', () => {
      const text = createText('Hello', 0, 0, { className: 'fade-in' });
      expect(text).toContain('class="fade-in"');
    });
  });

  describe('escapeHtml', () => {
    it('should escape ampersand', () => {
      expect(escapeHtml('A & B')).toBe('A &amp; B');
    });

    it('should escape less than', () => {
      expect(escapeHtml('A < B')).toBe('A &lt; B');
    });

    it('should escape greater than', () => {
      expect(escapeHtml('A > B')).toBe('A &gt; B');
    });

    it('should escape quotes', () => {
      expect(escapeHtml('Say "Hello"')).toBe('Say &quot;Hello&quot;');
    });

    it('should escape single quotes', () => {
      expect(escapeHtml("It's")).toBe('It&#039;s');
    });

    it('should handle multiple special characters', () => {
      expect(escapeHtml('<script>"alert(1)"</script>')).toBe(
        '&lt;script&gt;&quot;alert(1)&quot;&lt;/script&gt;'
      );
    });

    it('should return unchanged string without special chars', () => {
      expect(escapeHtml('Hello World')).toBe('Hello World');
    });
  });
});
