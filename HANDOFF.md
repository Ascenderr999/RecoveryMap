# RecoveryMap handoff

Read `DATA_PROVENANCE.md` before modifying research calculations or claims. The original user-supplied kit is preserved in `RecoveryMap_Urgent_Data_2026-11-14/`; only repository copies are adapted. No pre-existing project memory/provenance files were found at this milestone's start.

## Six screens

- `/`: Personal Demo or NASA CFT70 Research Replay; shared participant/session controls. Research defaults to ID 9023, POST D.
- `/plan`: reviewed import, explicit schedule, completion/skipping/notes; Library secondary tab. Research mode provides no participant plan and offers an explicit transition to the personal demo.
- `/assessment`: personal manual values/baselines/protocol/environment and read-only research observations. Force requires an external device.
- `/gap`: raw units, B/C source rows, matched POST trajectory, paired bars, formulas, missing-data reasons.
- `/reports`: source-specific summary/history, CSV/JSON and print. Research reports never include personal sessions.
- `/research`: data explorer, original downloads, hashes/API links, sources, and local settings. Personal reset cannot mutate research.

Legacy bookmarks: `/library` → `/plan?tab=library`; `/history` → `/reports?tab=history`; `/settings` → `/research?tab=settings`.

## Run and verify

```sh
pnpm install
pnpm test
pnpm build
pnpm preview --port 4175 --strictPort
```

Use the standard-library Python verifier when Python is on PATH: `python scripts/verify_cft70.py`. On this development machine the bundled interpreter is `C:/Users/LENOVO/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`.

Core code: `src/research/model.ts`, `calculations.ts`, `ResearchContext.tsx`, `ResearchViews.tsx`, `DataExplorer.tsx`, `ModeBar.tsx`. Raw assets and source manifest: `public/data/cft70/`. Offline manifest generation: `scripts/cache-assets.mjs`.

The isolated browser QA origin uses port 4175 so existing user records at other origins/ports remain untouched. Check `docs/verification.md` and `HACKATHON_LOG.md` for actual results; do not reuse earlier milestone counts as current verification.

Boundaries: no OCR, force sensing, diagnosis, outcome prediction, automatic exercise prescription, or validated clinical recovery percentage. Imported layouts still require review. Physical print/PDF output and wider redistribution terms need separate review; no claim of successful production deployment is made from a Git push.

Offline blocker: the in-app browser could not reload with the preview server stopped, even after the complete cache/controller check. Treat the cache indicator as a resource inventory check, not proof of end-to-end readiness. See docs/verification.md before a disconnected presentation.
