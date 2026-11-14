# Implementation decisions — 14 November 2026

1. Retain the existing React/TypeScript app, dark reference UI, EN/AZ dictionary, personal Dexie database, plan import/review, completion, notes, and manual measurement workflow.
2. Add a dedicated immutable `ResearchObservation` model and adapter. Do not coerce research sessions into dated personal `Assessment` records; missing dates remain null. Original CSVs are never edited.
3. Correct the supplied normalizer's `NA` date handling in derived output only. Keep the supplied package and original attribution unchanged.
4. Require both PRE B/C observations for each baseline; exclude A. Match participant, metric/task protocol, units, environment, and POST session/day. No fallback, interpolation, imputation, participant borrowing, or Mars scaling.
5. Show original N/s values first. Keep raw time change distinct from inverse-time task performance; compute the descriptive gap from force change minus inverse-time change. No medical thresholds.
6. Persist only mode/participant/session preferences in a separate localStorage key. Personal IndexedDB records are untouched by mode changes. Research data is a bundled read-only asset outside personal reset and backup/restore.
7. Default new workspaces to Personal Demo, with research selection prepared as 9023/D. Research plans, adherence, fatigue, symptoms, and completions are unavailable. An explicit action changes mode before opening the plan demo.
8. Keep exactly six primary routes. Merge Library into `/plan?tab=library`, History into `/reports?tab=history`, and settings into `/research?tab=settings`; redirect old bookmarks.
9. Compare personal baselines only when profile, metric, protocol, and measurement environment match. Legacy records retain the explicit `Personal demo / unspecified gravity` context; destination labels do not silently change gravity or convert data. Different mobility tasks require distinct protocol IDs.
10. Retain unknown imported repetitions/doses as blank. Review/authorship metadata is not authentication of a specialist. Personal and research CSV/JSON reports remain separate, with explicit source/method fields.
11. Build a content-hashed offline manifest of all app, parser, font, image, and data assets. Readiness requires checking every cached file, not `navigator.onLine` or registration alone.
12. Camera tracking is deferred. The browser never measures force in newtons, diagnoses, clears EVA, predicts Mars outcomes, or generates exercises.
