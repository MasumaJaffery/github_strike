import axios from 'axios';
import {
  GitHubUser,
  GitHubStats,
  LanguageStats,
  ContributionCalendar,
  Repository,
} from '../types';

const GITHUB_API = 'https://api.github.com';
const GITHUB_GRAPHQL = 'https://api.github.com/graphql';

export class GitHubService {
  private token?: string;

  constructor(token?: string) {
    this.token = token;
  }

  private get headers() {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
    };
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    return headers;
  }

  async getUser(username: string): Promise<GitHubUser> {
    const response = await axios.get(`${GITHUB_API}/users/${username}`, {
      headers: this.headers,
    });

    const data = response.data;
    return {
      login: data.login,
      name: data.name,
      avatarUrl: data.avatar_url,
      bio: data.bio,
      company: data.company,
      location: data.location,
      blog: data.blog,
      followers: data.followers,
      following: data.following,
      publicRepos: data.public_repos,
      createdAt: data.created_at,
    };
  }

  async getStats(username: string): Promise<GitHubStats> {
    const query = `
      query($username: String!) {
        user(login: $username) {
          contributionsCollection {
            totalCommitContributions
            totalPullRequestContributions
            totalPullRequestReviewContributions
            totalIssueContributions
            contributionCalendar {
              totalContributions
            }
          }
          repositories(first: 100, ownerAffiliations: OWNER, isFork: false) {
            nodes {
              stargazerCount
              forkCount
            }
          }
          pullRequests(states: MERGED) {
            totalCount
          }
        }
      }
    `;

    const response = await axios.post(
      GITHUB_GRAPHQL,
      { query, variables: { username } },
      { headers: { ...this.headers, 'Content-Type': 'application/json' } }
    );

    const user = response.data.data.user;
    const contributions = user.contributionsCollection;
    const repos = user.repositories.nodes;

    const totalStars = repos.reduce((sum: number, repo: { stargazerCount: number }) => sum + repo.stargazerCount, 0);
    const totalForks = repos.reduce((sum: number, repo: { forkCount: number }) => sum + repo.forkCount, 0);

    const streakData = await this.calculateStreak(username);

    return {
      totalStars,
      totalForks,
      totalCommits: contributions.totalCommitContributions,
      totalPRs: contributions.totalPullRequestContributions,
      totalPRsMerged: user.pullRequests.totalCount,
      totalPRsReviewed: contributions.totalPullRequestReviewContributions,
      totalIssues: contributions.totalIssueContributions,
      totalContributions: contributions.contributionCalendar.totalContributions,
      ...streakData,
    };
  }

  async getLanguages(username: string): Promise<LanguageStats> {
    const query = `
      query($username: String!) {
        user(login: $username) {
          repositories(first: 100, ownerAffiliations: OWNER, isFork: false) {
            nodes {
              languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
                edges {
                  size
                  node {
                    name
                    color
                  }
                }
              }
            }
          }
        }
      }
    `;

    const response = await axios.post(
      GITHUB_GRAPHQL,
      { query, variables: { username } },
      { headers: { ...this.headers, 'Content-Type': 'application/json' } }
    );

    const repos = response.data.data.user.repositories.nodes;
    const languageTotals: Record<string, { size: number; color: string }> = {};

    for (const repo of repos) {
      for (const edge of repo.languages.edges) {
        const name = edge.node.name;
        if (!languageTotals[name]) {
          languageTotals[name] = { size: 0, color: edge.node.color || '#858585' };
        }
        languageTotals[name].size += edge.size;
      }
    }

    const totalSize = Object.values(languageTotals).reduce((sum, lang) => sum + lang.size, 0);
    const stats: LanguageStats = {};

    for (const [name, data] of Object.entries(languageTotals)) {
      stats[name] = {
        size: data.size,
        percentage: totalSize > 0 ? (data.size / totalSize) * 100 : 0,
        color: data.color,
      };
    }

    return stats;
  }

  async getContributionCalendar(username: string): Promise<ContributionCalendar> {
    const query = `
      query($username: String!) {
        user(login: $username) {
          contributionsCollection {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  date
                  contributionCount
                  contributionLevel
                }
              }
            }
          }
        }
      }
    `;

    const response = await axios.post(
      GITHUB_GRAPHQL,
      { query, variables: { username } },
      { headers: { ...this.headers, 'Content-Type': 'application/json' } }
    );

    const calendar = response.data.data.user.contributionsCollection.contributionCalendar;
    const levelMap: Record<string, 0 | 1 | 2 | 3 | 4> = {
      NONE: 0,
      FIRST_QUARTILE: 1,
      SECOND_QUARTILE: 2,
      THIRD_QUARTILE: 3,
      FOURTH_QUARTILE: 4,
    };

    return {
      totalContributions: calendar.totalContributions,
      weeks: calendar.weeks.map((week: { contributionDays: Array<{ date: string; contributionCount: number; contributionLevel: string }> }) => ({
        days: week.contributionDays.map((day) => ({
          date: day.date,
          count: day.contributionCount,
          level: levelMap[day.contributionLevel] || 0,
        })),
      })),
    };
  }

  async getTopRepositories(username: string, limit = 6): Promise<Repository[]> {
    const query = `
      query($username: String!, $limit: Int!) {
        user(login: $username) {
          repositories(first: $limit, orderBy: {field: STARGAZERS, direction: DESC}, ownerAffiliations: OWNER) {
            nodes {
              name
              description
              url
              stargazerCount
              forkCount
              primaryLanguage {
                name
              }
              isPrivate
              isFork
              updatedAt
            }
          }
        }
      }
    `;

    const response = await axios.post(
      GITHUB_GRAPHQL,
      { query, variables: { username, limit } },
      { headers: { ...this.headers, 'Content-Type': 'application/json' } }
    );

    return response.data.data.user.repositories.nodes.map((repo: {
      name: string;
      description: string | null;
      url: string;
      stargazerCount: number;
      forkCount: number;
      primaryLanguage: { name: string } | null;
      isPrivate: boolean;
      isFork: boolean;
      updatedAt: string;
    }) => ({
      name: repo.name,
      description: repo.description,
      url: repo.url,
      stars: repo.stargazerCount,
      forks: repo.forkCount,
      primaryLanguage: repo.primaryLanguage?.name || null,
      isPrivate: repo.isPrivate,
      isFork: repo.isFork,
      updatedAt: repo.updatedAt,
    }));
  }

  private async calculateStreak(username: string): Promise<{
    contributionStreak: number;
    longestStreak: number;
    currentStreak: number;
  }> {
    const calendar = await this.getContributionCalendar(username);
    const allDays = calendar.weeks.flatMap((week) => week.days);

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    for (let i = allDays.length - 1; i >= 0; i--) {
      const day = allDays[i];

      if (day.count > 0) {
        tempStreak++;
        if (i === allDays.length - 1 || day.date === today || day.date === yesterday) {
          currentStreak = tempStreak;
        }
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 0;
      }
    }

    longestStreak = Math.max(longestStreak, tempStreak);

    return {
      contributionStreak: currentStreak,
      longestStreak,
      currentStreak,
    };
  }
}

export const createGitHubService = (token?: string) => new GitHubService(token);
