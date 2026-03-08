import axios from 'axios';

export interface WeekBand {
  weekIndex: number;   // 0 = oldest, 51 = most recent
  totalCommits: number;
  normalised: number;  // 0.0 – 1.0 relative to max week
}

export interface AuroraData {
  username: string;
  bands: WeekBand[];          // 52 weeks
  totalCommits: number;
  currentStreak: number;
  totalStars: number;
  topLanguage: string;
  rank: string;
}

const GITHUB_API = 'https://api.github.com/graphql';

const AURORA_QUERY = `
query($username: String!) {
  user(login: $username) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            contributionCount
          }
        }
      }
    }
    repositories(first: 100, ownerAffiliations: OWNER) {
      nodes {
        stargazerCount
        primaryLanguage { name }
      }
    }
  }
}
`;

function calcStreak(weeks: { contributionDays: { contributionCount: number }[] }[]): number {
  const days = weeks.flatMap(w => w.contributionDays).map(d => d.contributionCount);
  let streak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i] > 0) streak++;
    else break;
  }
  return streak;
}

function calcRank(commits: number, stars: number, streak: number): string {
  const score = commits * 1 + stars * 2 + streak * 5;
  if (score >= 5000) return 'TEMPEST';
  if (score >= 3000) return 'STORM';
  if (score >= 1800) return 'LIGHTNING';
  if (score >= 900)  return 'THUNDER';
  if (score >= 400)  return 'BOLT';
  return 'SPARK';
}

export async function fetchAuroraData(username: string): Promise<AuroraData> {
  const token = process.env.GITHUB_TOKEN;

  try {
    const res = await axios.post(
      GITHUB_API,
      { query: AURORA_QUERY, variables: { username } },
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
      }
    );

    const user = res.data?.data?.user;
    if (!user) throw new Error('User not found');

    const calendar = user.contributionsCollection.contributionCalendar;
    const weeks: { contributionDays: { contributionCount: number }[] }[] = calendar.weeks;
    const totalCommits: number = calendar.totalContributions;

    // Build bands — one per week (use last 52)
    const weekTotals = weeks.slice(-52).map(w =>
      w.contributionDays.reduce((s, d) => s + d.contributionCount, 0)
    );
    const maxWeek = Math.max(...weekTotals, 1);
    const bands: WeekBand[] = weekTotals.map((total, i) => ({
      weekIndex: i,
      totalCommits: total,
      normalised: total / maxWeek,
    }));

    // Stars + top language
    const repos: { stargazerCount: number; primaryLanguage: { name: string } | null }[] =
      user.repositories.nodes;
    const totalStars = repos.reduce((s: number, r: any) => s + (r.stargazerCount || 0), 0);

    const langCount: Record<string, number> = {};
    for (const r of repos) {
      if (r.primaryLanguage?.name) {
        langCount[r.primaryLanguage.name] = (langCount[r.primaryLanguage.name] || 0) + 1;
      }
    }
    const topLanguage = Object.entries(langCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'Unknown';
    const currentStreak = calcStreak(weeks);
    const rank = calcRank(totalCommits, totalStars, currentStreak);

    return { username, bands, totalCommits, currentStreak, totalStars, topLanguage, rank };
  } catch (err) {
    console.error('Aurora fetch error:', err);
    // Return graceful empty data
    const bands: WeekBand[] = Array.from({ length: 52 }, (_, i) => ({
      weekIndex: i,
      totalCommits: 0,
      normalised: Math.random() * 0.3, // subtle placeholder animation
    }));
    return {
      username,
      bands,
      totalCommits: 0,
      currentStreak: 0,
      totalStars: 0,
      topLanguage: 'Unknown',
      rank: 'SPARK',
    };
  }
}
