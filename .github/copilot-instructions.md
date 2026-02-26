---
applyTo: "**"
---
# SprinkCalc — Fire Sprinkler Hydraulic Calculator

## Domain
- Hazen-Williams friction loss: hf = 4.52 × Q^1.85 / (C^1.85 × d^4.87) psi/ft
- Sprinkler discharge: Q = K × √P (GPM)
- Elevation pressure: Pe = 0.433 × h (psi per ft)
- Pipe velocity: V = Q / (2.448 × d²) (ft/s)
- Tree system hydraulic solver: backward calc from remote heads to riser
- Supply vs demand analysis with flow test interpolation

## Reference Data
- Schedule 40 steel pipe internal diameters (ANSI B36.10M)
- C-factors: steel=120, copper=150, CPVC=150
- Fitting equivalent lengths (NFPA 13 Table 23.4.3.1.1)
- Hazard classifications: Light, OH-1, OH-2, EH-1, EH-2

## NFPA 13 Design Criteria
- Density/area curves per hazard class
- Max coverage per head: 100-225 ft² depending on hazard
- Hose stream allowances: 100-500 GPM
- Duration: 30-120 minutes

## Node Types
- Sprinkler head (K-factor, coverage area, elevation)
- Junction (pipe tee/cross)
- Riser (system feed point)
- Water Supply (static/residual pressure, flow test)

## Validation Sources
- Canute LLP worked examples
- StudyLib published problems
- NSVSoft hydraulic calculation worksheets
- MEPBase online calculator



# Code Implementation Flow

<important>Mandatory Development Loop (non-negotiable)</important>

## Git Workflow
- **Work directly on master** — solo developer, no branch overhead
- **Commit after every completed unit of work** — never leave working code uncommitted
- **Push after each work session** — remote backup is non-negotiable
- **Tag milestones**: `git tag v0.1.0-mvp` when deploying or reaching a checkpoint
- **Branch only for risky experiments** you might discard — delete after merge or abandon

## Preparation & Definitions
- Use Typescript as default language, unless told otherwise
- Work using TDD with red/green flow ALWAYS
- If its a webapp: Add always Playwright E2E tests
- Separate domain logic from CLI/UI/WebAPI, unless told otherwise
- Every UI/WebAPI feature should have parity with a CLI way of testing that feature

## Validation
After completing any feature:
- Run all new unit tests, validate coverage is over 90%
- Use cli to test new feature
- If its a UI impacting feature: run all e2e tests
- If its a UI impacting feature: do a visual validation using Playwright MCP, take screenshots as you tests and review the screenshots to verify visually all e2e flows and the new feature. <important>If Playwright MCP is not available stop and let the user know</important>

If any of the validations step fail, fix the underlying issue.

## Finishing
- Update documentation for the project based on changes
- <important>Always commit after you finish your work with a message that explain both what is done, the context and a trail of the though process you made </important>


# Deployment

- git push master branch will trigger CI/CD in Github
- CI/CD in Github will run tests, if they pass it will be deployed to Vercel https://sprinkflow.vercel.app/
- Umami analytics and Feedback form with Supabase database