# Route Planner PWA

A mobile-first Progressive Web App that finds places of interest along your route. Enter your destination, add stops (bakery, pharmacy, coffee shop…), and the app sorts them by detour distance — so you always pick the one least out of your way.

Installable as a native-like Android app via Chrome.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Map & routing display | Leaflet.js + OpenStreetMap tiles |
| Route calculation | OpenRouteService API (free tier) |
| POI search | Overpass API (OSM data, ~130 categories) |
| Geocoding | Nominatim |
| Voice input | Web Speech API |
| Offline / PWA | Service Worker + Web App Manifest |
| Storage | localStorage |
| Build | None — pure HTML/CSS/JS |

---

## Key Features

- **Route planning** — enter any origin and destination (address, place name, map click, or saved location)
- **On-route POI search** — finds stops along your path, sorted by detour distance
- **130+ search categories** — bakery, café, pharmacy, bookstore, EV charger, vet, drinking fountain…
- **Voice input** — speak your destination or stop type (Chrome)
- **Multiple waypoints** — add several stops; the app auto-orders them (nearest first)
- **Arrival alert** — audio notification within 50 m of each waypoint and final destination
- **Real-time ETA** — estimated arrival recalculated from actual GPS speed (30 s rolling average, exponential smoothing)
- **Saved places** — store Home, Work, and custom locations for one-tap selection
- **Custom POIs** — add your own places with a search category (suggested even if not in OSM)
- **Continuous GPS tracking** — blue dot follows you without snapping the map view
- **Re-center button** — one tap returns the map to your current position
- **PWA** — add to home screen on Android, works offline after first load

---

## File Structure

```
├── index.html          # UI structure
├── style.css           # Mobile-first styles
├── manifest.json       # PWA manifest (name, icon, display mode)
├── sw.js               # Service Worker (offline cache)
├── deploy.bat          # One-click GitHub Pages deploy (Windows)
└── js/
    ├── app.js          # Main controller
    ├── map.js          # Leaflet map, GPS tracking, markers
    ├── places.js       # Overpass API search, detour calculation
    ├── routing.js      # OpenRouteService route requests
    ├── storage.js      # localStorage (saved places, custom POIs)
    └── speech.js       # Web Speech API voice input
```

---

## Setup

### 1. Get a free ORS API key

Register at [openrouteservice.org](https://openrouteservice.org/dev/#/signup), then paste your key into `js/routing.js`:

```js
ORS_API_KEY: 'your_key_here',
```

The free tier allows 2,000 route requests per day.

### 2. Run locally

No build step required. GPS and voice input need HTTPS — use VS Code Live Server or:

```bash
npx serve .
```

### 3. Deploy to GitHub Pages

```bash
git init
git remote add origin https://github.com/YOUR_USERNAME/route-planner-pwa.git
git add . && git commit -m "deploy" && git push -u origin main
```

Then: repo → Settings → Pages → Branch: `main`

### 4. Install as Android app

1. Open the GitHub Pages URL in **Chrome**
2. Tap "Add to Home Screen" when prompted
3. Launches like a native app — no browser bar

---

## Known Limitations

- OSM data completeness varies by city — rural areas may have sparse POI coverage
- No ratings or reviews (OSM is open data, not commercial)
- Voice input works reliably in Chrome only
- ORS free tier: 2,000 route requests/day
- Saved places stored in `localStorage` — per device and domain

---

## License

[CC BY-NC 4.0](LICENSE) — free to use for learning and non-commercial purposes.  
Portfolio project by [bvin81](https://github.com/bvin81).
