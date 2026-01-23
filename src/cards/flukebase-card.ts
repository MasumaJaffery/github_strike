import { createSvgWrapper, text } from '../utils/svg';
import { FlukebaseProfile, maskProjectName } from '../services/flukebase';

// Stage colors
const STAGE_COLORS: Record<string, string> = {
  idea: '#6c757d',
  prototype: '#0d6efd',
  launched: '#198754',
  scaling: '#6f42c1',
  unknown: '#adb5bd',
};

function stagePill(stage: string, count: number, x: number): string {
  const color = STAGE_COLORS[stage.toLowerCase()] || STAGE_COLORS.unknown;
  const label = `${stage}: ${count}`;
  const width = label.length * 7 + 16;

  return `
<g transform='translate(${x}, 0)'>
<rect x='0' y='-10' width='${width}' height='20' rx='10' fill='${color}15' stroke='${color}' stroke-width='1'/>
<text x='${width / 2}' y='4' stroke-width='0' text-anchor='middle' fill='${color}' stroke='none' font-family='"Segoe UI", Ubuntu, sans-serif' font-weight='600' font-size='11px'>${label}</text>
</g>`;
}

export function generateFlukebaseCard(profile: FlukebaseProfile): string {
  const width = 400;
  const height = 160;

  // Build stage pills
  let stageX = 0;
  const stagePills = Object.entries(profile.stageBreakdown)
    .sort((a, b) => b[1] - a[1]) // Sort by count descending
    .slice(0, 4) // Max 4 stages
    .map(([stage, count]) => {
      const pill = stagePill(stage, count, stageX);
      stageX += stage.length * 7 + count.toString().length * 7 + 30;
      return pill;
    })
    .join('');

  // Build masked project list (max 5)
  const projectList = profile.projects
    .slice(0, 5)
    .map((p) => maskProjectName(p.name))
    .join('  •  ');

  const content = `
<!-- Title & Project Count -->
<g transform='translate(25, 32)'>
<text x='0' y='0' stroke-width='0' fill='#24292f' stroke='none' font-family='"Segoe UI", Ubuntu, sans-serif' font-weight='700' font-size='18px'>Flukebase</text>
<rect x='90' y='-14' width='55' height='22' rx='11' fill='#6f42c115' stroke='#6f42c1' stroke-width='1'/>
<text x='117' y='1' stroke-width='0' text-anchor='middle' fill='#6f42c1' stroke='none' font-family='"Segoe UI", Ubuntu, sans-serif' font-weight='700' font-size='13px'>${profile.totalProjects}</text>
<text x='155' y='0' stroke-width='0' fill='#57606a' stroke='none' font-family='"Segoe UI", Ubuntu, sans-serif' font-weight='400' font-size='13px'>projects</text>
</g>

<!-- Divider -->
<line x1='25' y1='48' x2='375' y2='48' stroke='#e1e4e8' stroke-width='1'/>

<!-- Stage Breakdown -->
<g transform='translate(25, 75)'>
<text x='0' y='-12' stroke-width='0' fill='#57606a' stroke='none' font-family='"Segoe UI", Ubuntu, sans-serif' font-weight='400' font-size='11px'>STAGES</text>
${stagePills}
</g>

<!-- Recent Projects -->
<g transform='translate(25, 115)'>
<text x='0' y='0' stroke-width='0' fill='#57606a' stroke='none' font-family='"Segoe UI", Ubuntu, sans-serif' font-weight='400' font-size='11px'>RECENT PROJECTS</text>
<text x='0' y='20' stroke-width='0' fill='#24292f' stroke='none' font-family='"Segoe UI", Ubuntu, sans-serif' font-weight='500' font-size='12px'>${projectList || 'None'}</text>
</g>
`;

  return createSvgWrapper(content, width, height);
}
