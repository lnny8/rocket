# ROCKET // NEO TERMINAL FEED

```txt
╔══════════════════════════════════════════════════════════════╗
║  NEXT.JS + NASA NEO + THREE.JS + ASCII UI                   ║
║  Shows today's near-Earth objects (sorted by distance)       ║
╚══════════════════════════════════════════════════════════════╝
```

## Overview

ROCKET is a terminal-style web dashboard that visualizes NASA NEO feed data for the current UTC day. It combines an ASCII-inspired UI with a 3D Earth/asteroid scene and lightweight text/scanline motion effects.

## How It Works

```txt
[app/page.tsx]
	│  fetches data on the server
	▼
[lib/nasa.ts] -- fetch --> https://api.nasa.gov/neo/rest/v1/feed
	│  maps + sorts by missDistanceKm
	▼
[UI]
 - ASCII stats + target list
 - 3D scene (Earth + asteroids) in React Three Fiber
 - GSAP animations for terminal feel
```

## Architecture

- Server-first page rendering with an async `app/page.tsx`
- Data normalization + domain typing in `lib/nasa.ts`
- Client-side 3D rendering in `components/AsteroidExperience.tsx`
- Client-side motion/FX orchestration in `components/PageAnimations.tsx`
- Theme tokens + terminal visuals in `app/globals.css`

## Key Files

```txt
app/page.tsx                    -> Main page + server-side data fetch
lib/nasa.ts                     -> NASA API client + types + sorting
components/AsteroidExperience.tsx -> 3D scene + ASCII renderer
components/PageAnimations.tsx   -> GSAP text/glow tweens
app/globals.css                 -> terminal theme variables
```

## Dev Notes

- Page is `async` and renders using NASA data on the server.
- On API errors, the UI falls back to an empty list.
- Data source is the NeoWs daily feed and is sorted by closest approach distance.
