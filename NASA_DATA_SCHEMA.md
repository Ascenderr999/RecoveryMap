# NASA data schema

The immutable source records are separate from personal Assessment/Session/RecoveryPlan records. Both original CSVs have exactly these source columns:

`ID, Campaign, Subject, GroupName, Date, Test_Phase, BR_Day, Session, Force_N` (force) or `Time_sec` (slalom).

- `ID` is the original source-row key, not a calendar index. `Subject` is an anonymous research participant ID, never an invented astronaut identity.
- Group labels remain exactly Control, Ex, Ex&T, Flywheel. No causal treatment descriptions are inferred.
- PRE A is familiarization. Arithmetic mean of BOTH PRE B/C is the baseline. Missing either means unavailable.
- POST D/E/F/G correspond to BR_Day 0/1/6/11. PRE BR_Day is phase-relative and must not be plotted as a positive post-recovery day.
- Source Date is US M/D/YYYY or literal NA. Derived NA becomes null; raw files are unchanged. Dates are not pairing keys.
- Force_N is N. Time_sec is seconds. Force change and raw time change are distinct from the relative inverse-time performance index. Formula details: DATA_PROVENANCE.md.
- ResearchObservation adds source, sourceFile, sourceRowId, participantId, group, session, phase, brDay, nullable sourceDate, metric, unit, value, environment, derived source-task protocol and readOnly. All arrays/observations are frozen.
- Research environment is Earth head-down-bed-rest analog. These are not Moon/Mars/in-flight observations.

Personal records remain in local Dexie IndexedDB. New optional metadata is backward compatible: archived/superseded timestamps, version links, activation user confirmation, authored category/source reference, recorded symptom flags, and assessment revision history. A user demo activation records specialistVerified=false. No upload authenticates a clinician.
