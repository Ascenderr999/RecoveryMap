# Data verification — 14 November 2026

Current independent verification ran against local ORIGINAL CSV bytes, not chart images or previously reported counts. No new NASA acquisition was required.

Command:

```powershell
& 'C:/Users/LENOVO/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe' scripts/verify_cft70.py
```

Result: 238 force rows, 243 slalom rows, 9 columns each, 35 participant IDs each, 33 complete PRE B/C plus paired first POST D cases. Each source has 14 NA dates. Full precision and nullable derived dates retained.

SHA-256 originals:
- force.csv: 296da01c055f15dd4410ddb8ae3ecd78ff515a26d4cb09ff6d81dbd17c2db947
- slalom.csv: 39fee8f94ebe647926ab3b4ab4a2113f8921674be7b152718c15d85442a0346b

9023 baseline: 3342.69424 N and 8.548 s. D/E/F/G observations and all specified exact values are tested against the parsed files. At D, force change -0.6886181728664509%, raw time +28.15863359850257%, inverse-time change -21.97170241898676%, signed gap +21.283084246120307 pp. Research gaps are descriptive, not clinical validation or injury prediction.

Synthetic B is deliberately separate: 560 to 509.6 N, 11 to 14.4 s, strength -9%, inverse-time change -23.611111%, gap +14.611111 pp. Balance 42.4/55*100 = 77.090909%, displayed 77.1%. No unexplained 455 s record was found in the application seed/source workflow, so no research value was changed to match that prompt example.

Original acquisition timestamp is NOT independently verified: the supplied package attributes its download to a prior author on 12 November. This implementation verified the supplied bytes on 14 November; it does not invent a past download timestamp. Dataset-specific redistribution terms were not identified in supplied metadata. This remains a terms-review limitation, not evidence of unrestricted licensing. No authentication was bypassed.

Browser verified force SHA-256 against the bundled manifest; explorer computes counts from observations. Group, source, participant and session filters are functional. Full original data, normalized data and personal records stay separate. Existing 23 research tests and standalone verifier provide independent integrity checks. See TEST_REPORT.md for actual current runs and FINAL_AUDIT.md for unresolved items.

Final verification addendum, 22:09 Asia/Baku: both public NASA direct-file APIs were downloaded again into ignored test-results/. Their independently computed SHA-256 hashes exactly matched the bundled force and slalom originals. No authentication bypass or changed research values. This is a current-session acquisition verification; the older supplied-package acquisition date remains a separate attribution. Access terms still require archive review before wider redistribution.
