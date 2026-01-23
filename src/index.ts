import express from 'express';
import dotenv from 'dotenv';
import routes from './api/routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (_req, res) => {
  res.json({
    name: 'GitHub Strike',
    version: '1.0.0',
    description: 'GitHub developer stats visualization',
    endpoints: {
      strike: '/api/strike/:username',
      flukebase: '/api/flukebase/:username',
      health: '/api/health',
    },
  });
});

app.use('/api', routes);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const HOST = process.env.HOST || '0.0.0.0';

app.listen(Number(PORT), HOST, () => {
  console.log(`GitHub Strike running at http://${HOST}:${PORT}`);
});

export default app;
