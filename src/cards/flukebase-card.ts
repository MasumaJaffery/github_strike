import { FlukebaseProject, FlukebaseStats, CardOptions } from '../types';
import { CollaborationAgreement, FlukebaseProfile } from '../services/flukebase';
import { mergeTheme } from '../themes';
import { createSvgWrapper, createText, formatNumber, createProgressBar } from '../utils/svg';

interface FlukebaseCardOptions extends CardOptions {
  showProjects?: boolean;
  showCollaborations?: boolean;
  maxProjects?: number;
}

const STAGE_COLORS: Record<string, string> = {
  idea: '#9ca3af',
  prototype: '#60a5fa',
  development: '#fbbf24',
  launched: '#34d399',
  archived: '#6b7280',
};

const ROLE_COLORS: Record<string, string> = {
  owner: '#f59e0b',
  collaborator: '#3b82f6',
  contributor: '#10b981',
};

export function generateFlukebaseCard(
  profile: FlukebaseProfile,
  options: FlukebaseCardOptions = {}
): string {
  const {
    theme: themeName = 'electric',
    width = 495,
    height = 280,
    showBorder = true,
    borderRadius = 12,
    animate = true,
    showProjects = true,
    showCollaborations = true,
    maxProjects = 3,
  } = options;

  const theme = mergeTheme(themeName, options.customColors);
  const { stats, projects, collaborations } = profile;

  const displayProjects = projects.slice(0, maxProjects);
  const activeCollabs = collaborations.filter((c) => c.status === 'active');

  const content = `
    <!-- Header with Flukebase branding -->
    <g class="fade-in">
      ${createFlukebaseLogo(20, 15, 28, theme.accent)}
      ${createText(`${profile.user.username} on Flukebase`, 55, 35, {
        color: theme.text,
        size: 18,
        weight: 'bold',
      })}
      ${createText('flukebase.me', width - 20, 35, {
        color: theme.textSecondary,
        size: 11,
        anchor: 'end',
      })}
    </g>

    <!-- Stats Row -->
    <g class="fade-in delay-1" transform="translate(25, 55)">
      ${generateStatBox(0, 'Projects', stats.totalProjects, theme)}
      ${generateStatBox(120, 'Collaborations', stats.activeCollaborations, theme)}
      ${generateStatBox(260, 'Agreements', stats.completedAgreements, theme)}
    </g>

    <!-- Projects Section -->
    ${showProjects ? generateProjectsSection(displayProjects, theme, animate, 25, 110, width - 50) : ''}

    <!-- Collaboration Badges -->
    ${showCollaborations ? generateCollaborationBadges(activeCollabs, theme, animate, 25, height - 40, width - 50) : ''}
  `;

  return createSvgWrapper(content, width, height, theme, {
    animate,
    borderRadius,
    showBorder,
  });
}

function generateStatBox(x: number, label: string, value: number, theme: { text: string; textSecondary: string; accent: string; border: string }): string {
  return `
    <g transform="translate(${x}, 0)">
      <rect x="0" y="0" width="100" height="40" rx="8" fill="${theme.accent}10" stroke="${theme.border}" stroke-width="1"/>
      ${createText(formatNumber(value), 50, 18, { color: theme.accent, size: 16, weight: 'bold', anchor: 'middle' })}
      ${createText(label, 50, 32, { color: theme.textSecondary, size: 10, anchor: 'middle' })}
    </g>
  `;
}

function generateProjectsSection(
  projects: FlukebaseProject[],
  theme: { text: string; textSecondary: string; border: string; progressBackground: string },
  animate: boolean,
  x: number,
  y: number,
  width: number
): string {
  const projectRows = projects
    .map((project, i) => {
      const rowY = y + i * 35;
      const stageColor = STAGE_COLORS[project.stage] || STAGE_COLORS.idea;
      const delayClass = animate ? `delay-${Math.min(i + 2, 5)}` : '';

      return `
        <g class="fade-in ${delayClass}" transform="translate(${x}, ${rowY})">
          <!-- Stage indicator -->
          <circle cx="8" cy="12" r="5" fill="${stageColor}"/>

          <!-- Project name -->
          ${createText(project.name, 20, 16, { color: theme.text, size: 12, weight: 'bold' })}

          <!-- Stage label -->
          <rect x="${width - 150}" y="2" width="60" height="18" rx="9" fill="${stageColor}20"/>
          ${createText(project.stage, width - 120, 15, { color: stageColor, size: 9, anchor: 'middle' })}

          <!-- Collaborators count -->
          ${createCollaboratorIcon(width - 75, 4, 14, theme.textSecondary)}
          ${createText(project.collaborators.toString(), width - 58, 15, { color: theme.textSecondary, size: 10 })}

          <!-- Agreements count -->
          ${createAgreementIcon(width - 40, 4, 14, theme.textSecondary)}
          ${createText(project.agreements.toString(), width - 23, 15, { color: theme.textSecondary, size: 10 })}
        </g>
      `;
    })
    .join('');

  return `
    <g>
      ${createText('Recent Projects', x, y - 8, { color: theme.textSecondary, size: 10 })}
      ${projectRows}
    </g>
  `;
}

function generateCollaborationBadges(
  collaborations: CollaborationAgreement[],
  theme: { text: string; textSecondary: string; accent: string },
  animate: boolean,
  x: number,
  y: number,
  _maxWidth: number
): string {
  if (collaborations.length === 0) return '';

  const badges = collaborations
    .slice(0, 4)
    .map((collab, i) => {
      const badgeX = x + i * 110;
      const roleColor = ROLE_COLORS[collab.role] || ROLE_COLORS.contributor;
      const delayClass = animate ? `delay-${Math.min(i + 3, 5)}` : '';

      return `
        <g class="fade-in ${delayClass}" transform="translate(${badgeX}, ${y})">
          <rect x="0" y="0" width="100" height="24" rx="12" fill="${roleColor}20" stroke="${roleColor}" stroke-width="1"/>
          ${createRoleIcon(8, 4, 14, roleColor)}
          ${createText(collab.role, 55, 16, { color: roleColor, size: 9, anchor: 'middle' })}
        </g>
      `;
    })
    .join('');

  return `
    <g>
      ${createText('Active Roles', x, y - 8, { color: theme.textSecondary, size: 10 })}
      ${badges}
    </g>
  `;
}

function createFlukebaseLogo(x: number, y: number, size: number, color: string): string {
  const scale = size / 24;
  return `
    <g transform="translate(${x}, ${y}) scale(${scale})">
      <circle cx="12" cy="12" r="10" fill="none" stroke="${color}" stroke-width="2"/>
      <path d="M8 12h8M12 8v8" stroke="${color}" stroke-width="2" stroke-linecap="round"/>
      <circle cx="12" cy="12" r="3" fill="${color}"/>
    </g>
  `;
}

function createCollaboratorIcon(x: number, y: number, size: number, color: string): string {
  const scale = size / 24;
  return `
    <g transform="translate(${x}, ${y}) scale(${scale})">
      <circle cx="9" cy="7" r="4" fill="none" stroke="${color}" stroke-width="2"/>
      <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" fill="none" stroke="${color}" stroke-width="2"/>
      <circle cx="17" cy="7" r="3" fill="none" stroke="${color}" stroke-width="1.5"/>
      <path d="M21 21v-2a3 3 0 0 0-2-2.8" fill="none" stroke="${color}" stroke-width="1.5"/>
    </g>
  `;
}

function createAgreementIcon(x: number, y: number, size: number, color: string): string {
  const scale = size / 24;
  return `
    <g transform="translate(${x}, ${y}) scale(${scale})">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="none" stroke="${color}" stroke-width="2"/>
      <polyline points="14 2 14 8 20 8" fill="none" stroke="${color}" stroke-width="2"/>
      <line x1="9" y1="13" x2="15" y2="13" stroke="${color}" stroke-width="2"/>
      <line x1="9" y1="17" x2="13" y2="17" stroke="${color}" stroke-width="2"/>
    </g>
  `;
}

function createRoleIcon(x: number, y: number, size: number, color: string): string {
  const scale = size / 24;
  return `
    <g transform="translate(${x}, ${y}) scale(${scale})">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2z" fill="${color}" stroke="${color}" stroke-width="1"/>
    </g>
  `;
}

export function generateFlukebaseStatsCard(
  stats: FlukebaseStats,
  options: CardOptions = {}
): string {
  const {
    theme: themeName = 'electric',
    width = 300,
    height = 150,
    showBorder = true,
    borderRadius = 12,
    animate = true,
  } = options;

  const theme = mergeTheme(themeName, options.customColors);

  const stages = Object.entries(stats.projectsByStage);
  const totalProjects = Object.values(stats.projectsByStage).reduce((a, b) => a + b, 0);

  const stageBar = stages
    .map(([stage, count], i) => {
      const prevWidth = stages.slice(0, i).reduce((acc, [_, c]) => acc + (c / totalProjects) * (width - 40), 0);
      const segmentWidth = (count / totalProjects) * (width - 40);
      const color = STAGE_COLORS[stage] || STAGE_COLORS.idea;

      return `<rect x="${20 + prevWidth}" y="90" width="${segmentWidth}" height="12" fill="${color}" class="${animate ? 'fade-in delay-' + Math.min(i + 1, 5) : ''}"/>`;
    })
    .join('');

  const legend = stages
    .map(([stage, count], i) => {
      const x = 20 + i * 70;
      const color = STAGE_COLORS[stage] || STAGE_COLORS.idea;

      return `
        <g class="${animate ? 'fade-in delay-' + Math.min(i + 2, 5) : ''}">
          <circle cx="${x}" cy="120" r="4" fill="${color}"/>
          ${createText(`${stage} (${count})`, x + 8, 124, { color: theme.textSecondary, size: 9 })}
        </g>
      `;
    })
    .join('');

  const content = `
    <!-- Header -->
    <g class="fade-in">
      ${createFlukebaseLogo(15, 12, 22, theme.accent)}
      ${createText('Flukebase Stats', 42, 28, { color: theme.text, size: 14, weight: 'bold' })}
    </g>

    <!-- Main Stats -->
    <g class="fade-in delay-1" transform="translate(20, 50)">
      ${createText(stats.totalProjects.toString(), 0, 20, { color: theme.accent, size: 24, weight: 'bold' })}
      ${createText('projects', 35, 20, { color: theme.textSecondary, size: 12 })}

      ${createText(stats.activeCollaborations.toString(), 100, 20, { color: theme.icon, size: 24, weight: 'bold' })}
      ${createText('active', 130, 20, { color: theme.textSecondary, size: 12 })}

      ${createText(stats.completedAgreements.toString(), 180, 20, { color: theme.text, size: 24, weight: 'bold' })}
      ${createText('completed', 210, 20, { color: theme.textSecondary, size: 12 })}
    </g>

    <!-- Stage Distribution Bar -->
    <rect x="20" y="90" width="${width - 40}" height="12" rx="6" fill="${theme.progressBackground}"/>
    ${stageBar}

    <!-- Legend -->
    ${legend}
  `;

  return createSvgWrapper(content, width, height, theme, {
    animate,
    borderRadius,
    showBorder,
  });
}
