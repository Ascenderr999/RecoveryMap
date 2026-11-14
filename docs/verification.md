# Verification — reference design and bilingual recovery features

14 November 2026 · Windows · Node.js 24.22.1 · pnpm 11.25.0.

- `pnpm test`: **16 tests passed**, 4 test files. Covers baseline direction/percentage points, exact-date pairing, incompatible protocols, due-session adherence, assessment validation, IndexedDB initialization/reopening/reset/profile isolation, offline handlers, quoted multiline CSV, unstructured TXT, authored caution preservation, DOCX line breaks, and backup validation.
- `pnpm build`: TypeScript, Vite production build, and content-revisioned offline asset preparation succeeded.
- Reference source `design-reference/RecoveryMap` was read directly. CSS is reused with React selectors/local font adaptations; the supplied Earth WebP was copied without recompression. No source-reference files were modified.
- Browser: desktop Earth hero, source layout, eight navigation links, and EN/AZ translations inspected. An unfinished plan retained its title and fields when switching languages. CSV and text PDF fixtures reached review with their original instructions and schedules. A no-text PDF showed the explicit OCR-unavailable message. DOCX soft-break extraction passed both the browser review check and an actual Mammoth conversion regression test. The final 390px Azerbaijani dashboard had no horizontal page overflow and no captured console warnings/errors.
- Existing profile-local persistence and completion logic were retained; imported plans require author/title review and explicit day scheduling. UI source content and form values are not overwritten by language changes.
- Official NASA HRP and SM-204 pages were accessed. CFT70's participant dataset page was inaccessible; participant-level integration is pending. No participant values were invented or integrated into demo charts. OSDR is linked as an official repository.

Limits: full pixel-by-pixel comparison across every route, physical print/PDF output, and complete airplane-mode browser operation were not verified. The service-worker lifecycle and asset precaching are tested/implemented; browser support and an initial online visit remain prerequisites. Scanned PDFs have no OCR. Complex PDF/DOCX layouts require review. Import does not establish medical suitability or authenticate a specialist.

The provided Vercel URL is the production destination. Git push does not itself establish deployment success; the final task response reports whether the updated production build was confirmed.

## CFT70 integration milestone — 14 November 2026, 17:51 Asia/Baku

This section supersedes the earlier milestone's integration-pending and eight-navigation-entry status; the historical record above is retained.

Executed on Windows with Node.js 24.22.1 and pnpm 11.25.0:

- `pnpm test`: 42 tests passed across 6 files (final rerun recorded in HACKATHON_LOG.md). Covers original hashes/schema/rows, 33 first-POST pairs, all 9023 fixtures, required B/C, incompatible participant/protocol/units/environment, nullable dates, source-specific exports, IndexedDB, import/backup and offline handler behavior.
- `pnpm build`: TypeScript and Vite succeeded; 49 files included in the generated content-hashed offline manifest, including all lazy routes and research CSV/JSON. Final build revision: `d4ed85064f56`.
- `& 'C:/Users/LENOVO/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe' scripts/verify_cft70.py`: passed. 238 force / 243 slalom rows, 35 IDs each, 33 complete paired first-POST cases, 14 missing dates per source. Exact 9023 D: force -0.6886181728664509%, raw time +28.15863359850257%, inverse-time performance -21.97170241898676%, gap +21.283084246120307 pp.
- All 49 manifest resources returned successfully from the local production preview before shutdown.
- Browser on isolated port 4175: 9023/D remained selected across Mission Control, Gap and Reports; raw units and 21.28 pp displayed correctly. Research plan and assessment were read-only with no synthetic completion controls. Both raw source downloads were linked; an actual downloaded force CSV matched its original SHA-256. Explorer showed 35 IDs, 238/243 rows, 33 pairs and 14 missing dates per file.
- EN/AZ navigation, merged Library/History/settings tabs and legacy redirects were exercised. A reviewed synthetic CSV plan was explicitly scheduled and a session completed with notes; status survived refresh. Existing personal records at other origins were untouched. NASA mode never attached this session to participant 9023. No console warnings/errors were captured during these online checks.

**Unresolved offline acceptance item:** after an initial online load on both port 4175 and a clean port 4176, the app confirmed 49 cached files and a service-worker controller. Stopping the preview server was independently confirmed by failed HTTP connection. Reload in the in-app browser produced a blank shell, so offline reload and navigation across six screens did NOT pass. A cache indicator verifies cache contents, not end-to-end offline operation. Cache-first asset fallback and non-success HTTP fallback are implemented and unit-tested, but this browser result remains an explicit limitation; do not claim airplane-mode readiness.

Physical print/PDF output and a separate installed-browser offline run were not verified. No camera work, OCR, clinical validation, Mars conversion or NASA participant prescription was added. No deployment was performed.
