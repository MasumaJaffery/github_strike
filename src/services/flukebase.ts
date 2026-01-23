import axios from 'axios';
import { FlukebaseProject, FlukebaseStats } from '../types';

const FLUKEBASE_API = process.env.FLUKEBASE_API_URL || 'https://api.flukebase.me';

export interface FlukebaseUser {
  id: number;
  username: string;
  email?: string;
  avatar?: string;
  bio?: string;
  createdAt: string;
}

export interface CollaborationAgreement {
  id: number;
  projectId: number;
  projectName: string;
  role: 'owner' | 'collaborator' | 'contributor';
  status: 'active' | 'pending' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface FlukebaseProfile {
  user: FlukebaseUser;
  projects: FlukebaseProject[];
  collaborations: CollaborationAgreement[];
  stats: FlukebaseStats;
}

export class FlukebaseService {
  private apiKey?: string;
  private baseUrl: string;

  constructor(apiKey?: string, baseUrl?: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl || FLUKEBASE_API;
  }

  private get headers() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.apiKey) {
      headers.Authorization = `Bearer ${this.apiKey}`;
    }
    return headers;
  }

  async getProfile(username: string): Promise<FlukebaseProfile> {
    try {
      const response = await axios.get(`${this.baseUrl}/users/${username}/profile`, {
        headers: this.headers,
      });
      return response.data;
    } catch (error) {
      // Return mock data for development/demo purposes
      return this.getMockProfile(username);
    }
  }

  async getProjects(username: string): Promise<FlukebaseProject[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/users/${username}/projects`, {
        headers: this.headers,
      });
      return response.data;
    } catch (error) {
      return this.getMockProjects(username);
    }
  }

  async getCollaborations(username: string): Promise<CollaborationAgreement[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/users/${username}/collaborations`, {
        headers: this.headers,
      });
      return response.data;
    } catch (error) {
      return this.getMockCollaborations();
    }
  }

  async getStats(username: string): Promise<FlukebaseStats> {
    try {
      const response = await axios.get(`${this.baseUrl}/users/${username}/stats`, {
        headers: this.headers,
      });
      return response.data;
    } catch (error) {
      return this.getMockStats();
    }
  }

  // Mock data for development and demo purposes
  private getMockProfile(username: string): FlukebaseProfile {
    return {
      user: {
        id: 1,
        username,
        bio: 'Developer building amazing projects',
        createdAt: new Date().toISOString(),
      },
      projects: this.getMockProjects(username),
      collaborations: this.getMockCollaborations(),
      stats: this.getMockStats(),
    };
  }

  private getMockProjects(username: string): FlukebaseProject[] {
    return [
      {
        id: 1,
        name: 'github_strike',
        description: 'Next-generation GitHub stats visualization',
        stage: 'prototype',
        collaborators: 3,
        agreements: 2,
        createdAt: new Date().toISOString(),
      },
      {
        id: 2,
        name: 'awesome-project',
        description: 'An awesome collaborative project',
        stage: 'development',
        collaborators: 5,
        agreements: 4,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 3,
        name: 'startup-mvp',
        description: 'MVP for a new startup idea',
        stage: 'launched',
        collaborators: 8,
        agreements: 7,
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
  }

  private getMockCollaborations(): CollaborationAgreement[] {
    return [
      {
        id: 1,
        projectId: 1,
        projectName: 'github_strike',
        role: 'owner',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 2,
        projectId: 2,
        projectName: 'awesome-project',
        role: 'collaborator',
        status: 'active',
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 3,
        projectId: 3,
        projectName: 'startup-mvp',
        role: 'contributor',
        status: 'completed',
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
  }

  private getMockStats(): FlukebaseStats {
    return {
      totalProjects: 5,
      activeCollaborations: 3,
      completedAgreements: 8,
      projectsByStage: {
        idea: 1,
        prototype: 2,
        development: 1,
        launched: 1,
      },
    };
  }
}

export const createFlukebaseService = (apiKey?: string, baseUrl?: string) =>
  new FlukebaseService(apiKey, baseUrl);
