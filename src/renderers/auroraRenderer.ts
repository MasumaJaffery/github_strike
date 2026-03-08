import { AuroraData, WeekBand } from '../fetchers/auroraFetcher';
import { getTheme } from '../themes';

const W = 1000;
const H = 240;

// Aurora colour palettes per theme — 4 ribbon colours
const AURORA_PALETTES: Record<string, string[][]> = {
  electric:  [['#7c3aed','#4f46e5','#2563eb'],['#059669','#0d9488','#06b6d4'],['#4af0ff','#a78bfa','#ec4899'],['#f59e0b','#ef4444','#a78bfa']],
  midnight:  [['#6d28d9','#4c1d95','#312e81'],['#065f46','#064e3b','#0d9488'],['#cba6f7','#818cf8','#c026d3'],['#92400e','#991b1b','#6d28d9']],
  aurora:    [['#0e7490','#0369a1','#1d4ed8'],['#065f46','#166534','#15803d'],['#64ffda','#00bcd4','#7c3aed'],['#b45309','#b91c1c','#0e7490']],
  ember:     [['#9a3412','#991b1b','#7c2d12'],['#78350f','#92400e','#b45309'],['#ff6b35','#ff8c00','#ffe04a'],['#dc2626','#ea580c','#d97706']],
  neon:      [['#86198f','#701a75','#4a044e'],['#065f46','#064e3b','#022c22'],['#f0abfc','#e879f9','#c026d3'],['#4f46e5','#4338ca','#3730a3']],
  cyber:     [['#14532d','#166534','#15803d'],['#064e3b','#065f46','#0e7490'],['#00ff41','#39d353','#4af0ff'],['#1a2e05','#14532d','#052e16']],
};

function getPalette(themeName: string): string[][] {
  return AURORA_PALETTES[themeName] ?? AURORA_PALETTES['electric'];
}

/**
 * Build one aurora ribbon as an SVG <path> element.
 * The ribbon is a wavy band whose vertical position and amplitude
 * are driven by the week's contribution data.
 */
function buildRibbonPath(
  bands: WeekBand[],
  baseY: number,
  ampScale: number,
  waveOffset: number,
  phase: number
): string {
  const step = W / (bands.length - 1);
  const topPoints: [number, number][] = [];
  const botPoints: [number, number][] = [];

  for (let i = 0; i < bands.length; i++) {
    const x = i * step;
    const wave = Math.sin((i / bands.length) * Math.PI * 2 + phase) * waveOffset;
    const intensity = bands[i].normalised;
    const yTop = baseY - intensity * ampScale + wave;
    const yBot = baseY + 18 + intensity * (ampScale * 0.4) + wave;
    topPoints.push([x, yTop]);
    botPoints.push([x, yBot]);
  }

  // Build smooth cubic bezier path
  let d = `M ${topPoints[0][0]},${topPoints[0][1]} `;
  for (let i = 1; i < topPoints.length; i++) {
    const [px, py] = topPoints[i - 1];
    const [cx, cy] = topPoints[i];
    const cpx = (px + cx) / 2;
    d += `C ${cpx},${py} ${cpx},${cy} ${cx},${cy} `;
  }
  // Bottom edge (reversed)
  d += `L ${botPoints[botPoints.length - 1][0]},${botPoints[botPoints.length - 1][1]} `;
  for (let i = botPoints.length - 2; i >= 0; i--) {
    const [px, py] = botPoints[i + 1];
    const [cx, cy] = botPoints[i];
    const cpx = (px + cx) / 2;
    d += `C ${cpx},${py} ${cpx},${cy} ${cx},${cy} `;
  }
  d += 'Z';
  return d;
}

function starField(count: number): string {
  const rng = (seed: number) => ((Math.sin(seed) * 43758.5453) % 1 + 1) % 1;
  let stars = '';
  for (let i = 0; i < count; i++) {
    const x = rng(i * 3.1) * W;
    const y = rng(i * 7.3) * (H * 0.6);
    const r = rng(i * 13.7) * 1.2 + 0.4;
    const op = (rng(i * 5.9) * 0.5 + 0.2).toFixed(2);
    const dur = (rng(i * 11.1) * 3 + 2).toFixed(1);
    const begin = (rng(i * 17.3) * 3).toFixed(1);
    stars += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="white" opacity="${op}">
      <animate attributeName="opacity" values="${op};${(+op * 0.2).toFixed(2)};${op}" dur="${dur}s" repeatCount="indefinite" begin="${begin}s"/>
    </circle>\n`;
  }
  return stars;
}

function rankColor(rank: string): string {
  const map: Record<string, string> = {
    TEMPEST: '#f472b6', STORM: '#a78bfa', LIGHTNING: '#4af0ff',
    THUNDER: '#ffe04a', BOLT: '#ff8c00', SPARK: '#39d353',
  };
  return map[rank] ?? '#4af0ff';
}

export function renderAuroraSVG(data: AuroraData, themeName = 'electric'): string {
  const theme = getTheme(themeName);
  const palette = getPalette(themeName);
  const { bands, username, totalCommits, currentStreak, totalStars, topLanguage, rank } = data;

  const rc = rankColor(rank);

  // 4 aurora ribbons at different heights + wave params
  const ribbonConfigs = [
    { baseY: 58,  amp: 40, waveOff: 12, phase: 0,    colors: palette[0], dur: '7s',  delay: '0s',   opacity: '0.72' },
    { baseY: 95,  amp: 45, waveOff: 15, phase: 1.05, colors: palette[1], dur: '9s',  delay: '1s',   opacity: '0.78' },
    { baseY: 128, amp: 38, waveOff: 10, phase: 2.1,  colors: palette[2], dur: '11s', delay: '2.2s', opacity: '0.68' },
    { baseY: 158, amp: 32, waveOff: 8,  phase: 3.14, colors: palette[3], dur: '13s', delay: '3.5s', opacity: '0.58' },
  ];

  let defs = `
  <defs>
    <linearGradient id="sky-grad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${theme.bgFrom}"/>
      <stop offset="100%" stop-color="${theme.bgTo}"/>
    </linearGradient>`;

  let ribbons = '';

  ribbonConfigs.forEach((cfg, ri) => {
    const [c1, c2, c3] = cfg.colors;
    const gradId = `aurora-grad-${ri}`;
    const glowId = `aurora-glow-${ri}`;
    const pathD  = buildRibbonPath(bands, cfg.baseY, cfg.amp, cfg.waveOff, cfg.phase);

    defs += `
    <linearGradient id="${gradId}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"   stop-color="${c1}" stop-opacity="0"/>
      <stop offset="25%"  stop-color="${c1}" stop-opacity="0.85"/>
      <stop offset="55%"  stop-color="${c2}" stop-opacity="0.95"/>
      <stop offset="80%"  stop-color="${c3}" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="${c3}" stop-opacity="0"/>
    </linearGradient>
    <filter id="${glowId}">
      <feGaussianBlur stdDeviation="5" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>`;

    // Glow shadow layer
    ribbons += `<path d="${pathD}" fill="url(#${gradId})" opacity="0.35" filter="url(#${glowId})"
      style="animation: aurora-drift-${ri} ${cfg.dur} ease-in-out infinite ${cfg.delay}"/>`;
    // Main ribbon
    ribbons += `<path d="${pathD}" fill="url(#${gradId})" opacity="${cfg.opacity}"
      style="animation: aurora-drift-${ri} ${cfg.dur} ease-in-out infinite ${cfg.delay}"/>`;
  });

  defs += `
    <filter id="stat-blur">
      <feGaussianBlur stdDeviation="12"/>
    </filter>
  </defs>`;

  // CSS keyframes for each ribbon drift
  const cssAnimations = ribbonConfigs.map((cfg, ri) => {
    const tx1 = (ri % 2 === 0 ? 1 : -1) * (12 + ri * 4);
    const sy1 = 0.95 + ri * 0.02;
    return `
    @keyframes aurora-drift-${ri} {
      0%,100% { transform: translateX(0px) scaleY(1); }
      33%     { transform: translateX(${tx1}px) scaleY(${sy1}); }
      66%     { transform: translateX(${-tx1 * 0.6}px) scaleY(${2 - sy1}); }
    }`;
  }).join('\n');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg"
  width="${W}" height="${H}"
  viewBox="0 0 ${W} ${H}"
  role="img"
  aria-label="Aurora Commit Sky for ${username}">

  ${defs}

  <style>
    text { font-family: 'Segoe UI', Ubuntu, 'DejaVu Sans', sans-serif; }
    ${cssAnimations}
  </style>

  <!-- Night sky background -->
  <rect width="${W}" height="${H}" rx="14" fill="url(#sky-grad)"/>

  <!-- Stars -->
  ${starField(55)}

  <!-- Aurora ribbons -->
  ${ribbons}

  <!-- Horizon glow -->
  <rect x="0" y="${H - 30}" width="${W}" height="30" rx="0"
    fill="url(#sky-grad)" opacity="0.9"/>
  <rect x="0" y="${H - 18}" width="${W}" height="18"
    fill="${theme.bgTo}" rx="0"/>
  <ellipse cx="${W / 2}" cy="${H}" rx="${W * 0.6}" ry="20"
    fill="${theme.accent}" opacity="0.04"/>

  <!-- Card border -->
  <rect width="${W}" height="${H}" rx="14" fill="none"
    stroke="${theme.border}" stroke-width="1"/>

  <!-- Top-left: title block -->
  <rect x="18" y="14" width="260" height="52" rx="10"
    fill="rgba(0,0,0,0.5)" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
  <text x="32" y="34" font-size="14" font-weight="700" fill="${theme.text}">⚡ Aurora Commit Sky</text>
  <text x="32" y="50" font-size="10" fill="${theme.textMuted}">@${username}</text>
  <text x="32" y="62" font-size="9" fill="${theme.textMuted}">${bands.length} weeks · contribution aurora</text>

  <!-- Top-right: stats block -->
  <rect x="${W - 230}" y="14" width="212" height="72" rx="10"
    fill="rgba(0,0,0,0.5)" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>

  <text x="${W - 218}" y="34" font-size="9" fill="${theme.textMuted}">TOTAL COMMITS</text>
  <text x="${W - 218}" y="50" font-size="22" font-weight="700" fill="${theme.accent}">${totalCommits.toLocaleString()}</text>

  <text x="${W - 110}" y="34" font-size="9" fill="${theme.textMuted}">STREAK</text>
  <text x="${W - 110}" y="50" font-size="22" font-weight="700" fill="${rankColor('LIGHTNING')}">${currentStreak}d</text>

  <text x="${W - 218}" y="68" font-size="9" fill="${theme.textMuted}">★ ${totalStars.toLocaleString()} stars  ·  ${topLanguage}</text>

  <!-- Rank badge -->
  <rect x="${W - 90}" y="${H - 36}" width="72" height="24" rx="8"
    fill="rgba(0,0,0,0.55)" stroke="${rc}" stroke-width="1"/>
  <text x="${W - 54}" y="${H - 20}" text-anchor="middle" font-size="10"
    font-weight="700" fill="${rc}">⚡ ${rank}</text>

</svg>`.trim();

  return svg;
}
