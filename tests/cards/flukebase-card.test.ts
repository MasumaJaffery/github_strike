import { generateFlukebaseCard, generateFlukebaseStatsCard } from '../../src/cards/flukebase-card';
import { FlukebaseProfile } from '../../src/services/flukebase';
import { FlukebaseStats } from '../../src/types';

describe('Flukebase Card', () => {
  const mockProfile: FlukebaseProfile = {
    user: {
      id: 1,
      username: 'testuser',
      bio: 'Test bio',
      createdAt: '2024-01-01T00:00:00Z',
    },
    projects: [
      {
        id: 1,
        name: 'project-one',
        description: 'First project',
        stage: 'prototype',
        collaborators: 3,
        agreements: 2,
        createdAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 2,
        name: 'project-two',
        description: 'Second project',
        stage: 'development',
        collaborators: 5,
        agreements: 4,
        createdAt: '2024-02-01T00:00:00Z',
      },
      {
        id: 3,
        name: 'project-three',
        description: 'Third project',
        stage: 'launched',
        collaborators: 8,
        agreements: 7,
        createdAt: '2024-03-01T00:00:00Z',
      },
    ],
    collaborations: [
      {
        id: 1,
        projectId: 1,
        projectName: 'project-one',
        role: 'owner',
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 2,
        projectId: 2,
        projectName: 'project-two',
        role: 'collaborator',
        status: 'active',
        createdAt: '2024-02-01T00:00:00Z',
        updatedAt: '2024-02-01T00:00:00Z',
      },
    ],
    stats: {
      totalProjects: 3,
      activeCollaborations: 2,
      completedAgreements: 5,
      projectsByStage: {
        prototype: 1,
        development: 1,
        launched: 1,
      },
    },
  };

  const mockStats: FlukebaseStats = {
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

  describe('generateFlukebaseCard', () => {
    it('should generate a valid SVG', () => {
      const svg = generateFlukebaseCard(mockProfile);
      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
    });

    it('should include username', () => {
      const svg = generateFlukebaseCard(mockProfile);
      expect(svg).toContain('testuser on Flukebase');
    });

    it('should include flukebase.me branding', () => {
      const svg = generateFlukebaseCard(mockProfile);
      expect(svg).toContain('flukebase.me');
    });

    it('should show stats', () => {
      const svg = generateFlukebaseCard(mockProfile);
      expect(svg).toContain('Projects');
      expect(svg).toContain('Collaborations');
      expect(svg).toContain('Agreements');
    });

    it('should show project names when showProjects is true', () => {
      const svg = generateFlukebaseCard(mockProfile, { showProjects: true });
      expect(svg).toContain('project-one');
      expect(svg).toContain('project-two');
    });

    it('should hide projects when showProjects is false', () => {
      const svg = generateFlukebaseCard(mockProfile, { showProjects: false });
      expect(svg).not.toContain('Recent Projects');
    });

    it('should limit projects shown', () => {
      const svg = generateFlukebaseCard(mockProfile, { maxProjects: 1 });
      expect(svg).toContain('project-one');
      expect(svg).not.toContain('project-three');
    });

    it('should show collaboration roles', () => {
      const svg = generateFlukebaseCard(mockProfile, { showCollaborations: true });
      expect(svg).toContain('owner');
      expect(svg).toContain('collaborator');
    });

    it('should hide collaborations when showCollaborations is false', () => {
      const svg = generateFlukebaseCard(mockProfile, { showCollaborations: false });
      expect(svg).not.toContain('Active Roles');
    });

    it('should apply custom theme', () => {
      const svg = generateFlukebaseCard(mockProfile, { theme: 'aurora' });
      expect(svg).toContain('#0a192f');
    });

    it('should apply custom dimensions', () => {
      const svg = generateFlukebaseCard(mockProfile, { width: 600, height: 350 });
      expect(svg).toContain('max-width: 600px');
      expect(svg).toMatch(/viewBox="0 0 \d+ 350"/);
    });
  });

  describe('generateFlukebaseStatsCard', () => {
    it('should generate a valid SVG', () => {
      const svg = generateFlukebaseStatsCard(mockStats);
      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
    });

    it('should include Flukebase Stats title', () => {
      const svg = generateFlukebaseStatsCard(mockStats);
      expect(svg).toContain('Flukebase Stats');
    });

    it('should show total projects count', () => {
      const svg = generateFlukebaseStatsCard(mockStats);
      expect(svg).toContain('>5<');
      expect(svg).toContain('projects');
    });

    it('should show active collaborations', () => {
      const svg = generateFlukebaseStatsCard(mockStats);
      expect(svg).toContain('>3<');
      expect(svg).toContain('active');
    });

    it('should show completed agreements', () => {
      const svg = generateFlukebaseStatsCard(mockStats);
      expect(svg).toContain('>8<');
      expect(svg).toContain('completed');
    });

    it('should show stage distribution', () => {
      const svg = generateFlukebaseStatsCard(mockStats);
      expect(svg).toContain('idea');
      expect(svg).toContain('prototype');
      expect(svg).toContain('development');
      expect(svg).toContain('launched');
    });

    it('should apply custom theme', () => {
      const svg = generateFlukebaseStatsCard(mockStats, { theme: 'ember' });
      expect(svg).toContain('#1a0a0a');
    });

    it('should apply custom dimensions', () => {
      const svg = generateFlukebaseStatsCard(mockStats, { width: 400, height: 200 });
      expect(svg).toContain('max-width: 400px');
      expect(svg).toMatch(/viewBox="0 0 \d+ 200"/);
    });
  });
});
