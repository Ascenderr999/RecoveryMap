# RecoveryMap — RANGERS

**Recovery Beyond Gravity.** An offline-first post-landing recovery companion for the NASA Space Apps Challenge 2026 hackathon. React application with profile-isolated local records, specialist-authored plan import, manual measurements, and transparent baseline comparisons. This is not a NASA-endorsed or clinically validated medical product.

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
- **Eight navigation pages:** Overview, Recovery Plan, Movement Tests, Recovery Gap Analysis, Exercise Library, Progress History, Reports, NASA & Sources. Profile/settings are also accessible through the sidebar and header.
- **EN/AZ:** English defaults for new users. Language persists in `localStorage`. Central Azerbaijani dictionary: `src/i18n/az.json`. Switching changes presentation without remounting forms, changing profiles, or altering saved source text.
- **Prompt 01:** CSV, TXT, text PDF, and DOCX import processed locally. Editable preview and explicit author/title requirements precede saving. All activity fields remain editable. Explicit comma-separated mission days activate the reviewed schedule; frequency prose is never automatically interpreted. Existing records remain intact. Image-only PDFs report that OCR is unavailable. File limit 15 MB; PDF limit 100 pages; plan limit 200 activities.
- **Prompt 02:** force (N), mobility time (s), balance duration (s), coordination time (s), individual baselines, protocol IDs, dates, and notes. Profile-scoped charts and history update from saved values. Only observations matching each metric's baseline protocol are compared; charts pair strength and mobility on exact dates. Existing records without a protocol use `standard` for compatibility.
- **Reports & preservation:** completion/skipping, session notes, adherence, exercise library, history, browser print, profile JSON/measurement CSV export, validated full backup/restore with confirmation, and confirmed demo reset.
- **Prompt 03:** official NASA source links and bilingual scientific context. CFT70 participant files could not be accessed and validated; integration remains pending. No research participant values were invented or combined with demo profiles.

## Import examples

CSV headers: `exercise,instructions,sets,repetitions,duration,frequency,schedule,notes`. TXT can use `Exercise:`, `Instructions:`, `Sets:`, `Repetitions:`, `Duration:`, `Frequency:`, `Schedule:`, `Notes:`. Begin another `Exercise:` block for the next activity. Unstructured text stays as instructions and requires manual naming/review. Source fields remain in their authored language. PDF/DOCX layouts and tables may require manual correction; review against the original before scheduling.

Small **synthetic parser fixtures**, including a no-text PDF, are in `docs/samples`. `scripts/generate-import-fixtures.py` regenerates them with Python's standard library. They are testing examples, not medical plans.

## Data and calculations

Three fictional demo profiles — Alex Morgan, Maya Chen, Daniel Rivera — retain separate sessions, plans, baselines, and assessment history in IndexedDB through Dexie. Initialization is idempotent. New optional fields preserve existing database records. No backend, authentication, analytics, API keys, or remote processing is used. External source links open NASA websites. Do not enter sensitive personal health information in this hackathon prototype.

For higher-is-better force: `current / baseline × 100`. For lower-is-better timed mobility: `baseline / current × 100`. Recovery Gap is the difference in **percentage points** between the two baseline-relative ratios (equivalently, their changes). It is descriptive, not a clinical recovery percentage or validated risk score. No diagnostic thresholds, prescriptions, automatic intensity changes, or outcome predictions are generated.

Adherence = completed / all assigned activities due through the fixed profile demo day. Skipped and pending activities remain in the denominator; future activities are excluded. Imported schedules are added only after explicit review.

The service worker precaches the production route bundles, Earth asset, local fonts, and parser worker. Cache revisions include asset content; cleanup is restricted to RecoveryMap caches. A first online visit and a browser supporting service workers are required. Clearing site storage or using private browsing may remove records. Keep a downloaded backup when records matter.

## Scientific sources and limits

- [NASA SM-204](https://humanresearchroadmap.nasa.gov/gaps/gap.aspx?i=695): post-landing self-administered assessment and rehabilitation research need.
- [NASA CFT70](https://nlsp.nasa.gov/explore/data/details/933d244c-5967-54ee-90c6-ce560da2108d?dataType=DATASETS): Earth-based analog study, not Mars astronaut data; participant-level integration pending.
- [NASA Human Research Program](https://www.nasa.gov/hrp/).
- [NASA Open Science Data Repository](https://osdr.nasa.gov/bio/repo).

All seeded measurements and plans are synthetic; imported content and manual records have separate provenance. Import is a parsing/review workflow, not verification of authorship or medical suitability. Camera/device tracking, OCR, cloud sync, and clinical validation are not implemented. PDF output uses browser printing.

See [verification notes](docs/verification.md) for executed checks and known verification limits.
