import axios from 'axios';
import { GitHubUser, GitHubStats } from '../types';

const GITHUB_API = 'https://api.github.com';
const GITHUB_GRAPHQL = 'https://api.github.com/graphql';

interface ContributionDay {
  date: string;
  count: number;
}

interface ContributionWeek {
  days: ContributionDay[];
}

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
              weeks {
                contributionDays {
                  date
                  contributionCount
                }
              }
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
    const calendar = contributions.contributionCalendar;

    const totalStars = repos.reduce((sum: number, repo: { stargazerCount: number }) => sum + repo.stargazerCount, 0);
    const totalForks = repos.reduce((sum: number, repo: { forkCount: number }) => sum + repo.forkCount, 0);

    // Calculate streaks from calendar data
    const weeks: ContributionWeek[] = calendar.weeks.map((week: { contributionDays: Array<{ date: string; contributionCount: number }> }) => ({
      days: week.contributionDays.map((day: { date: string; contributionCount: number }) => ({
        date: day.date,
        count: day.contributionCount,
      })),
    }));

    const streakData = this.calculateStreak(weeks);

    return {
      totalStars,
      totalForks,
      totalCommits: contributions.totalCommitContributions,
      totalPRs: contributions.totalPullRequestContributions,
      totalPRsMerged: user.pullRequests.totalCount,
      totalPRsReviewed: contributions.totalPullRequestReviewContributions,
      totalIssues: contributions.totalIssueContributions,
      totalContributions: calendar.totalContributions,
      ...streakData,
    };
  }

  private calculateStreak(weeks: ContributionWeek[]): {
    contributionStreak: number;
    longestStreak: number;
    currentStreak: number;
  } {
    const allDays = weeks.flatMap((week) => week.days);

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
