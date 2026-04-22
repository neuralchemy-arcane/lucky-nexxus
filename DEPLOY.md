# Lucky Nexus - Permanent Hosting Guide

## Quick Deploy (Choose One)

### Option A: Vercel (Recommended - Free Forever)
1. Push this project to a GitHub repository
2. Go to [vercel.com](https://vercel.com) and sign up (free)
3. Click "Add New Project" 
4. Import your GitHub repo
5. Click "Deploy" - done! Your site is live permanently.

**Auto-updates**: Every time you push to GitHub, Vercel auto-redeploys.

### Option B: Netlify (Free Forever)
1. Push this project to a GitHub repository
2. Go to [netlify.com](https://netlify.com) and sign up (free)
3. Click "Add new site" → "Import an existing project"
4. Select your GitHub repo
5. Build command: `npm run build`
6. Publish directory: `dist`
7. Click "Deploy site" - done!

### Option C: GitHub Pages (Free Forever)
1. Push this project to a GitHub repository
2. Go to Settings → Pages
3. Source: GitHub Actions
4. The `.github/workflows/deploy.yml` is already included
5. Enable it in the Actions tab

### Option D: Run Locally (No Internet Required)
```bash
npm install
npm run build
npx serve dist
# Opens at http://localhost:3000
```

## What's Included

- `dist/` - Pre-built static files (ready to upload anywhere)
- `vercel.json` - Vercel configuration
- `netlify.toml` - Netlify configuration
- `.github/workflows/` - GitHub Actions for auto-deployment
- `scripts/` - Python scraper + predictor (for data updates)
- All 6 AI prediction models run **client-side** in the browser

## Data Files

The prediction engine loads historical data from:
- `public/data/lotto_data.json` (2,583 draws)
- `public/data/plus1_data.json` (2,278 draws)
- `public/data/plus2_data.json` (907 draws)
- `public/data/powerball_data.json` (1,711 draws)

## Features

- 6-model ensemble AI (Markov + Random Forest + Frequency + Gap + Pair + Trend)
- 20 prediction strategies per game
- Auto-refresh every 30 minutes
- 3D animated hero with Three.js
- Interactive frequency heatmap
- Hot/cold number analysis
- Fully responsive dark-mode UI
