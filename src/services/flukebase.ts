import axios from 'axios';

export interface FlukebaseProject {
  id: number;
  name: string;
  stage: string;
  collaboration_type?: string;
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
      // Correct endpoint: /api/v1/flukebase_connect/projects
      const response = await axios.get(`${this.baseUrl}/api/v1/flukebase_connect/projects`, {
        headers: this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {},
        timeout: 10000,
      });

      const projects: FlukebaseProject[] = response.data.projects || [];
      return this.buildProfile(username, projects);
    } catch (error) {
      console.error('Flukebase API error:', error);
      // Return empty profile on error
      return this.buildProfile(username, []);
    }
  }

  private buildProfile(username: string, projects: FlukebaseProject[]): FlukebaseProfile {
    const stageBreakdown: Record<string, number> = {};
    const collaborationBreakdown: Record<string, number> = {};

    for (const project of projects) {
      const stage = project.stage || 'unknown';
      stageBreakdown[stage] = (stageBreakdown[stage] || 0) + 1;

      // collaboration_type may not be in API response, default to 'solo'
      const collab = project.collaboration_type || 'solo';
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
}

export function maskProjectName(name: string): string {
  if (name.length <= 2) return name;
  const first = name[0];
  const last = name[name.length - 1];
  return `${first}****${last}`;
}
