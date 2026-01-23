import { ThemeColors } from '../types';

export function createSvgWrapper(
  content: string,
  width: number,
  height: number,
  theme: ThemeColors,
  options: { animate?: boolean; borderRadius?: number; showBorder?: boolean; title?: string } = {}
): string {
  const { borderRadius = 12, showBorder = true, title = 'GitHub Strike Card' } = options;

  const border = showBorder
    ? `stroke="${theme.border}" stroke-width="1"`
    : '';

  // Match github-readme-stats structure exactly for maximum compatibility
  // Key: leading whitespace, specific attribute order, no comments in output
  return `
    <svg
      width="${width}"
      height="${height}"
      viewBox="0 0 ${width} ${height}"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-labelledby="descId"
    >
      <title id="titleId">${escapeHtml(title)}</title>
      <desc id="descId">${escapeHtml(title)}</desc>
      <style>
        .header { font: 600 18px 'Segoe UI', Ubuntu, Sans-Serif; }
        .stat { font: 600 14px 'Segoe UI', Ubuntu, Sans-Serif; }
        .bold { font-weight: 700; }
      </style>
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${theme.background}"/>
          <stop offset="50%" stop-color="${adjustColor(theme.background, 10)}"/>
          <stop offset="100%" stop-color="${theme.background}"/>
        </linearGradient>
        <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${theme.accent}"/>
          <stop offset="100%" stop-color="${adjustColor(theme.accent, 20)}"/>
        </linearGradient>
      </defs>
      <rect
        data-testid="card-bg"
        x="0.5"
        y="0.5"
        rx="${borderRadius}"
        ry="${borderRadius}"
        height="${height - 1}"
        width="${width - 1}"
        fill="url(#bgGradient)"
        ${border}
      />
      ${content}
    </svg>
  `.trim();
}

export function adjustColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, Math.max(0, (num >> 16) + amt));
  const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amt));
  const B = Math.min(255, Math.max(0, (num & 0x0000ff) + amt));
  return `#${((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1)}`;
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}

export function createProgressBar(
  x: number,
  y: number,
  width: number,
  height: number,
  progress: number,
  theme: ThemeColors,
  className = ''
): string {
  const filledWidth = Math.min(100, Math.max(0, progress)) * (width / 100);

  return `
    <g class="${className}">
      <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${height / 2}" fill="${theme.progressBackground}"/>
      <rect x="${x}" y="${y}" width="${filledWidth}" height="${height}" rx="${height / 2}" fill="url(#accentGradient)"/>
    </g>
  `;
}

export function createIcon(name: string, x: number, y: number, size: number, color: string): string {
  const icons: Record<string, string> = {
    star: `<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>`,
    fork: `<path d="M5 3a2 2 0 00-2 2v.5C3 8 5 10 5 10s2-2 2-4.5V5a2 2 0 00-2-2zm14 0a2 2 0 00-2 2v.5c0 2.5 2 4.5 2 4.5s2-2 2-4.5V5a2 2 0 00-2-2zM5 16v-3s0-2 3-2h8c3 0 3 2 3 2v3m-7 5a2 2 0 100-4 2 2 0 000 4z"/>`,
    commit: `<circle cx="12" cy="12" r="4"/><line x1="1.05" y1="12" x2="7" y2="12"/><line x1="17.01" y1="12" x2="22.96" y2="12"/>`,
    pr: `<circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 012 2v7M6 9v12"/>`,
    issue: `<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>`,
    streak: `<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>`,
    trophy: `<path d="M6 9H4.5a2.5 2.5 0 010-5H6M18 9h1.5a2.5 2.5 0 000-5H18M4 22h16M10 22V10a2 2 0 012-2v0a2 2 0 012 2v12"/>`,
    bolt: `<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="${color}" stroke="${color}" stroke-width="1"/>`,
  };

  const iconPath = icons[name] || icons.star;
  const scale = size / 24;

  return `
    <g transform="translate(${x}, ${y}) scale(${scale})">
      <g fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        ${iconPath}
      </g>
    </g>
  `;
}

export function createText(
  text: string,
  x: number,
  y: number,
  options: {
    color?: string;
    size?: number;
    weight?: string;
    anchor?: string;
    className?: string;
  } = {}
): string {
  const {
    color = '#ffffff',
    size = 14,
    weight = 'normal',
    anchor = 'start',
    className = '',
  } = options;

  return `<text x="${x}" y="${y}" fill="${color}" font-size="${size}" font-weight="${weight}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" text-anchor="${anchor}" class="${className}">${escapeHtml(text)}</text>`;
}

export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
