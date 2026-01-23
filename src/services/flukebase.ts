import axios from 'axios';

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

export class FlukebaseService {
  private apiKey?: string;
  private baseUrl: string;

  constructor(apiKey?: string, baseUrl?: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl || 'https://flukebase.me';
  }

  async getProfile(username: string): Promise<FlukebaseProfile> {
    try {
      // Try to fetch from API
      const response = await axios.get(`${this.baseUrl}/api/v1/users/${username}/projects`, {
        headers: this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {},
        timeout: 5000,
      });

      const projects: FlukebaseProject[] = response.data.projects || [];
      return this.buildProfile(username, projects);
    } catch {
      // Return mock data as fallback
      return this.getMockProfile(username);
    }
  }

  private buildProfile(username: string, projects: FlukebaseProject[]): FlukebaseProfile {
    const stageBreakdown: Record<string, number> = {};
    const collaborationBreakdown: Record<string, number> = {};

    for (const project of projects) {
      const stage = project.stage || 'Unknown';
      const collab = project.collaboration_type || 'Unknown';
      stageBreakdown[stage] = (stageBreakdown[stage] || 0) + 1;
      collaborationBreakdown[collab] = (collaborationBreakdown[collab] || 0) + 1;
    }

    return {
      username,
      projects,
      totalProjects: projects.length,
      stageBreakdown,
      collaborationBreakdown,
    };
  }

  private getMockProfile(username: string): FlukebaseProfile {
    // Mock data for demo/fallback
    const mockProjects: FlukebaseProject[] = [
      { id: 1, name: 'ProjectAlpha', stage: 'Development', collaboration_type: 'Open Source' },
      { id: 2, name: 'BetaSystem', stage: 'Production', collaboration_type: 'Team' },
      { id: 3, name: 'GammaApp', stage: 'Planning', collaboration_type: 'Solo' },
    ];

    return this.buildProfile(username, mockProjects);
  }
}

export function maskProjectName(name: string): string {
  if (name.length <= 2) return name;
  const first = name[0];
  const last = name[name.length - 1];
  return `${first}****${last}`;
}
