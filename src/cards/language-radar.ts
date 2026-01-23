import { LanguageStats, CardOptions } from '../types';
import { mergeTheme } from '../themes';
import { createSvgWrapper, createText, escapeHtml } from '../utils/svg';

type LayoutType = 'radar' | 'donut' | 'bars' | 'compact';

interface LanguageCardOptions extends CardOptions {
  layout?: LayoutType;
  maxLanguages?: number;
  showPercentage?: boolean;
}

export function generateLanguageCard(
  languages: LanguageStats,
  options: LanguageCardOptions = {}
): string {
  const {
    layout = 'radar',
    maxLanguages = 8,
    showPercentage = true,
    theme: themeName = 'electric',
    width = 400,
    height = 300,
    showBorder = true,
    borderRadius = 12,
    animate = true,
  } = options;

  const theme = mergeTheme(themeName, options.customColors);

  const sortedLanguages = Object.entries(languages)
    .sort((a, b) => b[1].percentage - a[1].percentage)
    .slice(0, maxLanguages);

  let content: string;

  switch (layout) {
    case 'radar':
      content = generateRadarLayout(sortedLanguages, theme, width, height, animate);
      break;
    case 'donut':
      content = generateDonutLayout(sortedLanguages, theme, width, height, animate, showPercentage);
      break;
    case 'bars':
      content = generateBarsLayout(sortedLanguages, theme, width, height, animate, showPercentage);
      break;
    case 'compact':
      content = generateCompactLayout(sortedLanguages, theme, width, animate, showPercentage);
      break;
    default:
      content = generateRadarLayout(sortedLanguages, theme, width, height, animate);
  }

  const adjustedHeight = layout === 'compact' ? 100 : height;
  const topLanguage = sortedLanguages[0]?.[0] || 'Unknown';

  return createSvgWrapper(content, width, adjustedHeight, theme, {
    animate,
    borderRadius,
    showBorder,
    title: `Top Languages - ${topLanguage} and ${sortedLanguages.length - 1} more`,
  });
}

function generateRadarLayout(
  languages: [string, { percentage: number; color: string }][],
  theme: { text: string; textSecondary: string; accent: string; border: string },
  width: number,
  height: number,
  animate: boolean
): string {
  const centerX = width / 2;
  const centerY = height / 2 + 15;
  const maxRadius = Math.min(width, height) / 2 - 60;
  const angleStep = (2 * Math.PI) / languages.length;

  const radarLevels = [0.25, 0.5, 0.75, 1];
  const gridLines = radarLevels
    .map((level) => {
      const points = languages
        .map((_, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const x = centerX + Math.cos(angle) * maxRadius * level;
          const y = centerY + Math.sin(angle) * maxRadius * level;
          return `${x},${y}`;
        })
        .join(' ');
      return `<polygon points="${points}" fill="none" stroke="${theme.border}" stroke-width="1" opacity="0.3"/>`;
    })
    .join('');

  const axisLines = languages
    .map((_, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const x = centerX + Math.cos(angle) * maxRadius;
      const y = centerY + Math.sin(angle) * maxRadius;
      return `<line x1="${centerX}" y1="${centerY}" x2="${x}" y2="${y}" stroke="${theme.border}" stroke-width="1" opacity="0.3"/>`;
    })
    .join('');

  const dataPoints = languages.map(([_, data], i) => {
    const angle = i * angleStep - Math.PI / 2;
    const radius = (data.percentage / 100) * maxRadius;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    return `${x},${y}`;
  });

  const labels = languages
    .map(([name, data], i) => {
      const angle = i * angleStep - Math.PI / 2;
      const labelRadius = maxRadius + 25;
      const x = centerX + Math.cos(angle) * labelRadius;
      const y = centerY + Math.sin(angle) * labelRadius;
      const anchor = Math.cos(angle) < -0.1 ? 'end' : Math.cos(angle) > 0.1 ? 'start' : 'middle';

      return `
        <g class="${animate ? 'fade-in delay-' + Math.min(i + 1, 5) : ''}">
          <circle cx="${x - (anchor === 'end' ? 8 : anchor === 'start' ? -8 : 0)}" cy="${y - 4}" r="4" fill="${data.color}"/>
          ${createText(name, x, y, { color: theme.text, size: 11, anchor })}
        </g>
      `;
    })
    .join('');

  const animateClass = animate ? '' : '';

  return `
    
    ${createText('Language Proficiency Radar', 20, 30, { color: theme.text, size: 16, weight: 'bold' })}

    
    <g opacity="0.5">${gridLines}${axisLines}</g>

    
    <polygon points="${dataPoints.join(' ')}" fill="${theme.accent}30" stroke="${theme.accent}" stroke-width="2" ${animateClass}/>

    
    ${languages
      .map(([_, data], i) => {
        const angle = i * angleStep - Math.PI / 2;
        const radius = (data.percentage / 100) * maxRadius;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        return `<circle cx="${x}" cy="${y}" r="5" fill="${data.color}" class="${animate ? 'glow' : ''}"/>`;
      })
      .join('')}

    
    ${labels}
  `;
}

function generateDonutLayout(
  languages: [string, { percentage: number; color: string }][],
  theme: { text: string; textSecondary: string; accent: string },
  width: number,
  height: number,
  animate: boolean,
  showPercentage: boolean
): string {
  const centerX = width / 2 - 60;
  const centerY = height / 2 + 10;
  const radius = 80;
  const innerRadius = 50;

  let currentAngle = -Math.PI / 2;
  const segments = languages.map(([_name, data], i) => {
    const angle = (data.percentage / 100) * 2 * Math.PI;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    const x1 = centerX + Math.cos(startAngle) * radius;
    const y1 = centerY + Math.sin(startAngle) * radius;
    const x2 = centerX + Math.cos(endAngle) * radius;
    const y2 = centerY + Math.sin(endAngle) * radius;
    const ix1 = centerX + Math.cos(startAngle) * innerRadius;
    const iy1 = centerY + Math.sin(startAngle) * innerRadius;
    const ix2 = centerX + Math.cos(endAngle) * innerRadius;
    const iy2 = centerY + Math.sin(endAngle) * innerRadius;

    const largeArc = angle > Math.PI ? 1 : 0;

    return `
      <path d="M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix1} ${iy1} Z"
            fill="${data.color}" class="${animate ? 'fade-in delay-' + Math.min(i + 1, 5) : ''}"/>
    `;
  });

  const legend = languages
    .map(([name, data], i) => {
      const y = 50 + i * 25;
      const percentText = showPercentage ? ` (${data.percentage.toFixed(1)}%)` : '';
      return `
        <g class="${animate ? 'fade-in delay-' + Math.min(i + 1, 5) : ''}">
          <rect x="${width - 150}" y="${y - 10}" width="12" height="12" rx="2" fill="${data.color}"/>
          ${createText(escapeHtml(name) + percentText, width - 132, y, { color: theme.text, size: 11 })}
        </g>
      `;
    })
    .join('');

  return `
    ${createText('Languages', 20, 30, { color: theme.text, size: 16, weight: 'bold' })}
    <g>${segments.join('')}</g>
    ${legend}
  `;
}

function generateBarsLayout(
  languages: [string, { percentage: number; color: string }][],
  theme: { text: string; textSecondary: string; progressBackground: string },
  width: number,
  height: number,
  animate: boolean,
  showPercentage: boolean
): string {
  const barHeight = 20;
  const barSpacing = 30;
  const startY = 50;
  const barWidth = width - 140;

  const bars = languages
    .map(([name, data], i) => {
      const y = startY + i * barSpacing;
      const filledWidth = (data.percentage / 100) * barWidth;
      const percentText = showPercentage ? `${data.percentage.toFixed(1)}%` : '';

      return `
        <g class="${animate ? 'fade-in delay-' + Math.min(i + 1, 5) : ''}">
          ${createText(name, 20, y + 14, { color: theme.text, size: 12 })}
          <rect x="100" y="${y}" width="${barWidth}" height="${barHeight}" rx="${barHeight / 2}" fill="${theme.progressBackground}"/>
          <rect x="100" y="${y}" width="${filledWidth}" height="${barHeight}" rx="${barHeight / 2}" fill="${data.color}" class="${animate ? 'strike-path' : ''}"/>
          ${createText(percentText, width - 15, y + 14, { color: theme.textSecondary, size: 11, anchor: 'end' })}
        </g>
      `;
    })
    .join('');

  return `
    ${createText('Top Languages', 20, 30, { color: theme.text, size: 16, weight: 'bold' })}
    ${bars}
  `;
}

function generateCompactLayout(
  languages: [string, { percentage: number; color: string }][],
  theme: { text: string; textSecondary: string; progressBackground: string },
  width: number,
  animate: boolean,
  showPercentage: boolean
): string {
  const barY = 50;
  const barHeight = 12;
  const barWidth = width - 40;

  let currentX = 20;
  const segments = languages.map(([_name, data], i) => {
    const segmentWidth = (data.percentage / 100) * barWidth;
    const segment = `<rect x="${currentX}" y="${barY}" width="${segmentWidth}" height="${barHeight}" fill="${data.color}" class="${animate ? 'fade-in delay-' + Math.min(i + 1, 5) : ''}"/>`;
    currentX += segmentWidth;
    return segment;
  });

  const legend = languages
    .map(([name, data], i) => {
      const x = 20 + (i % 4) * ((width - 40) / 4);
      const y = 80 + Math.floor(i / 4) * 18;
      const percentText = showPercentage ? ` ${data.percentage.toFixed(0)}%` : '';

      return `
        <g class="${animate ? 'fade-in delay-' + Math.min(i + 1, 5) : ''}">
          <circle cx="${x}" cy="${y - 4}" r="4" fill="${data.color}"/>
          ${createText(escapeHtml(name) + percentText, x + 10, y, { color: theme.textSecondary, size: 10 })}
        </g>
      `;
    })
    .join('');

  return `
    ${createText('Languages', 20, 30, { color: theme.text, size: 14, weight: 'bold' })}
    <rect x="20" y="${barY}" width="${barWidth}" height="${barHeight}" rx="${barHeight / 2}" fill="${theme.progressBackground}"/>
    ${segments.join('')}
    ${legend}
  `;
}
