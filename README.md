# ⚡ GitHub Strike

> Next-generation GitHub developer stats visualization with lightning-fast insights

GitHub Strike is an innovative open-source tool for displaying your GitHub statistics with unique visualizations, gamified achievements, and beautiful themes. Stand out from the crowd with Strike Cards, Language Radars, Achievement Bolts, and more!

[![CI](https://github.com/cancelei/github_strike/actions/workflows/ci.yml/badge.svg)](https://github.com/cancelei/github_strike/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Features

- **Strike Cards** - Unique stats visualization with lightning-themed rank system
- **Language Radar** - Multiple layouts (radar, donut, bars, compact) for language proficiency
- **Achievement Bolts** - Gamified achievements with bronze to diamond tier progression
- **Contribution Timeline** - Beautiful contribution graph with smooth animations
- **Streak Cards** - Track your contribution streaks
- **Flukebase Integration** - Display your Flukebase.me projects and collaboration stats
- **10 Stunning Themes** - Electric, Midnight, Aurora, Ember, Frost, Neon, Sunset, Ocean, Forest, Cyber
- **Fully Customizable** - Colors, dimensions, animations, and more
- **Self-Hostable** - Deploy your own instance for privacy and reliability

## Quick Start

### Add to Your GitHub Profile

Simply add the following to your GitHub profile README (replace `YOUR_USERNAME` with your GitHub username):

```markdown
<!-- Strike Card -->
![GitHub Strike](https://github-strike.vercel.app/api/strike/YOUR_USERNAME)

<!-- Language Radar -->
![Languages](https://github-strike.vercel.app/api/languages/YOUR_USERNAME?layout=radar)

<!-- Achievement Bolts -->
![Achievements](https://github-strike.vercel.app/api/achievements/YOUR_USERNAME)

<!-- Contribution Timeline -->
![Timeline](https://github-strike.vercel.app/api/timeline/YOUR_USERNAME)

<!-- Streak Card -->
![Streak](https://github-strike.vercel.app/api/streak/YOUR_USERNAME)

<!-- Flukebase Card (requires Flukebase.me account) -->
![Flukebase](https://github-strike.vercel.app/api/flukebase/YOUR_USERNAME)
```

## Card Types

### Strike Card

Your core GitHub stats with the unique Strike Rank system.

```markdown
![Strike Card](https://github-strike.vercel.app/api/strike/YOUR_USERNAME)
```

**Ranks:** Spark → Bolt → Thunder → Lightning → Storm → Tempest

| Parameter | Description | Default |
|-----------|-------------|---------|
| `theme` | Card theme | `electric` |
| `compact` | Compact mode (`true`/`false`) | `false` |
| `hide` | Stats to hide (comma-separated: `stars,commits,prs,issues,streak`) | - |
| `hide_border` | Hide card border | `false` |
| `disable_animations` | Disable animations | `false` |

### Language Radar

Visualize your programming language proficiency.

```markdown
![Languages](https://github-strike.vercel.app/api/languages/YOUR_USERNAME?layout=radar)
```

| Parameter | Description | Default |
|-----------|-------------|---------|
| `layout` | `radar`, `donut`, `bars`, `compact` | `radar` |
| `langs_count` | Number of languages to show (1-10) | `8` |
| `hide_percentage` | Hide percentage values | `false` |
| `theme` | Card theme | `electric` |

### Achievement Bolts

Gamified achievements based on your GitHub activity.

```markdown
![Achievements](https://github-strike.vercel.app/api/achievements/YOUR_USERNAME)
```

**Achievement Tiers:** Bronze → Silver → Gold → Platinum → Diamond

| Achievement | Description | Unlock Criteria |
|-------------|-------------|-----------------|
| First Strike | Make your first commit | 1+ commits |
| Commit Storm | Reach commit milestones | 100+ commits |
| Star Power | Earn stars on repos | 10+ stars |
| PR Thunder | Open pull requests | 10+ PRs |
| Merge Master | Get PRs merged | 5+ merged PRs |
| Issue Resolver | Contribute to issues | 10+ issues |
| Streak Lightning | Maintain contribution streaks | 7+ day streak |
| Fork Network | Get your repos forked | 5+ forks |

| Parameter | Description | Default |
|-----------|-------------|---------|
| `layout` | `grid` or `list` | `grid` |
| `hide_locked` | Hide locked achievements | `false` |
| `max` | Maximum achievements to show | `8` |
| `theme` | Card theme | `electric` |

### Contribution Timeline

A beautiful visualization of your contribution history.

```markdown
![Timeline](https://github-strike.vercel.app/api/timeline/YOUR_USERNAME)
```

| Parameter | Description | Default |
|-----------|-------------|---------|
| `hide_months` | Hide month labels | `false` |
| `hide_days` | Hide day labels | `false` |
| `theme` | Card theme | `electric` |

### Streak Card

Track your current and longest contribution streaks.

```markdown
![Streak](https://github-strike.vercel.app/api/streak/YOUR_USERNAME)
```

| Parameter | Description | Default |
|-----------|-------------|---------|
| `theme` | Card theme | `electric` |

## Themes

Choose from 10 stunning themes:

| Theme | Preview | Background |
|-------|---------|------------|
| `electric` | ⚡ Default blue | `#0d1117` |
| `midnight` | 🌙 Deep purple | `#0f0f23` |
| `aurora` | 🌌 Teal glow | `#0a192f` |
| `ember` | 🔥 Warm orange | `#1a0a0a` |
| `frost` | ❄️ Ice blue | `#0a1628` |
| `neon` | 💜 Vibrant pink | `#0a0a0a` |
| `sunset` | 🌅 Warm pink | `#1a0f1e` |
| `ocean` | 🌊 Deep blue | `#001220` |
| `forest` | 🌲 Green nature | `#0a1a0a` |
| `cyber` | 🤖 Matrix green | `#0a0a12` |

**Usage:**
```markdown
![Strike](https://github-strike.vercel.app/api/strike/YOUR_USERNAME?theme=aurora)
```

## Customization

### Common Parameters

All cards support these parameters:

| Parameter | Description | Example |
|-----------|-------------|---------|
| `theme` | Theme name | `aurora` |
| `bg_color` | Custom background (hex without #) | `0d1117` |
| `text_color` | Custom text color | `ffffff` |
| `accent_color` | Custom accent color | `58a6ff` |
| `border_color` | Custom border color | `30363d` |
| `icon_color` | Custom icon color | `f0883e` |
| `hide_border` | Hide border | `true` |
| `border_radius` | Border radius in pixels | `20` |
| `width` | Custom width | `500` |
| `height` | Custom height | `200` |
| `disable_animations` | Disable animations | `true` |

### Example: Custom Themed Card

```markdown
![Custom Strike](https://github-strike.vercel.app/api/strike/YOUR_USERNAME?bg_color=1a1b27&text_color=c0caf5&accent_color=7aa2f7&icon_color=bb9af7&border_color=414868)
```

## Self-Hosting

### Prerequisites

- Node.js 18+
- npm or yarn
- GitHub Personal Access Token (optional, for higher rate limits)

### Local Development

```bash
# Clone the repository
git clone https://github.com/cancelei/github_strike.git
cd github_strike

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env and add your GITHUB_TOKEN

# Run development server
npm run dev
```

The server will start at `http://localhost:3000`.

### Deploy with CapRover (Recommended)

GitHub Strike is optimized for [CapRover](https://caprover.com/) deployment.

**Option 1: Deploy via Git**

```bash
# Add your CapRover app as a remote
git remote add caprover captain@your-caprover-server:github-strike

# Push to deploy
git push caprover master
```

**Option 2: Deploy via CLI**

```bash
# Install CapRover CLI
npm install -g caprover

# Login to your server
caprover login

# Deploy
caprover deploy
```

**Option 3: Deploy via tarball**

```bash
# Create deployment archive
tar -cvf deploy.tar --exclude='node_modules' --exclude='.git' .

# Upload via CapRover dashboard or CLI
caprover deploy -t ./deploy.tar
```

**Environment Variables in CapRover:**

In your CapRover dashboard, go to your app's settings and add:

| Variable | Description | Required |
|----------|-------------|----------|
| `GITHUB_TOKEN` | GitHub Personal Access Token | Recommended |
| `FLUKEBASE_API_KEY` | Flukebase.me API Key | Optional |
| `FLUKEBASE_API_URL` | Flukebase API URL | Optional |

**Enable HTTPS:** In CapRover dashboard, enable "Force HTTPS" and configure your domain.

### Deploy with Docker

```bash
# Build the image
docker build -t github-strike .

# Run the container
docker run -p 3000:3000 \
  -e GITHUB_TOKEN=your_token \
  -e FLUKEBASE_API_KEY=your_key \
  github-strike
```

### Deploy to Vercel (Alternative)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/cancelei/github_strike)

1. Click the button above
2. Add your `GITHUB_TOKEN` as an environment variable
3. Deploy!

## API Reference

### Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/strike/:username` | Get Strike Card |
| `GET /api/languages/:username` | Get Language Card |
| `GET /api/achievements/:username` | Get Achievement Card |
| `GET /api/timeline/:username` | Get Contribution Timeline |
| `GET /api/streak/:username` | Get Streak Card |
| `GET /api/flukebase/:username` | Get Flukebase Profile Card |
| `GET /api/flukebase-stats/:username` | Get Flukebase Stats Card |
| `GET /api/health` | Health check |

### Response

All card endpoints return SVG images with appropriate caching headers.

## Roadmap

- [x] Core card visualizations
- [x] Multiple themes
- [x] Animation support
- [x] Achievement system
- [x] Flukebase.me integration
  - [x] Project showcase cards
  - [x] Collaboration agreement badges
  - [x] Cross-platform developer stats
- [ ] More card types
- [ ] Custom badge generation
- [ ] GitHub Actions workflow cards

## Flukebase.me Integration

GitHub Strike integrates with [Flukebase.me](https://flukebase.me) to display your project portfolio and collaboration stats.

### Flukebase Profile Card

Display your Flukebase projects and collaboration roles.

```markdown
![Flukebase](https://github-strike.vercel.app/api/flukebase/YOUR_USERNAME)
```

| Parameter | Description | Default |
|-----------|-------------|---------|
| `hide_projects` | Hide project list | `false` |
| `hide_collaborations` | Hide collaboration badges | `false` |
| `max_projects` | Maximum projects to show | `3` |
| `theme` | Card theme | `electric` |

### Flukebase Stats Card

Compact view of your Flukebase statistics.

```markdown
![Flukebase Stats](https://github-strike.vercel.app/api/flukebase-stats/YOUR_USERNAME)
```

**Project Stages:**
- 🔘 Idea - Initial concept stage
- 🔵 Prototype - Building proof of concept
- 🟡 Development - Active development
- 🟢 Launched - Live and running

**Collaboration Roles:**
- ⭐ Owner - Project creator
- 🔵 Collaborator - Active team member
- 🟢 Contributor - External contributor

### Environment Variables for Flukebase

To enable full Flukebase integration, add these to your `.env`:

```bash
FLUKEBASE_API_KEY=your_api_key
FLUKEBASE_API_URL=https://api.flukebase.me
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

Inspired by:
- [github-readme-stats](https://github.com/anuraghazra/github-readme-stats)
- [github-profile-trophy](https://github.com/ryo-ma/github-profile-trophy)
- [github-stats](https://github.com/jstrieb/github-stats)

---

Made with ⚡ by [cancelei](https://github.com/cancelei) | Powered by [Flukebase](https://flukebase.me)
