import { GitHubStats, GitHubUser, CardOptions, StrikeRank, ThemeColors } from '../types';
import { mergeTheme } from '../themes';
import { createSvgWrapper, createIcon, createText, formatNumber, createProgressBar } from '../utils/svg';

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

export function generateStrikeCard(data: StrikeCardData, options: CardOptions = {}): string {
  const {
    theme: themeName = 'electric',
    width = 495,
    height = 195,
    showBorder = true,
    borderRadius = 12,
    animate = true,
    hideStats = [],
  } = options;

  const theme = mergeTheme(themeName, options.customColors);
  const rank = calculateStrikeRank(data.stats);

  const statItems = [
    { icon: 'star', label: 'Total Stars', value: data.stats.totalStars, key: 'stars' },
    { icon: 'commit', label: 'Total Commits', value: data.stats.totalCommits, key: 'commits' },
    { icon: 'pr', label: 'Pull Requests', value: data.stats.totalPRs, key: 'prs' },
    { icon: 'issue', label: 'Issues', value: data.stats.totalIssues, key: 'issues' },
    { icon: 'streak', label: 'Current Streak', value: data.stats.currentStreak, key: 'streak' },
  ].filter((item) => !hideStats.includes(item.key));

  const content = `
    <!-- Title with lightning bolt -->
    <g class="fade-in">
      ${createIcon('bolt', 25, 22, 24, theme.accent)}
      ${createText(`${data.user.name || data.user.login}'s GitHub Strike`, 55, 40, {
        color: theme.text,
        size: 18,
        weight: 'bold',
      })}
    </g>

    <!-- Strike Rank Badge -->
    <g class="fade-in delay-1" transform="translate(${width - 110}, 20)">
      <rect x="0" y="0" width="90" height="35" rx="17.5" fill="${theme.accent}20" stroke="${theme.accent}" stroke-width="1"/>
      ${createIcon('bolt', 8, 6, 22, theme.accent)}
      ${createText(rank.rank, 35, 24, {
        color: theme.accent,
        size: 13,
        weight: 'bold',
      })}
    </g>

    <!-- Stats Grid -->
    ${generateStatsGrid(statItems, theme, animate)}

    <!-- Progress to next rank -->
    <g class="fade-in delay-5" transform="translate(25, ${height - 35})">
      ${createText(`Score: ${formatNumber(rank.score)}`, 0, 12, {
        color: theme.textSecondary,
        size: 11,
      })}
      ${createProgressBar(80, 0, width - 130, 14, rank.percentile, theme)}
      ${createText(`Top ${100 - rank.percentile}%`, width - 115, 12, {
        color: theme.textSecondary,
        size: 11,
        anchor: 'end',
      })}
    </g>
  `;

  return createSvgWrapper(content, width, height, theme, {
    animate,
    borderRadius,
    showBorder,
    title: `${data.user.name || data.user.login}'s GitHub Strike - ${rank.rank} Rank`,
  });
}

function generateStatsGrid(
  stats: Array<{ icon: string; label: string; value: number }>,
  theme: ThemeColors,
  animate: boolean
): string {
  const startY = 70;
  const colWidth = 230;
  const rowHeight = 30;

  return stats
    .map((stat, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = 25 + col * colWidth;
      const y = startY + row * rowHeight;
      const delayClass = animate ? `delay-${Math.min(index + 1, 5)}` : '';

      return `
        <g class="fade-in ${delayClass}" transform="translate(${x}, ${y})">
          ${createIcon(stat.icon, 0, -12, 18, theme.icon)}
          ${createText(stat.label + ':', 24, 0, {
            color: theme.textSecondary,
            size: 13,
          })}
          ${createText(formatNumber(stat.value), 140, 0, {
            color: theme.text,
            size: 14,
            weight: 'bold',
          })}
        </g>
      `;
    })
    .join('');
}

export function generateCompactStrikeCard(data: StrikeCardData, options: CardOptions = {}): string {
  const {
    theme: themeName = 'electric',
    width = 400,
    height = 120,
    showBorder = true,
    borderRadius = 10,
    animate = true,
  } = options;

  const theme = mergeTheme(themeName, options.customColors);
  const rank = calculateStrikeRank(data.stats);

  const content = `
    <!-- Header -->
    <g class="fade-in">
      ${createIcon('bolt', 15, 15, 20, theme.accent)}
      ${createText(data.user.login, 40, 30, {
        color: theme.text,
        size: 16,
        weight: 'bold',
      })}
      <rect x="${width - 80}" y="12" width="65" height="26" rx="13" fill="${theme.accent}20" stroke="${theme.accent}" stroke-width="1"/>
      ${createText(rank.rank, width - 47, 30, {
        color: theme.accent,
        size: 11,
        weight: 'bold',
        anchor: 'middle',
      })}
    </g>

    <!-- Compact Stats Row -->
    <g class="fade-in delay-1" transform="translate(15, 55)">
      ${createCompactStat(0, 'star', data.stats.totalStars, theme)}
      ${createCompactStat(90, 'commit', data.stats.totalCommits, theme)}
      ${createCompactStat(180, 'pr', data.stats.totalPRs, theme)}
      ${createCompactStat(270, 'streak', data.stats.currentStreak, theme)}
    </g>

    <!-- Mini progress -->
    <g class="fade-in delay-2" transform="translate(15, 90)">
      ${createProgressBar(0, 0, width - 30, 8, rank.percentile, theme)}
    </g>
  `;

  return createSvgWrapper(content, width, height, theme, {
    animate,
    borderRadius,
    showBorder,
    title: `${data.user.login}'s GitHub Strike - ${rank.rank} Rank (Compact)`,
  });
}

function createCompactStat(x: number, icon: string, value: number, theme: ThemeColors): string {
  return `
    <g transform="translate(${x}, 0)">
      ${createIcon(icon, 0, -10, 16, theme.icon)}
      ${createText(formatNumber(value), 22, 2, {
        color: theme.text,
        size: 13,
        weight: 'bold',
      })}
    </g>
  `;
}
