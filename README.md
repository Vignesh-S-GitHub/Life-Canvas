# Life Canvas

A beautiful, interactive web app that visualizes your entire life in months, weeks, or years. Every dot represents a unit of time - see how you've spent your life and what lies ahead.

![Life Canvas](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Hosted on](https://img.shields.io/badge/Hosted%20on-Cloudflare%20Pages-F38020?logo=cloudflarepages)

**Live:** [life-canvas.pages.dev](https://life-canvas.pages.dev)

## Features

- **Life Grid Visualization** - View your life as dots in months, weeks, or years
- **Heatmap Mode** - Color dots by decade for visual intensity mapping
- **Dark / Light Theme** - Full dark mode support with smooth transitions
- **Life Milestones** - Mark significant moments (graduation, marriage, etc.)
- **Life Goals** - Set future targets and see them on your grid
- **Fun Perspective** - See how many sunrises, full moons, seasons, and heartbeats you have left
- **Daily Countdown** - Days to next birthday, total days lived, days remaining
- **Charts & Analytics** - Donut chart, pie chart, and decades bar chart
- **Life Breakdown** - Customize hours/day for sleep, work, screen time, etc.
- **Animated Timeline** - Scroll through your decades with milestones
- **Country-based Life Expectancy** - Auto-fill based on country averages
- **Multiple Profiles** - Save different profiles with localStorage
- **Export Options** - Download as 4K PNG, copy stats, print view, or share
- **PWA Support** - Install as app, works offline
- **Motivational Quotes** - Random inspirational quotes on each visualization

## Tech Stack

- **HTML5** - Semantic markup
- **CSS3** - Custom properties, glass morphism, CSS Grid, Flexbox, 15+ keyframe animations
- **Vanilla JavaScript** - No frameworks or dependencies
- **Canvas API** - Pie chart and PNG export
- **SVG** - Donut chart, animated logo, background decorations
- **Service Worker** - Offline support and caching
- **Web App Manifest** - PWA installability

## Project Structure

```
Life-Reminder/
├── index.html        # Main HTML (single page)
├── styles.css        # All styles, themes, responsive, print
├── app.js            # Application logic (~1400 lines)
├── manifest.json     # PWA manifest
├── sw.js             # Service worker for offline support
├── wrangler.jsonc    # Cloudflare Workers config
└── README.md         # This file
```

## Deployment

This project is hosted on **Cloudflare Pages** using Cloudflare Workers static assets.

### Cloudflare Pages (Current)

The site is deployed via Wrangler with the config in `wrangler.jsonc`:

```bash
# Install Wrangler
npm install -g wrangler

# Deploy
wrangler deploy
```

### Other Options

#### Any Static Web Server

This is a static site - no build step needed. Simply serve the files from any web server.

```bash
# Python
python -m http.server 8080

# Node.js (install serve globally first)
npx serve .

# PHP
php -S localhost:8080
```

#### GitHub Pages

1. Push this repo to GitHub
2. Go to **Settings → Pages**
3. Set source to **main** branch, root folder
4. Your site will be live at `https://username.github.io/Life-Reminder/`

#### Netlify

1. Go to [netlify.com](https://netlify.com) and sign in
2. Drag and drop the project folder onto the deploy area
3. Your site is live instantly with a free URL

#### Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project directory
3. Follow the prompts - no configuration needed

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## License

MIT
