import { Router, Request, Response } from 'express';
import { GitHubService } from '../services/github';
import { FlukebaseService } from '../services/flukebase';
import {
  generateStrikeCard,
  generateCompactStrikeCard,
  generateLanguageCard,
  generateAchievementCard,
  generateContributionTimeline,
  generateStreakCard,
  generateFlukebaseCard,
  generateFlukebaseStatsCard,
} from '../cards';
import { CardOptions, ThemeName } from '../types';

const router = Router();

function parseCardOptions(query: Request['query']): CardOptions {
  return {
    theme: (query.theme as ThemeName) || 'electric',
    width: query.width ? parseInt(query.width as string, 10) : undefined,
    height: query.height ? parseInt(query.height as string, 10) : undefined,
    showBorder: query.hide_border !== 'true',
    borderRadius: query.border_radius ? parseInt(query.border_radius as string, 10) : undefined,
    animate: query.disable_animations !== 'true',
    locale: (query.locale as string) || 'en',
    hideStats: query.hide ? (query.hide as string).split(',') : [],
    customColors: {
      ...(query.bg_color && { background: `#${query.bg_color}` }),
      ...(query.text_color && { text: `#${query.text_color}` }),
      ...(query.accent_color && { accent: `#${query.accent_color}` }),
      ...(query.border_color && { border: `#${query.border_color}` }),
      ...(query.icon_color && { icon: `#${query.icon_color}` }),
    },
  };
}

function sendSvg(res: Response, svg: string, cacheSeconds = 14400): void {
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', `public, max-age=${cacheSeconds}`);
  res.send(svg);
}

function handleError(res: Response, error: unknown): void {
  console.error('Error generating card:', error);
  const message = error instanceof Error ? error.message : 'Unknown error';
  res.status(500).json({ error: message });
}

router.get('/strike/:username', async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const options = parseCardOptions(req.query);
    const compact = req.query.compact === 'true';

    const github = new GitHubService(process.env.GITHUB_TOKEN);
    const [user, stats] = await Promise.all([
      github.getUser(username),
      github.getStats(username),
    ]);

    const svg = compact
      ? generateCompactStrikeCard({ user, stats }, options)
      : generateStrikeCard({ user, stats }, options);

    sendSvg(res, svg);
  } catch (error) {
    handleError(res, error);
  }
});

router.get('/languages/:username', async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const options = parseCardOptions(req.query);
    const layout = (req.query.layout as 'radar' | 'donut' | 'bars' | 'compact') || 'radar';
    const maxLanguages = req.query.langs_count
      ? parseInt(req.query.langs_count as string, 10)
      : 8;

    const github = new GitHubService(process.env.GITHUB_TOKEN);
    const languages = await github.getLanguages(username);

    const svg = generateLanguageCard(languages, {
      ...options,
      layout,
      maxLanguages,
      showPercentage: req.query.hide_percentage !== 'true',
    });

    sendSvg(res, svg);
  } catch (error) {
    handleError(res, error);
  }
});

router.get('/achievements/:username', async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const options = parseCardOptions(req.query);
    const layout = (req.query.layout as 'grid' | 'list') || 'grid';
    const showLocked = req.query.hide_locked !== 'true';
    const maxAchievements = req.query.max
      ? parseInt(req.query.max as string, 10)
      : 8;

    const github = new GitHubService(process.env.GITHUB_TOKEN);
    const stats = await github.getStats(username);

    const svg = generateAchievementCard(stats, {
      ...options,
      layout,
      showLocked,
      maxAchievements,
    });

    sendSvg(res, svg);
  } catch (error) {
    handleError(res, error);
  }
});

router.get('/timeline/:username', async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const options = parseCardOptions(req.query);

    const github = new GitHubService(process.env.GITHUB_TOKEN);
    const calendar = await github.getContributionCalendar(username);

    const svg = generateContributionTimeline(calendar, {
      ...options,
      showMonthLabels: req.query.hide_months !== 'true',
      showDayLabels: req.query.hide_days !== 'true',
    });

    sendSvg(res, svg);
  } catch (error) {
    handleError(res, error);
  }
});

router.get('/streak/:username', async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const options = parseCardOptions(req.query);

    const github = new GitHubService(process.env.GITHUB_TOKEN);
    const [calendar, stats] = await Promise.all([
      github.getContributionCalendar(username),
      github.getStats(username),
    ]);

    const svg = generateStreakCard(
      calendar,
      stats.currentStreak,
      stats.longestStreak,
      options
    );

    sendSvg(res, svg);
  } catch (error) {
    handleError(res, error);
  }
});

router.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Flukebase.me Integration Routes

router.get('/flukebase/:username', async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const options = parseCardOptions(req.query);
    const showProjects = req.query.hide_projects !== 'true';
    const showCollaborations = req.query.hide_collaborations !== 'true';
    const maxProjects = req.query.max_projects
      ? parseInt(req.query.max_projects as string, 10)
      : 3;

    const flukebase = new FlukebaseService(
      process.env.FLUKEBASE_API_KEY,
      process.env.FLUKEBASE_API_URL
    );
    const profile = await flukebase.getProfile(username);

    const svg = generateFlukebaseCard(profile, {
      ...options,
      showProjects,
      showCollaborations,
      maxProjects,
    });

    sendSvg(res, svg);
  } catch (error) {
    handleError(res, error);
  }
});

router.get('/flukebase-stats/:username', async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const options = parseCardOptions(req.query);

    const flukebase = new FlukebaseService(
      process.env.FLUKEBASE_API_KEY,
      process.env.FLUKEBASE_API_URL
    );
    const stats = await flukebase.getStats(username);

    const svg = generateFlukebaseStatsCard(stats, options);

    sendSvg(res, svg);
  } catch (error) {
    handleError(res, error);
  }
});

export default router;
