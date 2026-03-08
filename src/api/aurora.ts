import { Router, Request, Response } from 'express';
import { fetchAuroraData } from '../fetchers/auroraFetcher';
import { renderAuroraSVG } from '../renderers/auroraRenderer';

const router = Router();

/**
 * GET /api/aurora/:username
 *
 * Query params:
 *   theme   — card theme name (default: 'electric')
 *             supported: electric | midnight | aurora | ember | neon | cyber
 *
 * Returns a 1000×240 SVG card showing the Aurora Commit Sky —
 * 52 weeks of contribution history rendered as animated northern-lights
 * ribbons, each band's height and intensity driven by real commit data.
 *
 * Example:
 *   /api/aurora/MasumaJaffery?theme=aurora
 *
 * Embed in README:
 *   ![Aurora](https://github-strike.vercel.app/api/aurora/YOUR_USERNAME)
 */
router.get('/:username', async (req: Request, res: Response) => {
  const { username } = req.params;
  const theme = (req.query.theme as string) || 'electric';

  // Validate username (GitHub usernames: alphanumeric + hyphens, 1–39 chars)
  if (!username || !/^[a-zA-Z0-9-]{1,39}$/.test(username)) {
    return res.status(400).send('Invalid GitHub username');
  }

  // Validate theme
  const validThemes = ['electric', 'midnight', 'aurora', 'ember', 'frost', 'neon', 'sunset', 'ocean', 'forest', 'cyber'];
  const safetheme = validThemes.includes(theme) ? theme : 'electric';

  try {
    const data = await fetchAuroraData(username);
    const svg  = renderAuroraSVG(data, safetheme);

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    return res.send(svg);
  } catch (err: any) {
    console.error(`[aurora] Error for ${username}:`, err.message);
    return res.status(500).send('Failed to generate Aurora card');
  }
});

export default router;
