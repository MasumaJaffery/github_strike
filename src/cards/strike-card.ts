import { GitHubStats, GitHubUser, StrikeRank } from '../types';
import { createSvgWrapper, text, textCenter, formatNumber } from '../utils/svg';

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

// Colors - simple and minimal
const COLORS = {
  title: '#2f80ed',
  label: '#333',
  value: '#333',
  rank: '#fb8c00',
};

export function generateStrikeCard(data: StrikeCardData): string {
  const width = 495;
  const height = 195;
  const rank = calculateStrikeRank(data.stats);
  const name = data.user.name || data.user.login;

  const content = `
<g transform='translate(25, 35)'>
${text(`${name}'s GitHub Strike`, 0, 0, 18, true, COLORS.title)}
</g>
<g transform='translate(400, 28)'>
${textCenter(rank.rank, 45, 5, 14, true, COLORS.rank)}
</g>
<g transform='translate(25, 65)'>
${text('Total Stars:', 0, 0, 13, false, COLORS.label)}
${text(formatNumber(data.stats.totalStars), 120, 0, 13, true, COLORS.value)}
</g>
<g transform='translate(255, 65)'>
${text('Total Commits:', 0, 0, 13, false, COLORS.label)}
${text(formatNumber(data.stats.totalCommits), 120, 0, 13, true, COLORS.value)}
</g>
<g transform='translate(25, 90)'>
${text('Pull Requests:', 0, 0, 13, false, COLORS.label)}
${text(formatNumber(data.stats.totalPRs), 120, 0, 13, true, COLORS.value)}
</g>
<g transform='translate(255, 90)'>
${text('Issues:', 0, 0, 13, false, COLORS.label)}
${text(formatNumber(data.stats.totalIssues), 120, 0, 13, true, COLORS.value)}
</g>
<g transform='translate(25, 115)'>
${text('Current Streak:', 0, 0, 13, false, COLORS.label)}
${text(formatNumber(data.stats.currentStreak), 120, 0, 13, true, COLORS.value)}
</g>
<g transform='translate(25, 160)'>
${text(`Score: ${formatNumber(rank.score)} · Top ${100 - rank.percentile}%`, 0, 0, 11, false, '#586069')}
</g>
`;

  return createSvgWrapper(content, width, height);
}

export function generateCompactStrikeCard(data: StrikeCardData): string {
  const width = 400;
  const height = 120;
  const rank = calculateStrikeRank(data.stats);

  const content = `
<g transform='translate(25, 35)'>
${text(data.user.login, 0, 0, 16, true, COLORS.title)}
${text(rank.rank, 320, 0, 12, true, COLORS.rank)}
</g>
<g transform='translate(25, 65)'>
${text('Stars: ' + formatNumber(data.stats.totalStars), 0, 0, 12, false, COLORS.label)}
${text('Commits: ' + formatNumber(data.stats.totalCommits), 100, 0, 12, false, COLORS.label)}
${text('PRs: ' + formatNumber(data.stats.totalPRs), 220, 0, 12, false, COLORS.label)}
</g>
<g transform='translate(25, 95)'>
${text(`Score: ${formatNumber(rank.score)}`, 0, 0, 11, false, '#586069')}
</g>
`;

  return createSvgWrapper(content, width, height);
}
