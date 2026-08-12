# ⚡ Kinetic Flow
### AI-Powered Real-Time Crowd Flow Intelligence Platform

> A production-grade crowd dynamics simulation dashboard built for mass-scale events like **Kumbh Mela**, **IPL**, and **Concert Arenas** — where WiFi, Bluetooth, and mobile networks are unavailable.

![Tech Stack](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react)
![Tech Stack](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?style=for-the-badge&logo=node.js)
![Tech Stack](https://img.shields.io/badge/AI-Hugging%20Face%20%2F%20Meta%20LLaMA-FF6B35?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Graphics-WebGL%20GLSL%20Shaders-FF0000?style=for-the-badge)

---

## 🎯 What Is Kinetic Flow?

Kinetic Flow is a **neural vector field simulation engine** that predicts crowd bottlenecks, calculates optimal rerouting paths, and visualises fluid-dynamics-style crowd movement on a live WebGL canvas.

The AI backend uses **Meta LLaMA 3 (8B)** via Hugging Face Inference API to generate spatial coordinate tensors (repeller / attractor force fields) based on:
- Venue layout
- Current crowd density
- Event schedule phase

These tensors directly drive the WebGL shader uniforms to create a real-time, physically-accurate crowd simulation.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                   KINETIC FLOW                      │
│                                                     │
│  React Frontend (Vite)                              │
│  ├── KineticFlowDashboard.jsx  ← Main control panel │
│  ├── VenueMapOverlay.jsx       ← SVG venue HUD      │
│  └── FluidShaderCanvas.jsx     ← WebGL GLSL engine  │
│                    │                                │
│                    │ HTTP (proxy via Vite)           │
│                    ▼                                │
│  Express Backend (Node.js)                          │
│  └── server.js                                      │
│       ├── POST /api/predict-bottleneck              │
│       │     └── Axios → HuggingFace API             │
│       │           (meta-llama/Meta-Llama-3-8B)      │
│       └── GET  /api/health                          │
└─────────────────────────────────────────────────────┘
```

---

## 🚫 The Network Problem (And Our Solution)

> **Judge Question:** "At Kumbh Mela or IPL, WiFi / Bluetooth / mobile networks are completely unavailable. How does your system collect crowd data?"

### Standard methods that FAIL at scale:
| Method | Why it fails |
|---|---|
| WiFi packet sniffing | 2.4GHz spectrum fully saturated |
| BLE RSSI counting | 2.4GHz band jammed, noise floor |
| Mobile network | 4G towers overloaded, SMS fails |

### Our spectrum-free alternatives:

#### 📷 Option A — Computer Vision Edge Node
```
[Existing CCTV] → [Jetson Nano running YOLOv8] → [Local Ethernet] → [Backend]
```
- Runs **completely offline** on-device
- Uses CCTV infrastructure already present at all major venues
- YOLOv8 counts persons per zone at 15–30 FPS
- No internet, no radio spectrum dependency
- **Cost:** ~₹8,000–15,000 per edge node

#### 📡 Option B — LoRa IR Beam Counters (865 MHz)
```
[IR Sensor at gate] → [LoRa SX1276 Node] → [LoRa Gateway] → [Wired LAN] → [Backend]
```
- Operates on **865 MHz Indian ISM band** — entirely separate from WiFi/BT spectrum
- Works across km-range distances, unaffected by crowd density
- Sends a simple integer (gate entry count) every 2 seconds
- **Cost:** ~₹1,500 per gate node

Both methods feed live crowd counts to the backend via **local Ethernet only** — zero internet or spectrum dependency.

---

## 🖥️ Features

| Feature | Description |
|---|---|
| **Neural Force Field Engine** | LLaMA 3 generates repeller/attractor coordinate tensors every 300ms |
| **WebGL Fluid Simulation** | Real-time GLSL shader with pressure, velocity and density uniforms |
| **Dynamic Venue Maps** | Distinct SVG HUD overlays for Railway Terminal, IPL Stadium, Concert Arena |
| **Route Divergence Matrix** | AI-driven bypass vectors divert crowd particles to safe exits |
| **CV / LoRa Sensor Mode** | Simulates spectrum-free edge node data ingestion |
| **SVG Blueprint Uploader** | Drag-and-drop custom venue map support |
| **Real-Time Telemetry** | Live TFLOPS, FPS, flow velocity, choke pressure metrics |
| **Fallback Physics Engine** | Full deterministic fallback if AI API is unavailable |

---

## 📁 Project Structure

```
GRAND PRIX/
├── backend/
│   ├── server.js           # Express API server + HuggingFace integration
│   ├── package.json
│   └── .env.example        # Environment variable template
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── KineticFlowDashboard.jsx   # Main control panel
│   │   │   ├── VenueMapOverlay.jsx        # SVG venue HUD + Route Matrix
│   │   │   └── FluidShaderCanvas.jsx      # WebGL shader canvas
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── .gitignore
├── .env.example            # Copy to backend/.env and fill HF_TOKEN
├── package.json            # Root monorepo scripts
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- A [Hugging Face account](https://huggingface.co) with API token

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/kinetic-flow.git
cd kinetic-flow
```

### 2. Set up environment variables
```bash
# Copy the example file
cp .env.example backend/.env

# Edit backend/.env and add your Hugging Face token
# HF_TOKEN=hf_your_token_here
```

> 🔑 Get your free token at: **https://huggingface.co/settings/tokens**

### 3. Install all dependencies
```bash
npm run install:all
```

### 4. Run the development server
```bash
# Starts both backend (port 3000) and frontend (port 5173) concurrently
npm run dev
```

Then open **http://localhost:5173**

---

## ⚙️ Environment Variables

| Variable | Required | Description |
|---|---|---|
| `HF_TOKEN` | ✅ Yes | Hugging Face API token for LLaMA 3 inference |
| `PORT` | ❌ No | Backend port (default: `3000`) |

> ⚠️ **Never commit your `.env` file.** It contains your private API key. The `.gitignore` is configured to exclude it automatically.

---

## 🧠 AI Model

The backend calls the **Meta LLaMA 3 8B Instruct** model via Hugging Face Inference API:

```
POST https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct
```

The model is prompted to act as a **mathematical physics engine**, returning strictly valid JSON with repeller and attractor coordinate tensors:

```json
{
  "repellers": [{ "x": 0.50, "y": 0.40, "force": 2.5, "radius": 0.18 }],
  "attractors": [{ "x": 0.15, "y": 0.85, "force": 1.9 }],
  "pressureMetrics": { "peakDensity": 88, "flowVelocity": 4.82 }
}
```

If the AI API is unavailable, a **deterministic physics fallback** kicks in automatically.

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Run frontend + backend concurrently |
| `npm run dev:backend` | Run backend only |
| `npm run dev:frontend` | Run frontend only |
| `npm run install:all` | Install dependencies for both packages |

---

## 🔧 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 5 |
| Styling | Vanilla CSS + Tailwind utility classes |
| Graphics | WebGL 1.0 / GLSL fragment shaders |
| Icons | Lucide React |
| Backend | Node.js 18+, Express 4 |
| HTTP Client | Axios |
| AI Inference | Hugging Face Inference API (LLaMA 3 8B) |
| Dev Tools | Concurrently, node --watch |

---

## 👥 Team

Built for **hackathon** — demonstrating real-time AI-driven crowd safety systems for large-scale Indian public events.

---

## 📄 License

MIT License — feel free to use, modify and distribute.
