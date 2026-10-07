<div align="center">

# 🌱 Life Canvas

### See your time. Remember your milestones. Make room for your goals.

**Vanilla JavaScript · HTML & CSS · Canvas & SVG · PWA**

[Open Life Canvas](https://life-canvas.shanmugamrenuga4.workers.dev/) · [Features](#-features) · [Run locally](#-run-locally) · [Deployment](#-deployment)

</div>

Life Canvas visualizes a lifespan as a grid of **weeks, months, or years**. Each dot represents a unit of time, making it easy to explore elapsed time, upcoming milestones, and future goals in one interactive view.

## ✨ Features

| Area | What you can explore |
|---|---|
| 🟢 Life grid | Switch between weeks, months, and years; highlight decades with heatmap mode |
| 🏁 Milestones & goals | Mark meaningful past events and future targets on your grid |
| 📊 Charts | Donut, pie, and decade charts, plus a configurable daily time breakdown |
| ⏰ Countdowns | Days lived, days to your next birthday, and time remaining within your chosen lifespan |
| 🌅 Perspective | Estimated sunrises, full moons, seasons, and heartbeats |
| 🗓️ Timeline | An animated journey through decades and milestones |
| 👤 Profiles | Multiple browser-local profiles, with country-based lifespan presets |
| 🎨 Appearance | Dark/light themes, responsive layout, transitions, and motivational quotes |
| 🖼️ Export | 4K PNG, copied statistics, print layout, and sharing options |
| 📱 App experience | Installable PWA with a service worker for offline support |

Lifespan presets and remaining-time figures are **illustrative estimates based on the selected inputs**, not predictions of an individual's lifespan. Use the app as a reflection and planning tool.

## 🚀 Run locally

Clone or download the repository, then serve the root directory with a static server. For example, with Python installed:

```bash
git clone https://github.com/Vignesh-S-GitHub/Life-Canvas.git
cd Life-Canvas
python -m http.server 8080
```

Open **http://localhost:8080**. There is no frontend build step or framework installation. Using HTTP on localhost also lets the browser exercise service worker behavior.

### First visit

1. Create or select a profile and enter the inputs used to visualize your time.
2. Choose weeks, months, or years and explore the grid.
3. Add milestones and goals; adjust the daily time breakdown.
4. Switch themes or heatmap mode, then export or print a view you want to keep.

## 🛠️ Technology

| Layer | Implementation |
|---|---|
| Structure | HTML5 |
| Styling | CSS custom properties, Grid, Flexbox, responsive and print styles |
| Interaction | Vanilla JavaScript |
| Visuals | Canvas charts/PNG export and SVG graphics |
| App shell | Web App Manifest and service worker |
| Current hosting configuration | Cloudflare Workers static assets via Wrangler |

## 📁 Project structure

```text
Life-Canvas/
├── index.html       # Main single-page interface
├── styles.css       # Themes, layout, animation, and print styles
├── app.js           # Visualization and interaction logic
├── manifest.json    # PWA manifest
├── sw.js            # Service worker
├── wrangler.jsonc   # Cloudflare deployment configuration
└── README.md
```

## 💾 Storage and offline use

Profiles are saved using **localStorage** in the current browser. They do not automatically synchronize across devices or browser profiles. Clearing site data can remove those profiles; export a view or copied statistics before resetting storage.

PWA installation and offline behavior depend on browser support and an initial visit that caches the app shell. HTTPS is required for hosted service workers; localhost is supported for development. Browser cache eviction can remove offline assets.

## 🌐 Deployment

The current documented live site is [life-canvas.shanmugamrenuga4.workers.dev](https://life-canvas.shanmugamrenuga4.workers.dev/). The repository includes **wrangler.jsonc** for Cloudflare Workers static asset deployment.

From an authenticated local environment with Wrangler available:

```bash
wrangler deploy
```

Review the existing configuration and your destination account before deployment.

Because the app is static, it can also be served by a standard web server or a static host such as GitHub Pages, Netlify, or Vercel. For GitHub Pages, choose **Settings → Pages → main → / (root)** and use the URL GitHub provides. Check asset paths and service worker scope when hosting under a repository subpath.

## 🔎 Development review

Use a modern Chrome, Edge, Firefox, or Safari browser. After changes, manually check profile save/restore, each grid mode, themes, milestones, goals, charts, exports, and print layout. Installation and native sharing controls vary by browser and device.

If an update looks stale, refresh the app so the browser loads the new assets and service worker. Review the browser's site storage settings when troubleshooting cached versions.

---

<p align="center"><sub>A visual reminder to give your time a purpose.</sub></p>
