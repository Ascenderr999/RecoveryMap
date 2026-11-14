# Final handoff

RecoveryMap remains the existing six-screen React/TypeScript/Vite aerospace dashboard with local Dexie personal data and separate immutable NASA CFT70 assets. No second app/repository or extra primary routes were created. Original untracked input package was preserved.

```powershell
pnpm install
pnpm dev
# http://127.0.0.1:5173
pnpm test
pnpm build
pnpm preview
# http://127.0.0.1:4173
```

Run the original-data verifier with Python 3: `python scripts/verify_cft70.py`. This machine used `C:/Users/LENOVO/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`. Actual downloaded report consistency can be checked with `scripts/verify-report-downloads.py --pdf PATH --json PATH --csv PATH` (requires pypdf).

Key implementation modules: src/lib/planWorkflow.ts (versions/activation/archive), assessmentWorkflow.ts (history), assessmentImport.ts (atomic reviewed CSV), calculations.ts (shared dated/protocol comparisons), reportModel.ts (filtered source of truth), pdfReport.ts (real local PDF), src/research (immutable NASA adapter/calculations/explorer/export).

Manual regression: follow DEMO_SCRIPT.md. Before upgrading/resetting any meaningful local records, download a backup. New optional fields preserve old records; parseBackup validates versions/history without migrating/deleting existing records. Research assets are outside personal reset/restore.

Open acceptance: full disconnected application navigation still did not pass in the in-app browser. Static EN/AZ fallback is verified. Keep the preview server connected for the presentation until a target installed-browser offline run succeeds. Do not equate cached files with runtime readiness. No deployment success is inferred from a Git push; final response records exact Git/deployment status.

Verification and limitations: TEST_REPORT.md, FINAL_AUDIT.md, FINAL_EXECUTION_CHECKLIST.md. Scientific provenance/terms: DATA_VERIFICATION.md, DATA_PROVENANCE.md, NASA_DATA_SCHEMA.md. Source font license is bundled with the font.
