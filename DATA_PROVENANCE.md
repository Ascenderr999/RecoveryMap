# RecoveryMap data provenance

Implemented and locally verified on **14 November 2026**. No earlier verification date is claimed for this implementation.

## Source attribution retained

The user supplied `RecoveryMap_Urgent_Data_2026-11-14/`. Its README reports original NASA downloads during a 12 November audit and re-parsing on 14 November. That is the package author's attribution, not a claim that this implementation performed the earlier download. The original package is preserved unchanged as uncommitted input. An unchanged copy of its README is retained at `docs/cft70-source-kit-README.md`.

Official dataset: [NASA CFT70 Functional Task Test](https://nlsp.nasa.gov/explore/data/details/933d244c-5967-54ee-90c6-ce560da2108d?dataType=DATASETS).

[Exact dataset metadata API](https://nlsp.nasa.gov/api/v1/data/datasets/933d244c-5967-54ee-90c6-ce560da2108d/full). Archived metadata: `public/data/cft70/cft_metadata.json`.

| Original file | Rows | Columns | Distinct participant IDs | Missing Date markers | SHA-256 |
|---|---:|---:|---:|---:|---|
| force.csv | 238 | 9 | 35 | 14 | `296da01c055f15dd4410ddb8ae3ecd78ff515a26d4cb09ff6d81dbd17c2db947` |
| slalom.csv | 243 | 9 | 35 | 14 | `39fee8f94ebe647926ab3b4ab4a2113f8921674be7b152718c15d85442a0346b` |

- [Original force download API](https://nlsp.nasa.gov/api/v1/files/37bf8b59-9caf-52d8-99d6-b5c9e50cd4c1/download).
- [Original slalom download API](https://nlsp.nasa.gov/api/v1/files/ad489c35-7610-5065-866e-cd336256f5ad/download).

The raw copies at `public/data/cft70/raw/` are byte-identical to the supplied originals. Git text normalization is disabled for these CSVs. `manifest.json` retains their exact API URLs, hashes, counts, and participant counts. Tests independently re-parse every row and compare normalized values and identifiers to the original `ID` column. The browser-downloaded force CSV was also checked against its SHA-256.

## Normalization and immutable research model

`scripts/verify_cft70.py` is the supplied standard-library verifier adapted to repository paths, with independent hash/schema/date/count and 9023 assertions added. It writes derived JSON and the manifest, never modifies an existing raw CSV. It downloads the direct APIs only if raw files are missing; the app never needs a NASA request during presentation.

**Correction to the supplied normalizer:** the raw files encode missing dates as the literal `NA`. The supplied JSON preserved that as a string. The repository's derived JSON and typed adapter normalize those 28 markers to `null`. No calendar date is invented. Other source dates remain their original **US M/D/YYYY** strings. The supplied input package remains unchanged.

Each `ResearchObservation` carries source, original file and row ID, participant ID, literal group, session, phase, BR_Day, nullable date, metric, unit, value, environment, read-only flag, and a derived protocol tag. `CFT70:leg_force` and `CFT70:slalom_time` identify the source tasks; they do not assert that unpublished device details are known. Research observations and arrays are frozen. They are not stored in the personal IndexedDB database and cannot be changed by personal import, backup/restore, completion, or reset.

Environment: **Earth 70-day head-down-bed-rest analog**. These are not Mars, planetary-surface, or in-flight astronaut measurements. IDs are research identifiers, not invented astronaut identities. Group labels `Control`, `Ex`, `Ex&T`, and `Flywheel` remain literal; no treatment description or causal effect is invented.

## Baselines, matching, and descriptive calculations

- Baseline is the arithmetic mean of **both PRE B and PRE C** for the same participant and metric. A is familiarization and excluded. Missing/duplicate B or C means unavailable, never one-point fallback.
- POST D/E/F/G correspond to source BR_Day **0/1/6/11**. PRE BR_Day is phase-relative; its positive numbers are not post-recovery days. Charts use only recorded POST visits and session/day labels.
- Pair within participant, phase, session, BR_Day, protocol, units, and environment. Dates are not pairing keys. Missing pairs produce null chart values and a visible reason, never zero, interpolation, or borrowed observations.
- 33 participants have both required baselines and paired first POST D observations.

```text
forceChangePct = 100 * (currentForce / baselineForce - 1)
rawTimeChangePct = 100 * (currentTime / baselineTime - 1)
mobilityPerformanceChangePct = 100 * (baselineTime / currentTime - 1)
gapPercentagePoints = forceChangePct - mobilityPerformanceChangePct
```

All calculations retain JavaScript double precision; rounding is presentation only. Raw time change is not inverse-time performance change. The gap does not subtract the raw time change.

Participant **9023**: force baseline **3342.69424 N**; slalom baseline **8.548 s**.

| POST session | BR_Day | Force N | Slalom s |
|---|---:|---:|---:|
| D | 0 | 3319.67584 | 10.955 |
| E | 1 | 3209.0096 | 8.616 |
| F | 6 | 3473.13184 | 8.026 |
| G | 11 | 3372.20672 | 8.276 |

At D: force change **-0.6886181728664509%**; raw time change **+28.15863359850257%** (longer); inverse-time performance change **-21.97170241898676%**; gap **21.283084246120307 pp**. Ratios **99.31% force** and **78.03% inverse time** are clearly named task comparisons, not clinical recovery percentages. Direction describes this task, not clinical health status. There are no medical cutoffs or injury-risk labels.

## Real vs synthetic vs user content

| Inventory | Provenance | Editable? |
|---|---|---|
| 481 CFT70 observations / 35 IDs | Original NASA CSVs and traceable derived adapter | No |
| Alex Morgan, Maya Chen, Daniel Rivera and initial histories | Fictional synthetic demonstrations | Personal demo only |
| Imported plans | User-supplied CSV/TXT/PDF/DOCX, reviewed with original source name | Personal mode only; upload does not authenticate authorship |
| Manual assessments and session notes | User entry, profile-scoped with protocol/environment | Personal mode only |

No prescriptions, adherence, fatigue, symptoms, or medical outcomes exist in the research files. Research mode shows these as unavailable instead of borrowing demo records. Exports distinguish source types and include IDs, units, protocols, environment, method, and calculations. Personal and research exports are separate.

## Scientific context and attribution limits

[NASA SM-204](https://humanresearchroadmap.nasa.gov/gaps/gap.aspx?i=695) establishes a need for post-landing self-administered testing and rehabilitation research; it does not validate RecoveryMap.

[Post-Flight Reconditioning, NTRS 20240000802](https://ntrs.nasa.gov/citations/20240000802), a presentation attributed by NTRS to Danielle N. Anderson and Corey A. Twine, is a source/template reference, not a personal prescription for 9023 or another participant. The NTRS record notes public distribution and that portions may be copyright protected. No presentation content is republished as a participant treatment plan.

The supplied metadata did not establish a dataset-specific redistribution license. Retain NASA/source attribution and check original archive terms before wider redistribution. No NASA endorsement, clinical validation, Mars prediction, EVA clearance, automatic prescription, or gravity rescaling is claimed.

## Final master implementation verification — 14 November 2026, 22:09 Asia/Baku

Independently downloaded BOTH publicly accessible direct NASA file APIs into ignored test-results/ during this session, without credentials or modification of bundled raw files. SHA-256 of the newly downloaded force/slalom files exactly matched the pinned originals above. This establishes current public-file byte identity; it does not invent or verify the supplied package author's earlier acquisition timestamp. Dataset-specific redistribution terms remain unidentified and should be reviewed before wider redistribution.

Added backward-compatible personal baseline/revision history, reviewed plan versions, explicit user demo activation with specialistVerified=false, future schedule archival and source/category preservation. These are user workflow records, not research observations or NASA prescriptions. Missing personal task protocols are labeled PROTOCOL UNSPECIFIED. Synthetic example calculations remain unchanged and are covered in the final suite.

DM Sans font for PDF reports was obtained from the official google/fonts ofl/dmsans directory. The original OFL is bundled as public/assets/DM-Sans-OFL.txt; font at public/assets/dm-sans-report.ttf. It is used only for local PDF rendering, including Azerbaijani glyphs. No health data is transmitted during PDF generation.
