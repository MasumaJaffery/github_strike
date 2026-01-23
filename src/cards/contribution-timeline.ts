import { ContributionCalendar, CardOptions } from '../types';
import { mergeTheme } from '../themes';
import { createSvgWrapper, createText } from '../utils/svg';

interface TimelineCardOptions extends CardOptions {
  showMonthLabels?: boolean;
  showDayLabels?: boolean;
  cellSize?: number;
  cellGap?: number;
}

export function generateContributionTimeline(
  calendar: ContributionCalendar,
  options: TimelineCardOptions = {}
): string {
  const {
    showMonthLabels = true,
    showDayLabels = true,
    cellSize = 11,
    cellGap = 3,
    theme: themeName = 'electric',
    width = 800,
    height = 180,
    showBorder = true,
    borderRadius = 12,
    animate = true,
  } = options;

  const theme = mergeTheme(themeName, options.customColors);

  const levelColors = [
    theme.progressBackground,
    `${theme.accent}40`,
    `${theme.accent}70`,
    `${theme.accent}a0`,
    theme.accent,
  ];

  const weeks = calendar.weeks.slice(-52);
  const startX = showDayLabels ? 45 : 20;
  const startY = showMonthLabels ? 45 : 25;

  const cells = weeks
    .map((week, weekIndex) => {
      return week.days
        .map((day, dayIndex) => {
          const x = startX + weekIndex * (cellSize + cellGap);
          const y = startY + dayIndex * (cellSize + cellGap);
          const color = levelColors[day.level];
          const delayMs = animate ? weekIndex * 10 : 0;

          return `
            <rect
              x="${x}"
              y="${y}"
              width="${cellSize}"
              height="${cellSize}"
              rx="2"
              fill="${color}"
              style="${animate ? `animation: fadeIn 0.3s ease-out ${delayMs}ms forwards; opacity: 0;` : ''}"
            >
              <title>${day.date}: ${day.count} contribution${day.count !== 1 ? 's' : ''}</title>
            </rect>
          `;
        })
        .join('');
    })
    .join('');

  const dayLabels = showDayLabels
    ? ['Mon', 'Wed', 'Fri']
        .map((day, i) => {
          const y = startY + (i * 2 + 1) * (cellSize + cellGap) + cellSize / 2 + 4;
          return createText(day, 15, y, { color: theme.textSecondary, size: 9 });
        })
        .join('')
    : '';

  const monthLabels = showMonthLabels ? generateMonthLabels(weeks, startX, cellSize, cellGap, theme) : '';

  const legendX = width - 160;
  const legendY = height - 25;
  const legend = `
    <g transform="translate(${legendX}, ${legendY})">
      ${createText('Less', 0, 10, { color: theme.textSecondary, size: 9 })}
      ${levelColors
        .map(
          (color, i) =>
            `<rect x="${30 + i * 15}" y="0" width="${cellSize}" height="${cellSize}" rx="2" fill="${color}"/>`
        )
        .join('')}
      ${createText('More', 110, 10, { color: theme.textSecondary, size: 9 })}
    </g>
  `;

  const header = `
    <g class="fade-in">
      ${createText('Contribution Timeline', 20, 25, { color: theme.text, size: 16, weight: 'bold' })}
      ${createText(`${calendar.totalContributions.toLocaleString()} contributions in the last year`, width - 20, 25, {
        color: theme.textSecondary,
        size: 11,
        anchor: 'end',
      })}
    </g>
  `;

  const content = `
    ${header}
    ${dayLabels}
    ${monthLabels}
    <g>${cells}</g>
    ${legend}
  `;

  return createSvgWrapper(content, width, height, theme, {
    animate,
    borderRadius,
    showBorder,
    title: `Contribution Timeline - ${calendar.totalContributions.toLocaleString()} contributions`,
  });
}

function generateMonthLabels(
  weeks: { days: { date: string }[] }[],
  startX: number,
  cellSize: number,
  cellGap: number,
  theme: { textSecondary: string }
): string {
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const labels: { month: string; x: number }[] = [];
  let lastMonth = -1;

  weeks.forEach((week, weekIndex) => {
    if (week.days.length > 0) {
      const date = new Date(week.days[0].date);
      const month = date.getMonth();

      if (month !== lastMonth) {
        labels.push({
          month: months[month],
          x: startX + weekIndex * (cellSize + cellGap),
        });
        lastMonth = month;
      }
    }
  });

  return labels
    .map((label) => createText(label.month, label.x, 35, { color: theme.textSecondary, size: 9 }))
    .join('');
}

export function generateStreakCard(
  calendar: ContributionCalendar,
  currentStreak: number,
  longestStreak: number,
  options: CardOptions = {}
): string {
  const {
    theme: themeName = 'electric',
    width = 400,
    height = 150,
    showBorder = true,
    borderRadius = 12,
    animate = true,
  } = options;

  const theme = mergeTheme(themeName, options.customColors);

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const content = `
    <!-- Header -->
    <g class="fade-in">
      ${createStreakIcon(20, 15, 28, theme.accent)}
      ${createText('Contribution Streak', 55, 35, { color: theme.text, size: 16, weight: 'bold' })}
    </g>

    <!-- Current Streak -->
    <g class="fade-in delay-1" transform="translate(30, 60)">
      <text fill="${theme.accent}" font-size="48" font-weight="bold" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" class="${animate ? 'glow' : ''}">${currentStreak}</text>
      ${createText('days', 85, 30, { color: theme.textSecondary, size: 14 })}
      ${createText('Current Streak', 0, 55, { color: theme.textSecondary, size: 11 })}
    </g>

    <!-- Longest Streak -->
    <g class="fade-in delay-2" transform="translate(180, 60)">
      <text fill="${theme.icon}" font-size="32" font-weight="bold" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif">${longestStreak}</text>
      ${createText('days', 55, 22, { color: theme.textSecondary, size: 12 })}
      ${createText('Longest Streak', 0, 45, { color: theme.textSecondary, size: 11 })}
    </g>

    <!-- Total Contributions -->
    <g class="fade-in delay-3" transform="translate(300, 60)">
      <text fill="${theme.text}" font-size="28" font-weight="bold" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif">${formatContributions(calendar.totalContributions)}</text>
      ${createText('This Year', 0, 45, { color: theme.textSecondary, size: 11 })}
    </g>

    <!-- Date -->
    ${createText(dateStr, width - 20, height - 15, { color: theme.textSecondary, size: 10, anchor: 'end' })}
  `;

  return createSvgWrapper(content, width, height, theme, {
    animate,
    borderRadius,
    showBorder,
    title: `Contribution Streak - ${currentStreak} day${currentStreak !== 1 ? 's' : ''} current, ${longestStreak} day${longestStreak !== 1 ? 's' : ''} longest`,
  });
}

function createStreakIcon(x: number, y: number, size: number, color: string): string {
  const scale = size / 24;
  return `
    <g transform="translate(${x}, ${y}) scale(${scale})">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="${color}" stroke="${color}" stroke-width="0.5"/>
    </g>
  `;
}

function formatContributions(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}
