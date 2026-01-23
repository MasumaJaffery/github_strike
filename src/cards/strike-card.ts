import { GitHubStats, GitHubUser, StrikeRank } from '../types';
import { createSvgWrapper, text, formatNumber } from '../utils/svg';

interface StrikeCardData {
  user: GitHubUser;
  stats: GitHubStats;
}

export function calculateStrikeRank(stats: GitHubStats): StrikeRank {
  const score =
    stats.totalCommits * 1 +
    stats.totalPRs * 3 +
    stats.totalPRsMerged * 5 +
    stats.totalStars * 2 +
    stats.totalIssues * 2 +
    stats.currentStreak * 4;

  let rank: StrikeRank['rank'];
  let percentile: number;

  if (score >= 50000) {
    rank = 'Tempest';
    percentile = 99;
  } else if (score >= 20000) {
    rank = 'Storm';
    percentile = 95;
  } else if (score >= 10000) {
    rank = 'Lightning';
    percentile = 85;
  } else if (score >= 5000) {
    rank = 'Thunder';
    percentile = 70;
  } else if (score >= 1000) {
    rank = 'Bolt';
    percentile = 50;
  } else {
    rank = 'Spark';
    percentile = 25;
  }

  return { rank, score, percentile };
}

// Simple icon paths
const ICONS = {
  star: `<polygon points='12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9' fill='none' stroke='currentColor' stroke-width='1.5'/>`,
  commit: `<circle cx='12' cy='12' r='4' fill='none' stroke='currentColor' stroke-width='1.5'/><line x1='12' y1='1' x2='12' y2='6' stroke='currentColor' stroke-width='1.5'/><line x1='12' y1='18' x2='12' y2='23' stroke='currentColor' stroke-width='1.5'/>`,
  pr: `<circle cx='6' cy='6' r='3' fill='none' stroke='currentColor' stroke-width='1.5'/><circle cx='18' cy='18' r='3' fill='none' stroke='currentColor' stroke-width='1.5'/><path d='M6 9v6c0 3 3 3 6 3h3' fill='none' stroke='currentColor' stroke-width='1.5'/>`,
  issue: `<circle cx='12' cy='12' r='9' fill='none' stroke='currentColor' stroke-width='1.5'/><line x1='12' y1='8' x2='12' y2='12' stroke='currentColor' stroke-width='2'/><circle cx='12' cy='16' r='1' fill='currentColor'/>`,
  streak: `<path d='M13 2L3 14h9l-1 8 10-12h-9l1-8z' fill='none' stroke='currentColor' stroke-width='1.5'/>`,
};

function icon(name: keyof typeof ICONS, x: number, y: number, color: string): string {
  return `<g transform='translate(${x}, ${y}) scale(0.7)' style='color: ${color}'>${ICONS[name]}</g>`;
}

export function generateStrikeCard(data: StrikeCardData): string {
  const width = 495;
  const height = 195;
  const rank = calculateStrikeRank(data.stats);
  const name = data.user.name || data.user.login;

  const content = `
<!-- Title -->
<g transform='translate(25, 35)'>
${text(`${name}'s GitHub Strike`, 0, 0, 18, true, '#24292f')}
</g>

<!-- Rank Badge -->
<g transform='translate(385, 15)'>
<rect x='0' y='0' width='85' height='28' rx='14' fill='#fb8c0015' stroke='#fb8c00' stroke-width='1'/>
<text x='42' y='18' stroke-width='0' text-anchor='middle' fill='#fb8c00' stroke='none' font-family='"Segoe UI", Ubuntu, sans-serif' font-weight='700' font-size='13px'>⚡ ${rank.rank}</text>
</g>

<!-- Divider -->
<line x1='25' y1='50' x2='470' y2='50' stroke='#e1e4e8' stroke-width='1'/>

<!-- Stats Grid - Row 1 -->
<g transform='translate(25, 75)'>
${icon('star', 0, -12, '#f1c40f')}
<text x='22' y='0' stroke-width='0' fill='#57606a' stroke='none' font-family='"Segoe UI", Ubuntu, sans-serif' font-weight='400' font-size='12px'>Stars</text>
<text x='22' y='18' stroke-width='0' fill='#24292f' stroke='none' font-family='"Segoe UI", Ubuntu, sans-serif' font-weight='700' font-size='16px'>${formatNumber(data.stats.totalStars)}</text>
</g>

<g transform='translate(120, 75)'>
${icon('commit', 0, -12, '#3498db')}
<text x='22' y='0' stroke-width='0' fill='#57606a' stroke='none' font-family='"Segoe UI", Ubuntu, sans-serif' font-weight='400' font-size='12px'>Commits</text>
<text x='22' y='18' stroke-width='0' fill='#24292f' stroke='none' font-family='"Segoe UI", Ubuntu, sans-serif' font-weight='700' font-size='16px'>${formatNumber(data.stats.totalCommits)}</text>
</g>

<g transform='translate(235, 75)'>
${icon('pr', 0, -12, '#9b59b6')}
<text x='22' y='0' stroke-width='0' fill='#57606a' stroke='none' font-family='"Segoe UI", Ubuntu, sans-serif' font-weight='400' font-size='12px'>PRs</text>
<text x='22' y='18' stroke-width='0' fill='#24292f' stroke='none' font-family='"Segoe UI", Ubuntu, sans-serif' font-weight='700' font-size='16px'>${formatNumber(data.stats.totalPRs)}</text>
</g>

<g transform='translate(330, 75)'>
${icon('issue', 0, -12, '#2ecc71')}
<text x='22' y='0' stroke-width='0' fill='#57606a' stroke='none' font-family='"Segoe UI", Ubuntu, sans-serif' font-weight='400' font-size='12px'>Issues</text>
<text x='22' y='18' stroke-width='0' fill='#24292f' stroke='none' font-family='"Segoe UI", Ubuntu, sans-serif' font-weight='700' font-size='16px'>${formatNumber(data.stats.totalIssues)}</text>
</g>

<g transform='translate(420, 75)'>
${icon('streak', 0, -12, '#e74c3c')}
<text x='22' y='0' stroke-width='0' fill='#57606a' stroke='none' font-family='"Segoe UI", Ubuntu, sans-serif' font-weight='400' font-size='12px'>Streak</text>
<text x='22' y='18' stroke-width='0' fill='#24292f' stroke='none' font-family='"Segoe UI", Ubuntu, sans-serif' font-weight='700' font-size='16px'>${data.stats.currentStreak}d</text>
</g>

<!-- Bottom Stats -->
<g transform='translate(25, 140)'>
<rect x='0' y='0' width='445' height='35' rx='6' fill='#f6f8fa'/>
<text x='15' y='22' stroke-width='0' fill='#57606a' stroke='none' font-family='"Segoe UI", Ubuntu, sans-serif' font-weight='400' font-size='12px'>Score: <tspan font-weight='700' fill='#24292f'>${formatNumber(rank.score)}</tspan></text>
<text x='430' y='22' stroke-width='0' text-anchor='end' fill='#57606a' stroke='none' font-family='"Segoe UI", Ubuntu, sans-serif' font-weight='400' font-size='12px'>Top <tspan font-weight='700' fill='#24292f'>${100 - rank.percentile}%</tspan></text>
</g>
`;

  return createSvgWrapper(content, width, height);
}

export function generateCompactStrikeCard(data: StrikeCardData): string {
  const width = 400;
  const height = 100;
  const rank = calculateStrikeRank(data.stats);

  const content = `
<g transform='translate(20, 30)'>
${text(data.user.login, 0, 0, 15, true, '#24292f')}
<rect x='290' y='-12' width='70' height='22' rx='11' fill='#fb8c0015' stroke='#fb8c00' stroke-width='1'/>
<text x='325' y='3' stroke-width='0' text-anchor='middle' fill='#fb8c00' stroke='none' font-family='"Segoe UI", Ubuntu, sans-serif' font-weight='600' font-size='11px'>${rank.rank}</text>
</g>
<g transform='translate(20, 60)'>
${icon('star', 0, -8, '#f1c40f')}
<text x='18' y='2' stroke-width='0' fill='#24292f' stroke='none' font-family='"Segoe UI", Ubuntu, sans-serif' font-weight='600' font-size='13px'>${formatNumber(data.stats.totalStars)}</text>
${icon('commit', 70, -8, '#3498db')}
<text x='88' y='2' stroke-width='0' fill='#24292f' stroke='none' font-family='"Segoe UI", Ubuntu, sans-serif' font-weight='600' font-size='13px'>${formatNumber(data.stats.totalCommits)}</text>
${icon('pr', 160, -8, '#9b59b6')}
<text x='178' y='2' stroke-width='0' fill='#24292f' stroke='none' font-family='"Segoe UI", Ubuntu, sans-serif' font-weight='600' font-size='13px'>${formatNumber(data.stats.totalPRs)}</text>
${icon('streak', 240, -8, '#e74c3c')}
<text x='258' y='2' stroke-width='0' fill='#24292f' stroke='none' font-family='"Segoe UI", Ubuntu, sans-serif' font-weight='600' font-size='13px'>${data.stats.currentStreak}d</text>
</g>
`;

  return createSvgWrapper(content, width, height);
}
