# SprinkFlow — Demo Guide

A step-by-step walkthrough of how to use SprinkFlow to design and calculate a fire sprinkler system.

---

## Step 1: Launch the App

When you first open SprinkFlow, you'll see the empty workspace with three panels:

- **Left** — Component palette (Sprinkler, Junction, Riser, Supply)
- **Center** — Canvas diagram area with grid
- **Right** — Properties panel (empty until you select something)

The toolbar at the top has: New, Open, Save, Undo/Redo, ▶ Calculate, 📄 Worksheet, and a hazard class selector.

![Empty app](../screenshots/demo-01-empty.png)

---

## Step 2: Place Your Components

Drag components from the left palette onto the canvas to build your sprinkler system:

1. **Supply (W)** — represents your water supply source (city main, fire pump, tank). Has static pressure, residual pressure, and flow test data.
2. **Riser (R)** — the vertical pipe that feeds the sprinkler system. Set its elevation.
3. **Junction (J)** — a pipe tee or cross where flow splits to multiple branches.
4. **Sprinkler (S)** — individual sprinkler heads. Each has a K-factor and coverage area.

For this demo, we placed: 1 Supply, 1 Riser, 1 Junction, and 3 Sprinkler heads.

![Nodes placed on canvas](../screenshots/demo-02-nodes-placed.png)

---

## Step 3: Connect With Pipes

Connect nodes by clicking the **bottom port** (green dot) of an upstream node, then clicking the **top port** of a downstream node. This creates a pipe segment between them.

Connect in flow order: **Supply → Riser → Junction → Sprinklers**

Each pipe link shows its nominal size label (default 1-1/4"). The status bar shows the pipe count.

![Connected pipe network](../screenshots/demo-03-connected.png)

---

## Step 4: Edit Properties

Click any node or pipe to see its properties in the right panel.

**Sprinkler heads** show:
- **Name** — label for identification
- **Elevation** — height in feet from reference datum
- **K-Factor** — discharge coefficient (standard values: 5.6, 8.0, 11.2, etc.)
- **Coverage** — area per sprinkler head in ft²

![Sprinkler properties](../screenshots/demo-04-properties.png)

**Pipes** show:
- **Nominal Size** — pipe diameter with internal diameter displayed
- **Length** — actual pipe length in feet
- **Material** — black steel (C=120), copper (C=150), CPVC (C=150), etc.

---

## Step 5: Run the Calculation

Click **▶ Calculate** to run the hydraulic analysis. The solver works backward from the most remote sprinkler head to the riser, computing:

- **Pressure and flow** at each sprinkler head
- **Friction loss** through each pipe segment (Hazen-Williams equation)
- **Elevation pressure** changes
- **Velocity** in each pipe
- **System demand** — total flow and pressure at the base of the riser

Results appear as badges on the diagram and in the **status bar** at the bottom showing:
- Sprinkler Demand (GPM @ psi)
- Hose Stream allowance
- Total Demand
- Supply adequacy (✅ Adequate / ❌ Inadequate)

![Calculation results](../screenshots/demo-05-results.png)

---

## Step 6: Inspect Pipe Results

Click any pipe after calculating to see detailed hydraulic results:

- **Flow** — water flow through the pipe (GPM)
- **Friction Loss** — pressure drop due to pipe friction (psi)
- **Elevation** — pressure change due to height difference (psi)
- **Total Loss** — combined friction + elevation (psi)
- **Velocity** — water velocity (ft/s) — flag if too high

You can change pipe size or material and re-calculate to optimize the design.

![Pipe results](../screenshots/demo-06-pipe-properties.png)

---

## Step 7: Dark Theme

Click the 🌙 / ☀️ button in the top-right to toggle between light and dark themes. All diagram colors, node badges, and result labels adapt automatically.

![Dark theme](../screenshots/demo-07-dark-theme.png)

---

## Step 8: Print the Calculation Worksheet

Click **📄 Worksheet** to open a printable NFPA 13-style hydraulic calculation sheet in a new window. It includes:

1. **Header** — Project name, occupancy classification, design density, hose stream allowance
2. **Sprinkler Head Summary** — K-factor, coverage, elevation, pressure, and flow for each head
3. **Pipe-by-Pipe Calculations** — 14-column table with pipe size, ID, C-factor, length, fittings, flow, friction per foot, total friction, elevation, total loss, velocity, and pressure
4. **System Demand Summary** — total sprinkler demand, hose stream, total demand, duration, required volume, and supply adequacy verdict

Click **🖨 Print** to send to your printer or save as PDF.

![Calculation worksheet](../screenshots/demo-08-worksheet.png)

---

## Quick Reference

### Hazard Classifications (NFPA 13)

| Hazard | Density | Area | Hose Stream | Duration |
|--------|---------|------|-------------|----------|
| Light | 0.10 GPM/ft² | 1,500 ft² | 100 GPM | 30 min |
| Ordinary Group 1 | 0.15 GPM/ft² | 1,500 ft² | 250 GPM | 60 min |
| Ordinary Group 2 | 0.20 GPM/ft² | 1,500 ft² | 250 GPM | 60 min |
| Extra Hazard 1 | 0.30 GPM/ft² | 2,500 ft² | 500 GPM | 90 min |
| Extra Hazard 2 | 0.40 GPM/ft² | 2,500 ft² | 500 GPM | 120 min |

### Key Equations

| Formula | Description |
|---------|-------------|
| `Q = K × √P` | Sprinkler discharge (GPM) |
| `hf = 4.52 × Q^1.85 / (C^1.85 × d^4.87)` | Hazen-Williams friction loss (psi/ft) |
| `Pe = 0.433 × h` | Elevation pressure (psi per ft) |
| `V = Q / (2.448 × d²)` | Pipe velocity (ft/s) |

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl+Z | Undo |
| Ctrl+Y | Redo |
| Alt+Click drag | Pan canvas |
| Mouse wheel | Zoom in/out |
