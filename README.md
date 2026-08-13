# Kinetic Flow

**Real-time AI crowd safety platform.** Predict bottlenecks, simulate evacuations, and save lives with spatial intelligence.

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Node](https://img.shields.io/badge/Node-≥18-green.svg)
![React](https://img.shields.io/badge/React-18.3-61DAFB.svg)
![WebGL](https://img.shields.io/badge/Rendering-WebGL-red.svg)
![AI](https://img.shields.io/badge/AI-Qwen_2.5_7B-purple.svg)

---

## Features

- **WebGL Fluid Simulation** — Real-time simplex noise velocity field with 8 AI-driven repellers and 4 attractors
- **A\* Pathfinding Engine** — Binary min-heap priority queue, multi-path routing (top 3 escape routes)
- **SVG Map Parser** — Upload custom venue maps, auto-detect walkable nodes and chokepoints
- **AI Congestion Prediction** — Hugging Face inference (Qwen 2.5 7B) with local physics fallback
- **4 Preset Venues** — Railway Terminal, IPL Stadium, Kumbh Mela Ghat, Music Festival
- **Sensor Simulation** — Online/Offline BLE sensor modes with Gaussian noise emulation

## Quick Start

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- **Hugging Face API token** (optional — local fallback works without it)

### 1. Clone & Install

```bash
git clone https://github.com/Just-DhruvSingh/Grand-prix.git
cd Grand-prix

# Install all dependencies
npm install
cd frontend && npm install && cd ..
cd backend && npm install && cd ..
```

### 2. Configure

```bash
cp .env.example backend/.env
# Edit backend/.env and add your HF_TOKEN
```

### 3. Run

```bash
# Terminal 1 — Backend (port 3001)
cd backend && node server.js

# Terminal 2 — Frontend (port 5173)
cd frontend && npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Architecture

```
├── frontend/              # Vite + React 18
│   ├── src/
│   │   ├── constants/     # Design tokens, venue presets
│   │   ├── lib/           # API client, utils, simplex noise
│   │   ├── hooks/         # Zustand store, prediction, A*, sensors
│   │   └── components/
│   │       ├── UI/        # Button, Slider, Toggle, Badge, Tooltip
│   │       ├── Canvas/    # WebGL shaders, fluid sim, canvas
│   │       ├── Map/       # SVG parser, NodeGraph, VenueMap
│   │       ├── Pathfinding/ # A* engine, path renderer, route panel
│   │       ├── Controls/  # Venue, crowd, phase, SVG upload, sensor
│   │       ├── Analytics/ # Metrics gauges, alerts, sparkline
│   │       └── Layout/    # Sidebar, TopBar, StatusLED
│   └── index.html
│
├── backend/               # Express 4.x
│   ├── services/          # HF client, prompt builder, response parser
│   ├── routes/            # health, predict, venues
│   ├── middleware/         # CORS, rate limiter, error handler
│   └── server.js          # Entry point (port 3001)
```

## API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Server status & uptime |
| `/api/predict-bottleneck` | POST | AI crowd analysis |
| `/api/venues` | GET | Preset venue configs |

## Design System

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#161310` | Main background |
| `--neon-cyan` | `#00F5FF` | Info, pathfinding |
| `--neon-amber` | `#FFB800` | Warnings, controls |
| `--neon-crimson` | `#FF2D55` | Danger, alerts |
| `--neon-green` | `#39FF14` | Success, exits |
| Font Heading | Space Grotesk | All headings |
| Font Data | JetBrains Mono | Data, code, stats |

## License

MIT
