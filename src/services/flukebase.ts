export interface FlukebaseProject {
  id: number;
  name: string;
  stage: string;
  collaboration_type: string;
}

export interface FlukebaseProfile {
  username: string;
  projects: FlukebaseProject[];
  totalProjects: number;
  stageBreakdown: Record<string, number>;
  collaborationBreakdown: Record<string, number>;
}

// Real data from Flukebase MCP (API returns 500, so using cached data)
const REAL_PROJECTS: FlukebaseProject[] = [
  { id: 42, name: 'github_strike', stage: 'Development', collaboration_type: 'Solo' },
  { id: 41, name: 'foundersequence', stage: 'Planning', collaboration_type: 'Solo' },
  { id: 39, name: 'flukebase-ecosystem', stage: 'Development', collaboration_type: 'Open Source' },
  { id: 38, name: 'longevity-world-cup-rebuild', stage: 'Development', collaboration_type: 'Team' },
  { id: 37, name: 'aria-lang', stage: 'Planning', collaboration_type: 'Open Source' },
  { id: 35, name: 'flukebase_connect', stage: 'Production', collaboration_type: 'Open Source' },
  { id: 27, name: 'foobara-universe', stage: 'Development', collaboration_type: 'Open Source' },
  { id: 2, name: 'Flukebase1', stage: 'Production', collaboration_type: 'Solo' },
  { id: 15, name: 'See In SP - Tour Guide', stage: 'Planning', collaboration_type: 'Team' },
  { id: 6, name: 'FeelTrack', stage: 'Development', collaboration_type: 'Solo' },
  { id: 5, name: 'ESG Platform', stage: 'Planning', collaboration_type: 'Team' },
  { id: 4, name: 'Rideshare', stage: 'Development', collaboration_type: 'Solo' },
  { id: 10, name: 'FairMarketValue', stage: 'Development', collaboration_type: 'Solo' },
  { id: 9, name: 'Public Tender', stage: 'Planning', collaboration_type: 'Team' },
  { id: 7, name: 'FarmWatch', stage: 'Development', collaboration_type: 'Solo' },
  { id: 3, name: 'FLL Language Learning', stage: 'Development', collaboration_type: 'Solo' },
];

export class FlukebaseService {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(_apiKey?: string, _baseUrl?: string) {
    // API key stored for future use when REST API is fixed
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getProfile(_username: string): Promise<FlukebaseProfile> {
    // Use real cached data (REST API returns 500)
    return this.buildProfile(REAL_PROJECTS);
  }

  private buildProfile(projects: FlukebaseProject[]): FlukebaseProfile {
    const stageBreakdown: Record<string, number> = {};
    const collaborationBreakdown: Record<string, number> = {};

    for (const project of projects) {
      const stage = project.stage || 'Unknown';
      const collab = project.collaboration_type || 'Unknown';
      stageBreakdown[stage] = (stageBreakdown[stage] || 0) + 1;
      collaborationBreakdown[collab] = (collaborationBreakdown[collab] || 0) + 1;
    }

    return {
      username: 'cancelei',
      projects,
      totalProjects: projects.length,
      stageBreakdown,
      collaborationBreakdown,
    };
  }
}

export function maskProjectName(name: string): string {
  if (name.length <= 2) return name;
  const first = name[0];
  const last = name[name.length - 1];
  return `${first}****${last}`;
}
