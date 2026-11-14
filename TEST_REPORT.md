# Test report — final master implementation

14 November 2026, Windows, Node.js 24.22.1, pnpm 11.25.0. Results below were executed in this session; previous milestone results are not substituted.

| Command / check | Actual result |
|---|---|
| Baseline `pnpm test` | 42 passed / 6 files |
| Final `pnpm test` | **55 passed / 7 files** at 22:23 Asia/Baku |
| `pnpm exec tsc -b` | Passed (exit 0), explicit final run |
| `pnpm build` | Passed: TypeScript + Vite, 55 cached resources; revision 1d5320f5a794 |
| `python scripts/verify_cft70.py` (bundled Python path below) | Passed: 238/243 rows,35 IDs each,33 paired first-POST cases,14 missing dates each, pinned hashes and exact 9023 D/E/F/G fixtures |
| Public NASA direct force/slalom downloads + `Get-FileHash -Algorithm SHA256` | BOTH matched originals independently; public access, no auth bypass |
| Generated personal PDF opened with pypdf | Valid 5-page all-range report; profile, gap, sessions, source and timestamp present |
| Actual filtered PDF/CSV/JSON consistency helper | Passed: valid 1-page PDF,4 assessments, selected date range,1/1 adherence,14.6111 pp, profile isolation |
| Actual NASA PDF opened with pypdf | Valid 2-page PDF,3319.67584 N,10.955 s,21.283084 pp,hashes; synthetic plan excluded |
| Lint | Not run: no project lint script/config; not claimed as passed |

Python executable actually used:

`C:/Users/LENOVO/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`

Downloaded report consistency command actually executed with that interpreter:

```text
scripts/verify-report-downloads.py --pdf "C:/Users/LENOVO/Downloads/recoverymap-chen (1).pdf" --json C:/Users/LENOVO/Downloads/recoverymap-chen.json --csv C:/Users/LENOVO/Downloads/recoverymap-chen.csv
```

## Unit/regression coverage

Original research/calculation/import/IndexedDB/offline handler suite preserved. New tests cover scenario B/balance values, exact 45-day expansion and invalid ranges, blank/duplicate authored rows, explicit activation and false specialist verification, historical completion/profile isolation, linked plan versions, confirmed baseline history/backup round-trip, unspecified protocol labels, strict assessment CSV/unit/duplicate/source handling, report date filtering/future denominator, actual multipage font-embedded EN/AZ-capable PDF generation, and duplicate-completion protection on replacement activation.

## Browser actions actually exercised

Isolated origins 4180/4181 preserved existing user data at other origins. Production page was accessible before final push and showed the previous six-screen build; this does not establish the final deployment.

- Scenario B original values and separate real NASA Spotlight; synthetic A/C switches isolated.
- Import real local synthetic CSV fixture, edit review/source author, schedule 1-45, save and explicitly activate; source instructions retained, NOT VERIFIED specialist label. Complete today's session with notes, refresh, history persisted. Version 1 retained on saving version 2.
- Manual distinct-protocol mobility saved; incompatible baseline comparison correctly withheld. Edit to14.1 s retained previous revision.
- Reproduced date fields displaying values without changing report snapshot. Fixed Apply filters and retested: visible date range14Nov to14Nov,1/1 adherence, no future denominator; real exports parsed and matched.
- Backup downloaded, disposable workspace reset to Morgan, restore returned Chen and activated plan/source/history.
- NASA9023/D selection and21.28 pp preserved between Gap/Reports; explorer9023/Flywheel/D returned2 rows; browser force SHA matched manifest. NASA mode never acquired the personal plan/session.
- All six research routes measured at390/768/1440px without document horizontal overflow. All six personal routes measured at390px without document overflow. Mobile research screenshot inspected; all six AZ headings rendered; inverse-time/raw units retained. Captured console warnings/errors: none in these checks.
- Final clean4181 origin initially showed complete cached resources/controller. Preview server stopped and HTTP connection refusal confirmed independently. Disconnected reload displayed the new readable English/Azerbaijani startup fallback. **Full offline React navigation did not pass**, and is not reported PASS.

No exhaustive native-browser/keyboard/screen-reader matrix, pixel-perfect reference comparison, physical print device, or target installed-browser offline run was performed. Generated downloadable PDFs were actually parsed; physical printing was unnecessary to establish file validity. See FINAL_AUDIT.md.
