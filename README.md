# SprinkFlow — Fire Sprinkler Hydraulic Calculator

**Free, browser-based fire sprinkler hydraulic calculations — NFPA 13 in your browser, no install required.**

![SprinkFlow Screenshot](docs/screenshot.png)

## What It Does

SprinkFlow replaces expensive desktop hydraulic calculation software with a modern web tool. Build your sprinkler system as a node graph, click Calculate, and get pressure/flow results at every node — with a printable NFPA 13 worksheet.

## Features

- **Visual pipe network editor** — drag-and-drop sprinkler heads, junctions, risers, and water supplies onto an SVG canvas
- **Hazen-Williams friction loss** — `hf = 4.52 × Q^1.85 / (C^1.85 × d^4.87)` psi/ft
- **Sprinkler discharge** — `Q = K × √P` with standard K-factors (K=5.6, 8.0, etc.)
- **Elevation pressure** — automatic elevation head calculation between nodes
- **Tree system solver** — backward hydraulic calculation from remote heads to riser
- **Supply vs demand** — flow test interpolation with pass/fail status
- **Hazard classifications** — Light, OH-1, OH-2, EH-1, EH-2 per NFPA 13
- **Printable worksheet** — NFPA 13 format calculation sheet
- **Built-in samples** — Light Hazard Office, OH-1 Retail, OH-2 Warehouse, High-Rise, Residential
- **Light & dark theme**

## Quick Start

```bash
pnpm install
cd packages/web && pnpm dev
```

Open http://localhost:1430, load a sample from 📂 Samples, and click ▶ Calculate.
