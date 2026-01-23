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
      expect(svg).toContain("width='400px'");
      expect(svg).toContain("height='200px'");
      expect(svg).toContain("viewBox='0 0 400 200'");
      expect(svg).toContain('</svg>');
    });

    it('should include content', () => {
      const content = '<text>Hello</text>';
      const svg = createSvgWrapper(content, 400, 200, mockTheme);
      expect(svg).toContain(content);
    });

    it('should include xmlns attribute', () => {
      const svg = createSvgWrapper('<rect/>', 400, 200, mockTheme);
      expect(svg).toContain("xmlns='http://www.w3.org/2000/svg'");
    });

    it('should include isolation style', () => {
      const svg = createSvgWrapper('<rect/>', 400, 200, mockTheme);
      expect(svg).toContain("style='isolation:isolate'");
    });

    it('should include border when showBorder is true', () => {
      const svg = createSvgWrapper('<rect/>', 400, 200, mockTheme, { showBorder: true });
      expect(svg).toContain("stroke-width='1'");
    });

    it('should exclude border when showBorder is false', () => {
      const svg = createSvgWrapper('<rect/>', 400, 200, mockTheme, { showBorder: false });
      expect(svg).not.toContain("stroke-width='1'");
    });

    it('should apply border radius', () => {
      const svg = createSvgWrapper('<rect/>', 400, 200, mockTheme, { borderRadius: 20 });
      expect(svg).toContain("rx='20'");
    });

    it('should include clip path', () => {
      const svg = createSvgWrapper('<rect/>', 400, 200, mockTheme);
      expect(svg).toContain('clipPath');
      expect(svg).toContain('outer_rectangle');
    });
  });

  describe('adjustColor', () => {
    it('should lighten color with positive percent', () => {
      const result = adjustColor('#000000', 50);
      expect(result).not.toBe('#000000');
    });

    it('should darken color with negative percent', () => {
      const result = adjustColor('#ffffff', -50);
      expect(result).not.toBe('#ffffff');
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
      const result = adjustColor('#336699', 10);
      expect(result).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });

  describe('formatNumber', () => {
    it('should format numbers under 1000 as-is', () => {
      expect(formatNumber(500)).toBe('500');
      expect(formatNumber(999)).toBe('999');
    });

    it('should format thousands with k suffix', () => {
      expect(formatNumber(1000)).toBe('1.0k');
      expect(formatNumber(1500)).toBe('1.5k');
      expect(formatNumber(999999)).toBe('1000.0k');
    });

    it('should format millions with M suffix', () => {
      expect(formatNumber(1000000)).toBe('1.0M');
      expect(formatNumber(2500000)).toBe('2.5M');
    });
  });

  describe('createProgressBar', () => {
    it('should create progress bar SVG', () => {
      const bar = createProgressBar(10, 20, 100, 10, 50, mockTheme);
      expect(bar).toContain('<g>');
      expect(bar).toContain('<rect');
    });

    it('should include background rect', () => {
      const bar = createProgressBar(10, 20, 100, 10, 50, mockTheme);
      expect(bar).toContain(`fill='${mockTheme.progressBackground}'`);
    });

    it('should calculate filled width based on progress', () => {
      const bar = createProgressBar(0, 0, 100, 10, 75, mockTheme);
      expect(bar).toContain("width='75'");
    });

    it('should cap progress at 100%', () => {
      const bar = createProgressBar(0, 0, 100, 10, 150, mockTheme);
      expect(bar).toContain("width='100'");
    });

    it('should not go below 0%', () => {
      const bar = createProgressBar(0, 0, 100, 10, -50, mockTheme);
      expect(bar).toContain("width='0'");
    });
  });

  describe('createIcon', () => {
    it('should create icon SVG group', () => {
      const icon = createIcon('star', 10, 20, 24, '#ff0000');
      expect(icon).toContain('<g');
      expect(icon).toContain('transform');
    });

    it('should apply position transform', () => {
      const icon = createIcon('star', 10, 20, 24, '#ff0000');
      expect(icon).toContain('translate(10, 20)');
    });

    it('should apply scale based on size', () => {
      const icon = createIcon('star', 0, 0, 48, '#ff0000');
      expect(icon).toContain('scale(2)');
    });

    it('should apply color', () => {
      const icon = createIcon('star', 0, 0, 24, '#ff0000');
      expect(icon).toContain("stroke='#ff0000'");
    });

    it('should handle different icon types', () => {
      expect(createIcon('star', 0, 0, 24, '#fff')).toContain('path');
      expect(createIcon('commit', 0, 0, 24, '#fff')).toContain('circle');
      expect(createIcon('bolt', 0, 0, 24, '#fff')).toContain('path');
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
      const text = createText('Hello', 10, 20);
      expect(text).toContain("x='10'");
      expect(text).toContain("y='20'");
    });

    it('should apply custom color', () => {
      const text = createText('Hello', 0, 0, { color: '#ff0000' });
      expect(text).toContain("fill='#ff0000'");
    });

    it('should apply font size', () => {
      const text = createText('Hello', 0, 0, { size: 20 });
      expect(text).toContain("font-size='20px'");
    });

    it('should apply font weight', () => {
      const text = createText('Hello', 0, 0, { weight: 'bold' });
      expect(text).toContain("font-weight='bold'");
    });

    it('should apply text anchor', () => {
      const text = createText('Hello', 0, 0, { anchor: 'middle' });
      expect(text).toContain("text-anchor='middle'");
    });
  });

  describe('escapeHtml', () => {
    it('should escape ampersand', () => {
      expect(escapeHtml('a & b')).toBe('a &amp; b');
    });

    it('should escape less than', () => {
      expect(escapeHtml('a < b')).toBe('a &lt; b');
    });

    it('should escape greater than', () => {
      expect(escapeHtml('a > b')).toBe('a &gt; b');
    });

    it('should escape quotes', () => {
      expect(escapeHtml('a "b" c')).toBe('a &quot;b&quot; c');
    });

    it('should escape single quotes', () => {
      expect(escapeHtml("a 'b' c")).toBe('a &#039;b&#039; c');
    });

    it('should handle multiple special characters', () => {
      expect(escapeHtml('<script>"alert"</script>')).toBe('&lt;script&gt;&quot;alert&quot;&lt;/script&gt;');
    });

    it('should return unchanged string without special chars', () => {
      expect(escapeHtml('Hello World')).toBe('Hello World');
    });
  });
});
