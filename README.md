# RecoveryMap — RANGERS

Autonomous Post-Landing Recovery Companion, built as a **NASA Space Apps 2026 hackathon demonstration** by team **RANGERS**. A responsive mission-control workspace for recording adherence to assigned recovery activities and comparing measured strength with functional performance after simulated Moon, Mars, and Earth landings.

All three astronaut profiles, specialist identities, plans, and measurements are **fictional synthetic data**. No NASA astronaut records or CFT70 participant data are included. Plans demonstrate specialist-authored content within a fictional scenario; they are not real clinical prescriptions. RecoveryMap does not diagnose, prescribe, predict medical outcomes, or automatically adjust plans. NASA endorsement is not implied.

## Run locally

Requires Node.js 22.12+ (Node 24 supported) and pnpm 11+. This workspace uses pnpm because npm is unavailable on the development machine.

```sh
pnpm install
pnpm dev
```

Open **http://127.0.0.1:5173**. If that port is busy, Vite prints the next available port.

```sh
pnpm test
pnpm build
pnpm preview
```

Production preview: **http://127.0.0.1:4173**. `pnpm build` runs TypeScript, builds the app, and prepares a revisioned offline asset cache. A Vercel SPA rewrite is included; use `pnpm build` and output directory `dist`. This milestone does not deploy the app.

## Stack & structure

React 19, TypeScript, Vite, Tailwind CSS 3 plus custom design-system CSS, React Router, Recharts, Lucide React, Dexie/IndexedDB, Vitest, and fake-indexeddb. No backend, authentication, keys, external fonts, or telemetry. Rollup uses its official WebAssembly package through a pnpm override for compatibility with Windows Application Control.

- `src/types`: typed profile, assessment, session, and persisted-state models.
- `src/data`: deterministic seeds and metric definitions.
- `src/db`: atomic, idempotent initialization and persistence.
- `src/hooks`: shared state and selected-profile data isolation.
- `src/lib`: reproducible calculations and validation.
- `src/components`, `src/layouts`, `src/pages`, `src/styles`: shared UI and six routes.
- `public/sw.js`, `scripts/cache-assets.mjs`: offline app-shell support.

## Pages and interactions

1. **Mission Control** — profile-specific mission context, calculated metrics, baseline chart, daily activities, and recent activity.
2. **Recovery Plan** — fixed synthetic plan, daily schedule, complete/skip controls, fatigue/discomfort notes, and session history.
3. **Functional Assessment** — explicit-unit manual entries for force, timed mobility, balance duration, and timed coordination; baseline and history tables.
4. **Recovery Gap** — separate metric comparisons, paired-date strength/mobility trends, gap in percentage points, formulas, and limitations.
5. **Progress & Reports** — adherence, timeline, notes, assessment history, and browser print layout.
6. **Research & Settings** — primary research links, planned integration notice, profile/spacing settings, privacy, and confirmed reset.

Adherence = completed activities / all assigned activities due through the fixed demo day. Future activities are excluded. Strength baseline ratio = current / baseline × 100. Timed mobility baseline ratio = baseline / current × 100. The descriptive gap is strength change minus mobility change, in percentage points. Gap charts use **exact same-date pairs only**, without interpolation. Each metric/date may be entered once per profile; duplicate entries are rejected.

## Persistence, offline use & privacy

Changes are saved in this browser's IndexedDB before the interface confirms them. Initialization seeds once. Profile records remain separate. Reset replaces all local records with synthetic defaults after confirmation. The demo date is fixed by profile; it is not live mission information.

After a successful initial production visit and service-worker installation, the app shell and all route bundles are cached. Refresh once if needed to place the page under service-worker control. Development mode intentionally does not register the worker. Clearing site data or private browsing can remove local records. No personal health information should be entered. Opening external research links contacts those external websites.

## Limitations and next milestones

Technical input bounds are not physiological reference ranges. Measurements are manually entered; there is no medical-device integration. The gap is not a validated clinical score. There is no backend synchronization, user authentication, real specialist review, or cross-device backup. Sessions are seeded through demo day + 3 within an illustrative 30-day timeline.

- **Prompt 01:** specialist-authored document import, provenance, review, and daily recovery workflow. Typed sessions and isolated persistence provide the foundation; import must preserve authorship and never generate prescriptions.
- Later: evaluate NASA CFT70 integration with dataset permissions and protocol limitations; do not substitute analog data for astronaut evidence.
- **Prompt 04:** advanced CSV/PDF export. Browser print is available now.

Research references: [NASA CFT70 dataset](https://nlsp.nasa.gov/explore/data/details/933d244c-5967-54ee-90c6-ce560da2108d?dataType=DATASETS), [NASA Human Research Roadmap SM-204](https://humanresearchroadmap.nasa.gov/gaps/gap.aspx?i=695). **Research integration planned for a later milestone.**

## Verification record

See [docs/verification.md](docs/verification.md) for executed checks and browser observations. Full offline browser operation and physical print/PDF output remain unverified. The service-worker lifecycle is covered by automated tests; browsers without service-worker support retain local records but require a connection to load the app shell.
