import { Router, Request, Response } from 'express';
import { GitHubService } from '../services/github';
import { generateStrikeCard, generateCompactStrikeCard } from '../cards';

const router = Router();

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
    const compact = req.query.compact === 'true';

    const github = new GitHubService(process.env.GITHUB_TOKEN);
    const [user, stats] = await Promise.all([
      github.getUser(username),
      github.getStats(username),
    ]);

    const svg = compact
      ? generateCompactStrikeCard({ user, stats })
      : generateStrikeCard({ user, stats });

    sendSvg(res, svg);
  } catch (error) {
    handleError(res, error);
  }
});

router.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
