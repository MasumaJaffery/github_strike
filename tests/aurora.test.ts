import { renderAuroraSVG } from '../src/renderers/auroraRenderer';
import { AuroraData, WeekBand } from '../src/fetchers/auroraFetcher';

// Helper: build mock AuroraData
function mockData(overrides: Partial<AuroraData> = {}): AuroraData {
  const bands: WeekBand[] = Array.from({ length: 52 }, (_, i) => ({
    weekIndex: i,
    totalCommits: Math.floor(Math.sin(i / 5) * 10 + 12),
    normalised: (Math.sin(i / 5) + 1) / 2,
  }));
  return {
    username: 'testuser',
    bands,
    totalCommits: 1204,
    currentStreak: 47,
    totalStars: 342,
    topLanguage: 'TypeScript',
    rank: 'STORM',
    ...overrides,
  };
}

describe('renderAuroraSVG', () => {
  it('returns a valid SVG string', () => {
    const svg = renderAuroraSVG(mockData());
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
  });

  it('includes the username', () => {
    const svg = renderAuroraSVG(mockData({ username: 'MasumaJaffery' }));
    expect(svg).toContain('@MasumaJaffery');
  });

  it('renders 4 aurora ribbon layers (8 paths = glow + main per ribbon)', () => {
    const svg = renderAuroraSVG(mockData());
    const paths = svg.match(/<path /g) ?? [];
    // 4 ribbons × 2 layers = 8 aurora paths
    expect(paths.length).toBeGreaterThanOrEqual(8);
  });

  it('shows correct total commits', () => {
    const svg = renderAuroraSVG(mockData({ totalCommits: 9999 }));
    expect(svg).toContain('9,999');
  });

  it('shows streak days', () => {
    const svg = renderAuroraSVG(mockData({ currentStreak: 63 }));
    expect(svg).toContain('63d');
  });

  it('shows rank badge', () => {
    const svg = renderAuroraSVG(mockData({ rank: 'TEMPEST' }));
    expect(svg).toContain('TEMPEST');
  });

  it('shows star count', () => {
    const svg = renderAuroraSVG(mockData({ totalStars: 512 }));
    expect(svg).toContain('512');
  });

  it('shows top language', () => {
    const svg = renderAuroraSVG(mockData({ topLanguage: 'Rust' }));
    expect(svg).toContain('Rust');
  });

  it('applies electric theme background', () => {
    const svg = renderAuroraSVG(mockData(), 'electric');
    expect(svg).toContain('#020410');
  });

  it('applies aurora theme background', () => {
    const svg = renderAuroraSVG(mockData(), 'aurora');
    expect(svg).toContain('#020810');
  });

  it('applies midnight theme', () => {
    const svg = renderAuroraSVG(mockData(), 'midnight');
    expect(svg).toContain('#03010f');
  });

  it('applies cyber theme accent', () => {
    const svg = renderAuroraSVG(mockData(), 'cyber');
    expect(svg).toContain('#00ff41');
  });

  it('handles zero-commit user gracefully', () => {
    const bands: WeekBand[] = Array.from({ length: 52 }, (_, i) => ({
      weekIndex: i, totalCommits: 0, normalised: 0,
    }));
    const svg = renderAuroraSVG(mockData({ bands, totalCommits: 0, currentStreak: 0, totalStars: 0 }));
    expect(svg).toContain('<svg');
    expect(svg).toContain('0');
  });

  it('includes CSS keyframe animations for all 4 ribbons', () => {
    const svg = renderAuroraSVG(mockData());
    expect(svg).toContain('@keyframes aurora-drift-0');
    expect(svg).toContain('@keyframes aurora-drift-1');
    expect(svg).toContain('@keyframes aurora-drift-2');
    expect(svg).toContain('@keyframes aurora-drift-3');
  });

  it('star field is present', () => {
    const svg = renderAuroraSVG(mockData());
    const stars = svg.match(/<circle /g) ?? [];
    expect(stars.length).toBeGreaterThan(10);
  });
});
