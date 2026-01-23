import { createSvgWrapper, text, formatNumber } from '../utils/svg';
import { FlukebaseProfile, maskProjectName } from '../services/flukebase';

const COLORS = {
  title: '#2f80ed',
  label: '#333',
  value: '#333',
  muted: '#586069',
  accent: '#6f42c1',
};

export function generateFlukebaseCard(profile: FlukebaseProfile): string {
  const width = 400;
  const height = 180;

  // Build stages summary
  const stages = Object.entries(profile.stageBreakdown)
    .map(([stage, count]) => `${stage}: ${count}`)
    .join(', ');

  // Build collaboration summary
  const collabs = Object.entries(profile.collaborationBreakdown)
    .map(([type, count]) => `${type}: ${count}`)
    .join(', ');

  // Build masked project list (max 3)
  const projectList = profile.projects
    .slice(0, 3)
    .map((p) => maskProjectName(p.name))
    .join(', ');

  const content = `
<g transform='translate(25, 35)'>
${text('Flukebase Profile', 0, 0, 18, true, COLORS.title)}
</g>
<g transform='translate(25, 65)'>
${text('Total Projects:', 0, 0, 13, false, COLORS.label)}
${text(formatNumber(profile.totalProjects), 120, 0, 13, true, COLORS.value)}
</g>
<g transform='translate(25, 90)'>
${text('Stages:', 0, 0, 13, false, COLORS.label)}
${text(stages || 'None', 70, 0, 12, false, COLORS.muted)}
</g>
<g transform='translate(25, 115)'>
${text('Collaboration:', 0, 0, 13, false, COLORS.label)}
${text(collabs || 'None', 100, 0, 12, false, COLORS.muted)}
</g>
<g transform='translate(25, 145)'>
${text('Projects:', 0, 0, 13, false, COLORS.label)}
${text(projectList || 'None', 70, 0, 12, false, COLORS.muted)}
</g>
`;

  return createSvgWrapper(content, width, height);
}
