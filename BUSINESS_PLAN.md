# SprinkFlow — Business Plan

## Executive Summary

SprinkFlow is a free, browser-based fire sprinkler hydraulic calculator targeting fire protection engineers and contractors who currently pay $3,000–$15,000/yr for desktop software. The engine implements Hazen-Williams friction loss, K-factor sprinkler discharge, elevation pressure adjustments, and supply/demand analysis — all validated against published NFPA 13 reference data. Today it solves tree (branch-line) systems only, which is a **fatal limitation** for real commercial buildings that use looped piping networks.

## Market Analysis

### Target Users
- Fire protection engineers (PE stamp holders)
- Sprinkler contractors (design-build firms)
- Fire marshal / plan review offices
- MEP engineering firms with fire protection divisions
- Students in fire protection engineering programs

### Competitor Landscape

| Product | Price | Strengths | Weaknesses |
|---------|-------|-----------|------------|
| HydraCalc | $5K–$15K/yr | Full loop solver, NFPA reports, industry standard | Expensive, dated UI, Windows-only |
| HASS | Enterprise | Deep NFPA integration, enterprise features | Cost prohibitive for small firms |
| Elite Fire | $3K–$8K/yr | Solid tree+loop, AutoCAD integration | Steep learning curve |
| Canute AutoSprink | ~$3K/yr | 3D modeling, BIM integration | Complex, overkill for simple jobs |
| **SprinkFlow** | **Free** | Modern web UI, correct math, cross-platform | **Tree-only (no loops)** |

### Market Size
- ~50,000 fire protection professionals in North America
- Global fire sprinkler system market: $15B+ annually
- Software spend: $150M–$300M/yr across design tools
- Addressable SaaS segment: ~$50M/yr (small-to-mid firms)

## Current State Assessment

### What Works (Phase 1 — Free Tier)
- **95 tests** (51 unit + 44 E2E) — strong quality foundation
- Hazen-Williams friction loss calculation (validated)
- K-factor sprinkler discharge (Q = K√P)
- Elevation pressure adjustments (0.433 psi/ft)
- Pipe velocity computation
- Tree system hydraulic solver (backward calc from remote heads)
- Supply vs demand analysis with flow test interpolation
- SVG diagram editor with drag-drop node placement
- Schedule 40 steel pipe database
- C-factor library (steel, copper, CPVC)
- Fitting equivalent lengths per NFPA 13

### Market Readiness Scores
| Metric | Score | Notes |
|--------|-------|-------|
| Professional Use | 45% | Tree-only blocks most real projects |
| Scales to Real Projects | 25% | No loops = no commercial buildings |
| Useful for Target Audience | 55% | Good for education and simple residential |
| Incremental Premium | 35% | Users would pay small amount for current features |
| Major Premium | 70% | Users would pay significantly with loop solver + reports |

### Critical Gap: Tree-Only Topology
> **The tree-only limitation makes SprinkFlow UNUSABLE for any real commercial building.** Nearly all commercial fire sprinkler systems use looped or gridded piping to balance flow across heads. Without a loop solver, the tool is restricted to simple residential branch-line systems — roughly 10% of the addressable market. **The Hardy-Cross loop solver is the single prerequisite that unlocks Phase 2 viability.**

## Product Roadmap

### Phase 1: Free Tier (Current)
**Price: Free forever** | **Status: Live**

Core tree-system hydraulic calculator for education and simple residential projects.

| Feature | Status |
|---------|--------|
| Hazen-Williams friction loss | ✅ Done |
| K-factor sprinkler discharge | ✅ Done |
| Elevation pressure | ✅ Done |
| Tree system solver | ✅ Done |
| Supply/demand analysis | ✅ Done |
| Flow test interpolation | ✅ Done |
| SVG diagram editor | ✅ Done |
| Pipe & fitting database | ✅ Done |
| Light/dark theme | ✅ Done |

### Phase 2: Professional — $199–$349/yr
**Target: Q3 2025** | **Theme: "Real Buildings"**

The loop solver unlocks commercial viability. NFPA report export makes it submittable to AHJs (Authorities Having Jurisdiction).

| Feature | Size | Priority | Description |
|---------|------|----------|-------------|
| Hardy-Cross loop solver | XL | 🔴 CRITICAL | Iterative balancing of looped/gridded pipe networks. This is the **single blocker** that prevents commercial use. Must handle gridded, looped, and combined tree+loop topologies. |
| NFPA 13 hydraulic worksheet export | L | High | Generate the standard hydraulic calculation worksheet required for plan submission. PDF output matching NFPA 13 Figure A.23.1. |
| Pipe schedule database | M | Medium | Complete NFPA pipe schedule tables (Schedule 10, 40, copper, CPVC) with automatic sizing per hazard class. |
| Multi-supply points | L | Medium | Support multiple water supply connections (dual risers, fire pump + city main) with combined supply curves. |

**Why Hardy-Cross is XL:**
- Requires reformulating the solver from backward-traversal to simultaneous network equations
- Head loss is nonlinear (Q^1.85) — requires iterative convergence
- Must handle mixed tree+loop topologies in a single system
- Convergence tuning for large networks (100+ nodes)
- Estimated: 4–6 weeks of focused engine work + 2 weeks testing

**Phase 2 Revenue Model:**
- 500 subscribers × $249/yr avg = $124,500/yr
- Break-even: ~200 subscribers
- Conversion target: 5% of free users

### Phase 3: Enterprise — $499–$899/yr
**Target: 2026** | **Theme: "Full Workflow"**

Compete head-to-head with HydraCalc and Elite Fire on features, at 1/10th the price.

| Feature | Size | Priority | Description |
|---------|------|----------|-------------|
| AutoCAD/Revit import | XL | High | Import DWG/RVT floor plans as background for sprinkler layout. Parse existing pipe geometry from MEP models. |
| 3D pipe routing | XL | High | Three-dimensional pipe network modeling with automatic isometric generation. Elevation-aware routing. |
| Code compliance checker | L | Medium | Automated NFPA 13 compliance validation: head spacing, coverage area, obstruction rules, water supply adequacy. |
| Deluge/pre-action systems | L | Medium | Support for deluge valves, pre-action systems, and dry-pipe systems beyond standard wet-pipe. |
| Sprinkler layout automation | XL | High | Auto-place sprinkler heads based on hazard class, coverage rules, and obstruction geometry. |

**Phase 3 Revenue Model:**
- 300 subscribers × $699/yr avg = $209,700/yr
- Combined with Phase 2: $334,200/yr potential

## Pricing Strategy

| Tier | Price | Features | Target User |
|------|-------|----------|-------------|
| Free | $0 | Tree solver, basic diagram, pipe database | Students, simple residential |
| Professional | $199–$349/yr | + Loop solver, NFPA reports, pipe schedules, multi-supply | Engineers, contractors |
| Enterprise | $499–$899/yr | + CAD import, 3D routing, compliance checker, all system types | Large firms, design-build |

**Pricing rationale:** HydraCalc charges $5K–$15K/yr. At $349/yr, SprinkFlow is 93% cheaper — an easy sell for small firms and solo practitioners who currently can't justify $5K+ tools.

## Technical Architecture

### Engine (`packages/engine`)
- Pure TypeScript, zero DOM dependencies
- Hazen-Williams solver with iterative convergence
- Pipe network as directed graph (nodes + links)
- Phase 2: Hardy-Cross loop detection + simultaneous equation solver
- Runs in browser and Node.js (CLI parity)

### Web (`packages/web`)
- React + Vite + Zustand
- SVG canvas with pan/zoom/drag-drop
- Property panel for node/link parameters
- Results displayed as badges on diagram elements
- Light/dark theme via CSS custom properties

### CLI (`packages/cli`)
- Node.js runner for batch hydraulic calculations
- JSON input/output for automated testing
- Validation against published reference data

## Go-to-Market Strategy

### Phase 1 (Now)
1. **SEO content**: "Free fire sprinkler hydraulic calculator" — no competition in this keyword
2. **Engineering forums**: Engage on r/firePE, Eng-Tips fire protection subforum
3. **YouTube tutorials**: "How to calculate fire sprinkler hydraulics" with SprinkFlow demos
4. **University outreach**: Free tool for fire protection engineering courses (Oklahoma State, WPI, UMD)

### Phase 2 (With Loop Solver)
1. **Conference demos**: NFPA Conference & Expo, AFSA Convention
2. **Free trial**: 30-day full access to Professional tier
3. **Contractor partnerships**: Offer bulk pricing for design-build firms
4. **Comparison content**: "SprinkFlow vs HydraCalc" — feature parity at 1/10th price

### Phase 3 (Enterprise)
1. **BIM integration marketing**: Target Revit/AutoCAD users frustrated with expensive add-ons
2. **AHJ partnerships**: Get listed as accepted calculation software in jurisdictions
3. **Enterprise sales**: Direct outreach to top 100 fire protection firms

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Hardy-Cross convergence on large networks | High | Extensive testing against HydraCalc output; fallback to damped iteration |
| NFPA 13 report format changes | Medium | Template-based PDF generation; easy to update |
| Competitor price cuts in response | Low | Already at $0 for free tier; cost structure is near-zero |
| AHJ rejection of web-based calc software | Medium | Generate identical NFPA worksheet format; PE stamp is on the engineer, not the tool |
| Browser performance on 500+ node systems | Medium | Web Worker offloading; sparse matrix solver for large networks |

## Key Metrics

| Metric | Phase 1 Target | Phase 2 Target | Phase 3 Target |
|--------|---------------|---------------|---------------|
| Monthly active users | 500 | 2,000 | 5,000 |
| Paid subscribers | — | 500 | 800 |
| Annual revenue | $0 | $124K | $334K |
| Test coverage | 90%+ | 90%+ | 90%+ |
| NPS score | — | 40+ | 50+ |

## Summary

SprinkFlow has solid mathematical foundations and a clean UI, but the **tree-only topology is a fatal limitation** that caps the addressable market at ~10%. The Hardy-Cross loop solver is the single most important engineering investment — it transforms SprinkFlow from an educational toy into a professional tool that can compete with $5K–$15K incumbents at a fraction of the cost. With the loop solver and NFPA report export, SprinkFlow becomes immediately viable for the $50M/yr fire protection design software market.
