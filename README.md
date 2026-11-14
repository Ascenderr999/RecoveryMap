# RecoveryMap — RANGERS

**Recovery Beyond Gravity.** A recovery-plan and functional-monitoring companion for gravity transitions during future exploration missions, built for the NASA Space Apps Challenge 2026 hackathon. React application with profile-isolated local records, specialist-authored plan import, manual measurements, and transparent baseline comparisons. This is not a NASA-endorsed or clinically validated medical product.

## Development

Requires Node.js 24 and pnpm 11. npm is not installed on the development machine.

```sh
pnpm install
pnpm dev
```

Open http://127.0.0.1:5173. Production checks and preview:

```sh
pnpm test
pnpm build
pnpm preview
```

Preview: http://127.0.0.1:4173. Vercel uses `pnpm build`, output `dist`; SPA rewrites are included. A push to `main` may trigger the user's connected deployment, but pushing alone does not confirm deployment success.

## Implemented

- **Reference design:** supplied `design-reference/RecoveryMap/style.css` reused in `src/styles/reference.css`, with selector and local asset/font adaptations. The exact supplied Earth asset is copied without recompression. The masthead, sidebar, profile, hero crop, card surfaces, navigation, and responsive behavior follow the supplied source. React-specific styles are in `bridge.css`. Fonts are bundled DM Sans and Manrope. Reduced-motion preferences are respected.
- **Exactly six primary screens:** Mission Control, Recovery Plan (Library tab), Functional Assessment, Recovery Gap, Progress & Reports (History tab), NASA Research & Settings. `/library`, `/history`, and `/settings` redirect to their merged tabs.
- **EN/AZ:** English defaults for new users. Language persists in `localStorage`. Central Azerbaijani dictionary: `src/i18n/az.json`. Switching changes presentation without remounting forms, changing profiles, or altering saved source text.
- **Prompt 01:** CSV, TXT, text PDF, and DOCX import processed locally. Editable preview and explicit author/title requirements precede saving. All activity fields remain editable. Explicit comma-separated mission days activate the reviewed schedule; frequency prose is never automatically interpreted. Existing records remain intact. Image-only PDFs report that OCR is unavailable. File limit 15 MB; PDF limit 100 pages; plan limit 200 activities.
- **Prompt 02:** force (N), mobility time (s), balance duration (s), coordination time (s), individual baselines, protocol IDs, dates, and notes. Profile-scoped charts and history update from saved values. Only observations matching each metric's baseline protocol and environment are compared; charts pair strength and mobility on exact dates. Existing records without a protocol use `standard` for compatibility.
- **Reports & preservation:** completion/skipping, session notes, adherence, exercise library, history, browser print, profile JSON/measurement CSV export, validated full backup/restore with confirmation, and confirmed demo reset.
- **NASA CFT70 Research Replay:** locally bundled original NASA CSVs (238 force and 243 slalom rows), 35 participant IDs, 33 complete B/C-plus-first-POST comparisons, raw downloads, manifest hashes, and row-level provenance. Mean PRE B/C is required; A is excluded. Literal `NA` dates become null only in derived data. Participant/session selection is shared across screens; research records never acquire synthetic plans or adherence. See [DATA_PROVENANCE.md](DATA_PROVENANCE.md).

## Import examples

CSV headers: `exercise,instructions,sets,repetitions,duration,frequency,schedule,notes`. TXT can use `Exercise:`, `Instructions:`, `Sets:`, `Repetitions:`, `Duration:`, `Frequency:`, `Schedule:`, `Notes:`. Begin another `Exercise:` block for the next activity. Unstructured text stays as instructions and requires manual naming/review. Source fields remain in their authored language. PDF/DOCX layouts and tables may require manual correction; review against the original before scheduling.

Small **synthetic parser fixtures**, including a no-text PDF, are in `docs/samples`. `scripts/generate-import-fixtures.py` regenerates them with Python's standard library. They are testing examples, not medical plans.

## Data and calculations

In Personal Demo, three fictional demo profiles — Alex Morgan, Maya Chen, Daniel Rivera — retain separate sessions, plans, baselines, and assessment history in IndexedDB through Dexie. Initialization is idempotent. New optional fields preserve existing database records. No backend, authentication, analytics, API keys, or remote processing is used. External source links open NASA websites. Do not enter sensitive personal health information in this hackathon prototype.

For higher-is-better force: `current / baseline × 100`. For lower-is-better timed mobility: `baseline / current × 100`. Recovery Gap is the difference in **percentage points** between the two baseline-relative ratios (equivalently, their changes). It is descriptive, not a clinical recovery percentage or validated risk score. No diagnostic thresholds, prescriptions, automatic intensity changes, or outcome predictions are generated.

Personal-only adherence = completed / all assigned activities due through the fixed profile demo day. Skipped and pending activities remain in the denominator; future activities are excluded. Imported schedules are added only after explicit review.

The service worker precaches the production route bundles, Earth asset, local fonts, and parser worker. Cache revisions include asset content; cleanup is restricted to RecoveryMap caches. A first online visit and a browser supporting service workers are required. Clearing site storage or using private browsing may remove records. Keep a downloaded backup when records matter. The cache inventory check verifies every file in the generated `offline-manifest.json`, including both raw CSVs and derived JSON; `navigator.onLine` is not used as proof of readiness. End-to-end offline reload failed in the in-app browser after server shutdown despite a full cache; disconnected presentation remains unverified.

## Scientific sources and limits

- [NASA SM-204](https://humanresearchroadmap.nasa.gov/gaps/gap.aspx?i=695): post-landing self-administered assessment and rehabilitation research need.
- [NASA CFT70](https://nlsp.nasa.gov/explore/data/details/933d244c-5967-54ee-90c6-ce560da2108d?dataType=DATASETS): Earth-based analog study, not Mars or in-flight astronaut measurements; original files and descriptive replay are integrated.
- [NASA Human Research Program](https://www.nasa.gov/hrp/).
- [NASA Open Science Data Repository](https://osdr.nasa.gov/bio/repo).

Personal seed measurements and plans are synthetic; imported content and manual records have separate provenance. NASA observations are immutable supporting research evidence and are exported separately. Import is a parsing/review workflow, not verification of authorship or medical suitability. Camera/device tracking, OCR, cloud sync, and clinical validation are not implemented. PDF output uses browser printing.

See [verification notes](docs/verification.md) for executed checks and known verification limits.

## Research verification and handoff

Run `python scripts/verify_cft70.py` with Python 3 to check original hashes, 9-column schemas, counts, missing dates, B/C baselines and all 9023 POST values. `pnpm test` independently checks source-row traceability, incompatible comparisons, exports, and the existing personal workflow. The app needs no Python or NASA API request during presentation. See [HANDOFF.md](HANDOFF.md), [DECISIONS.md](DECISIONS.md), [TASKS.md](TASKS.md), and [HACKATHON_LOG.md](HACKATHON_LOG.md). The supplied input kit remains unchanged.

NASA raw time change is `100*(currentTime/baselineTime-1)`, while inverse-time performance change is `100*(baselineTime/currentTime-1)`. The descriptive gap subtracts the latter from force change, never the raw time change. No health-status cutoffs, participant prescriptions, Mars rescaling, injury scores, or EVA clearances are generated.

## Final workflow additions

Plans now retain linked reviewed versions and require explicit demo activation confirmation; upload never establishes verified specialist approval. Replacing a plan archives pending future activities, preserves completed/skipped history, and supports explicit ranges such as 1-45. Baseline changes retain dated history; manual edits retain revisions. New assessment CSV imports require metric,value,unit,date,protocol,environment,notes and are reviewed before atomic save. Legacy unspecified protocols are labeled explicitly, not renamed to invented clinical protocols.

Reports use applied date/plan filters and provide genuinely downloadable local PDF (jsPDF with bundled OFL DM Sans), CSV and JSON, plus print layout. NASA explorer includes group/session filters and a real browser SHA-256 check. Current final results and remaining offline limitation: TEST_REPORT.md, FINAL_AUDIT.md, FINAL_EXECUTION_CHECKLIST.md, FINAL_HANDOFF.md. See DEMO_SCRIPT.md and SUBMISSION_SUMMARY.md for the demonstration.
