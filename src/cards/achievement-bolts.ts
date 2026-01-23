import { GitHubStats, Achievement, CardOptions } from '../types';
import { mergeTheme } from '../themes';
import { createSvgWrapper, createText, formatNumber } from '../utils/svg';

const ACHIEVEMENT_DEFINITIONS: Array<{
  id: string;
  name: string;
  description: string;
  icon: string;
  check: (stats: GitHubStats) => { unlocked: boolean; progress: number; max: number };
  tiers: { bronze: number; silver: number; gold: number; platinum: number; diamond: number };
}> = [
  {
    id: 'first_strike',
    name: 'First Strike',
    description: 'Make your first commit',
    icon: 'bolt',
    check: (stats) => ({
      unlocked: stats.totalCommits >= 1,
      progress: Math.min(stats.totalCommits, 1),
      max: 1,
    }),
    tiers: { bronze: 1, silver: 1, gold: 1, platinum: 1, diamond: 1 },
  },
  {
    id: 'commit_storm',
    name: 'Commit Storm',
    description: 'Reach commit milestones',
    icon: 'commit',
    check: (stats) => ({
      unlocked: stats.totalCommits >= 100,
      progress: stats.totalCommits,
      max: 10000,
    }),
    tiers: { bronze: 100, silver: 500, gold: 1000, platinum: 5000, diamond: 10000 },
  },
  {
    id: 'star_power',
    name: 'Star Power',
    description: 'Earn stars on your repositories',
    icon: 'star',
    check: (stats) => ({
      unlocked: stats.totalStars >= 10,
      progress: stats.totalStars,
      max: 1000,
    }),
    tiers: { bronze: 10, silver: 50, gold: 100, platinum: 500, diamond: 1000 },
  },
  {
    id: 'pr_thunder',
    name: 'PR Thunder',
    description: 'Open pull requests',
    icon: 'pr',
    check: (stats) => ({
      unlocked: stats.totalPRs >= 10,
      progress: stats.totalPRs,
      max: 500,
    }),
    tiers: { bronze: 10, silver: 50, gold: 100, platinum: 250, diamond: 500 },
  },
  {
    id: 'merge_master',
    name: 'Merge Master',
    description: 'Get PRs merged',
    icon: 'merge',
    check: (stats) => ({
      unlocked: stats.totalPRsMerged >= 5,
      progress: stats.totalPRsMerged,
      max: 250,
    }),
    tiers: { bronze: 5, silver: 25, gold: 50, platinum: 100, diamond: 250 },
  },
  {
    id: 'issue_resolver',
    name: 'Issue Resolver',
    description: 'Contribute to issue discussions',
    icon: 'issue',
    check: (stats) => ({
      unlocked: stats.totalIssues >= 10,
      progress: stats.totalIssues,
      max: 200,
    }),
    tiers: { bronze: 10, silver: 25, gold: 50, platinum: 100, diamond: 200 },
  },
  {
    id: 'streak_lightning',
    name: 'Streak Lightning',
    description: 'Maintain contribution streaks',
    icon: 'streak',
    check: (stats) => ({
      unlocked: stats.longestStreak >= 7,
      progress: stats.longestStreak,
      max: 365,
    }),
    tiers: { bronze: 7, silver: 30, gold: 60, platinum: 100, diamond: 365 },
  },
  {
    id: 'fork_network',
    name: 'Fork Network',
    description: 'Get your repos forked',
    icon: 'fork',
    check: (stats) => ({
      unlocked: stats.totalForks >= 5,
      progress: stats.totalForks,
      max: 100,
    }),
    tiers: { bronze: 5, silver: 15, gold: 30, platinum: 50, diamond: 100 },
  },
];

const TIER_COLORS: Record<Achievement['tier'], string> = {
  bronze: '#cd7f32',
  silver: '#c0c0c0',
  gold: '#ffd700',
  platinum: '#e5e4e2',
  diamond: '#b9f2ff',
};

export function calculateAchievements(stats: GitHubStats): Achievement[] {
  return ACHIEVEMENT_DEFINITIONS.map((def) => {
    const result = def.check(stats);
    let tier: Achievement['tier'] = 'bronze';

    if (result.unlocked) {
      const tierOrder: Achievement['tier'][] = ['diamond', 'platinum', 'gold', 'silver', 'bronze'];
      for (const t of tierOrder) {
        if (result.progress >= def.tiers[t]) {
          tier = t;
          break;
        }
      }
    }

    return {
      id: def.id,
      name: def.name,
      description: def.description,
      icon: def.icon,
      tier,
      unlocked: result.unlocked,
      progress: result.progress,
      maxProgress: result.max,
    };
  });
}

interface AchievementCardOptions extends CardOptions {
  showLocked?: boolean;
  maxAchievements?: number;
  layout?: 'grid' | 'list';
}

export function generateAchievementCard(
  stats: GitHubStats,
  options: AchievementCardOptions = {}
): string {
  const {
    showLocked = true,
    maxAchievements = 8,
    layout = 'grid',
    theme: themeName = 'electric',
    width = 495,
    height = 250,
    showBorder = true,
    borderRadius = 12,
    animate = true,
  } = options;

  const theme = mergeTheme(themeName, options.customColors);
  const achievements = calculateAchievements(stats);

  const displayAchievements = showLocked
    ? achievements.slice(0, maxAchievements)
    : achievements.filter((a) => a.unlocked).slice(0, maxAchievements);

  const content =
    layout === 'grid'
      ? generateGridLayout(displayAchievements, theme, width, animate)
      : generateListLayout(displayAchievements, theme, width, animate);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  const header = `
    <g class="fade-in">
      ${createBoltIcon(20, 18, 24, theme.accent)}
      ${createText('Achievement Bolts', 50, 35, { color: theme.text, size: 18, weight: 'bold' })}
      ${createText(`${unlockedCount}/${achievements.length} Unlocked`, width - 20, 35, {
        color: theme.textSecondary,
        size: 12,
        anchor: 'end',
      })}
    </g>
  `;

  return createSvgWrapper(header + content, width, height, theme, {
    animate,
    borderRadius,
    showBorder,
    title: `Achievement Bolts - ${unlockedCount}/${achievements.length} Unlocked`,
  });
}

function generateGridLayout(
  achievements: Achievement[],
  theme: { text: string; textSecondary: string; border: string; accent: string },
  width: number,
  animate: boolean
): string {
  const cols = 4;
  const cellWidth = (width - 40) / cols;
  const cellHeight = 80;
  const startY = 60;

  return achievements
    .map((achievement, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = 20 + col * cellWidth + cellWidth / 2;
      const y = startY + row * cellHeight;
      const delayClass = animate ? `delay-${Math.min(i + 1, 5)}` : '';

      const tierColor = achievement.unlocked ? TIER_COLORS[achievement.tier] : theme.border;
      const opacity = achievement.unlocked ? 1 : 0.4;

      return `
        <g class="fade-in ${delayClass}" transform="translate(${x}, ${y})" opacity="${opacity}">
          <!-- Badge circle -->
          <circle cx="0" cy="20" r="25" fill="${tierColor}20" stroke="${tierColor}" stroke-width="2"/>
          ${createAchievementIcon(achievement.icon, -12, 8, 24, tierColor)}

          <!-- Name -->
          ${createText(achievement.name, 0, 55, {
            color: theme.text,
            size: 10,
            weight: 'bold',
            anchor: 'middle',
          })}

          <!-- Tier indicator -->
          ${
            achievement.unlocked
              ? `<text x="0" y="70" fill="${tierColor}" font-size="8" text-anchor="middle" font-weight="bold">${achievement.tier.toUpperCase()}</text>`
              : ''
          }
        </g>
      `;
    })
    .join('');
}

function generateListLayout(
  achievements: Achievement[],
  theme: { text: string; textSecondary: string; border: string; progressBackground: string; accent: string },
  width: number,
  animate: boolean
): string {
  const rowHeight = 45;
  const startY = 55;

  return achievements
    .map((achievement, i) => {
      const y = startY + i * rowHeight;
      const delayClass = animate ? `delay-${Math.min(i + 1, 5)}` : '';

      const tierColor = achievement.unlocked ? TIER_COLORS[achievement.tier] : theme.border;
      const opacity = achievement.unlocked ? 1 : 0.5;
      const progress = achievement.maxProgress
        ? Math.min(100, ((achievement.progress ?? 0) / achievement.maxProgress) * 100)
        : 0;

      return `
        <g class="fade-in ${delayClass}" transform="translate(20, ${y})" opacity="${opacity}">
          <!-- Icon -->
          <circle cx="15" cy="15" r="15" fill="${tierColor}20" stroke="${tierColor}" stroke-width="1.5"/>
          ${createAchievementIcon(achievement.icon, 6, 6, 18, tierColor)}

          <!-- Name & Description -->
          ${createText(achievement.name, 40, 12, { color: theme.text, size: 12, weight: 'bold' })}
          ${createText(achievement.description, 40, 26, { color: theme.textSecondary, size: 10 })}

          <!-- Progress bar -->
          <rect x="${width - 140}" y="8" width="100" height="8" rx="4" fill="${theme.progressBackground}"/>
          <rect x="${width - 140}" y="8" width="${progress}" height="8" rx="4" fill="${tierColor}"/>

          <!-- Progress text -->
          ${createText(
            `${formatNumber(achievement.progress ?? 0)}/${formatNumber(achievement.maxProgress ?? 0)}`,
            width - 140,
            30,
            { color: theme.textSecondary, size: 9 }
          )}
        </g>
      `;
    })
    .join('');
}

function createBoltIcon(x: number, y: number, size: number, color: string): string {
  const scale = size / 24;
  return `
    <g transform="translate(${x}, ${y}) scale(${scale})">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="${color}" stroke="${color}" stroke-width="1"/>
    </g>
  `;
}

function createAchievementIcon(name: string, x: number, y: number, size: number, color: string): string {
  const icons: Record<string, string> = {
    bolt: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
    commit: 'M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0M1.05 12h7M17.01 12h6',
    star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
    pr: 'M18 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM13 6h3a2 2 0 0 1 2 2v7M6 9v12',
    merge: 'M18 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 9v6M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
    issue: 'M12 12m-10 0a10 10 0 1 0 20 0a10 10 0 1 0 -20 0M12 8v4M12 16h.01',
    streak: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
    fork: 'M5 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM19 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM5 5v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V5M12 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM12 17v-4',
  };

  const path = icons[name] || icons.bolt;
  const scale = size / 24;

  return `
    <g transform="translate(${x}, ${y}) scale(${scale})">
      <path d="${path}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
  `;
}
