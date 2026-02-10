# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Light Around Project** — a static GitHub Pages site for a social experiment where people pass lighters with QR codes around the world, post photos on social media, and get pinned on a map.

Live at: `https://lightaround.github.io`

## Architecture

Static site with no build step, no package manager, and no tests. All files are served directly by GitHub Pages.

- `index.html` — semantic HTML structure, references external CSS/JS
- `style.css` — complete stylesheet (CSS custom properties, glassmorphism, responsive, scroll animations)
- `app.js` — Leaflet map initialization, scroll-reveal (Intersection Observer), animated counters
- `data.js` — the `LOCATIONS` array that powers the map (this is the file you edit to add new sightings)
- `icon.png` — site favicon and hero image

### External dependencies (loaded via CDN)

- **Leaflet** — map library, loaded from `unpkg.com/leaflet`
- **CartoDB Dark Matter** — map tile layer (`basemaps.cartocdn.com`)
- **Inter font** — loaded from Google Fonts

### Adding a new map location

Edit `data.js` and append to the `LOCATIONS` array:
```js
{
  name: "City, Country",
  coords: [latitude, longitude],
  date: "YYYY-MM-DD",
  socialUrl: "https://...",  // optional
  username: "@handle"        // optional
}
```

Stats (location count, country count) are auto-calculated from this array.

### Submission collection workflow

Sightings come in via social media posts tagged `#LightAroundProject`. A Google Form can be linked from the commented-out button in `index.html` for direct submissions. Review submissions manually, then add approved entries to `data.js`.

## Development

Open `index.html` directly in a browser. For live reload, use any static file server (e.g., `python3 -m http.server`).

## Deployment

Deployed automatically via GitHub Pages from the `main` branch. Push to `main` to deploy.
