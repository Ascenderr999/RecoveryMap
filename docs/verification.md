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
