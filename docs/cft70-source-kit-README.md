# RecoveryMap — urgent data kit / 14 November 2026

Read IMPLEMENTATION_PROMPT.md first. Raw NASA files were downloaded during the 12 November audit and re-parsed on 14 November. Source URLs and SHA-256 values are in manifest.json. Access was unauthenticated. A dataset-specific redistribution license was not identified in the inspected metadata; retain source attribution and check the original archive terms before wider redistribution.

Files:
- force.csv: original NASA CSV, 238 measurements, 35 people.
- slalom.csv: original NASA CSV, 243 measurements, 35 people.
- cft_metadata.json: archived official dataset metadata.
- cft70.normalized.json: derived, traceable data for 35 people and 33 complete baseline/first-post pairs. This is NOT an ML model or clinical score.
- verify_and_normalize.py: standard-library-only script; run `python verify_and_normalize.py`. Uses bundled files; downloads direct NASA files if absent. Recreates JSON and manifest and asserts known reference counts/9023 baselines.
- IMPLEMENTATION_PROMPT.md: code-audited six-screen integration instructions.

This kit does not modify or deploy the RecoveryMap repository. Remote code inspected at ea552370a39fc49840a538ee90b096c2bea4622f. Local unpushed changes are outside this audit. The app build was not run as part of this data-kit task.

Data describes Earth-based 70-day head-down-bed-rest research, not Mars participants. Recovery plan, adherence, fatigue and symptoms are absent. Do not attach invented plan outcomes to these real IDs. Missing values/dates stay missing. Changes are descriptive, not diagnoses or proof of treatment effect.
