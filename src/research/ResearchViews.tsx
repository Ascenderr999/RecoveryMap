import { useSearchParams } from "react-router-dom";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  ReferenceLine,
} from "recharts";
import { localize as t } from "../i18n";
import { Panel, PageTitle } from "../components/ui";
import { useResearch } from "./ResearchContext";
import { OpenPlanDemo } from "./ModeBar";
import {
  compareResearch,
  researchTrajectory,
  baselineBC,
  type ResearchComparison,
} from "./calculations";
import {
  BASELINE_METHOD,
  DATASET_URL,
  type ResearchObservation,
} from "./model";
import { download } from "../lib/backup";
const number = (n: number, d = 2) => n.toFixed(d),
  signed = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(2)}`;
export function ResearchLoading() {
  const { error } = useResearch();
  return (
    <div className="notice" role={error ? "alert" : "status"}>
      {t(error || "Loading locally bundled NASA observations…")}
    </div>
  );
}
export function ResearchLimits() {
  return (
    <p className="research-limits">
      {t(
        "Earth 70-day head-down-bed-rest analog research; not Mars or in-flight astronaut measurements. Task performance direction is not clinical health status. No diagnosis, injury-risk score, EVA clearance, treatment effect, or gravity conversion is inferred.",
      )}
    </p>
  );
}
export function ComparisonSummary({ c }: { c: ResearchComparison }) {
  return (
    <>
      <div className="research-metrics">
        <article className="stat">
          <div className="stathead">{t("Recorded leg force")}</div>
          <div className="statvalue">
            {number(c.force.value, 5)}
            <small> N</small>
          </div>
          <p>
            {t("B/C baseline")}: {number(c.baselineForce, 5)} N
          </p>
          <p>
            {t("Force change")}: {signed(c.forceChangePct)}%
          </p>
          <small>
            {t("Source row")}: {c.force.sourceFile} / {c.force.sourceRowId}
          </small>
        </article>
        <article className="stat">
          <div className="stathead">{t("Recorded slalom time")}</div>
          <div className="statvalue">
            {number(c.time.value, 3)}
            <small> s</small>
          </div>
          <p>
            {t("B/C baseline")}: {number(c.baselineTime, 3)} s
          </p>
          <p>
            {t("Raw time change")}: {signed(c.timeChangePct)}% ·{" "}
            {t(c.timeChangePct >= 0 ? "LONGER TIME" : "SHORTER TIME")}
          </p>
          <small>
            {t("Source row")}: {c.time.sourceFile} / {c.time.sourceRowId}
          </small>
        </article>
      </div>
      <div className="comparison-secondary">
        <div>
          <span>{t("Mobility inverse-time performance change")}</span>
          <strong>{signed(c.mobilityPerformanceChangePct)}%</strong>
        </div>
        <div>
          <span>{t("Descriptive divergence")}</span>
          <strong>
            {number(c.gapPercentagePoints)} {t("percentage points")}
          </strong>
        </div>
        <div>
          <span>{t("Force baseline-relative ratio")}</span>
          <strong>{number(c.forceRatioPct)}%</strong>
        </div>
        <div>
          <span>{t("Inverse-time baseline-relative ratio")}</span>
          <strong>{number(c.inverseTimeRatioPct)}%</strong>
        </div>
      </div>
      <p className="chart-caption">
        {t(
          "Ratios are descriptive task comparisons, not clinical recovery percentages.",
        )}
      </p>
    </>
  );
}
export function ResearchDashboard() {
  const { dataset, selection: s } = useResearch();
  if (!dataset) return <ResearchLoading />;
  const c = compareResearch(dataset.observations, s.participantId, s.session);
  return (
    <>
      <PageTitle
        label={t("RESEARCH REPLAY / READ ONLY")}
        title={t("Mission Control")}
        description={t(
          "A recovery-plan and functional-monitoring companion for gravity transitions during future exploration missions.",
        )}
      />
      <div className="research-intro">
        <span className="research-badge">
          {t("Real NASA Earth-analog data")}
        </span>
        <h2>
          {t("Participant ID")} {s.participantId} · POST {s.session}
        </h2>
        <p>
          {t(
            "Supporting evidence for monitoring strength and function; research replay does not replace the personal recovery-plan workflow.",
          )}
        </p>
      </div>
      {c.ok ? (
        <>
          <ComparisonSummary c={c} />
          <div className="notice">
            {t(
              s.participantId === "9023" && s.session === "D"
                ? "Force changed little in this recorded example while the mobility task took longer."
                : "These recorded task measurements describe a baseline-relative comparison, not a medical outcome.",
            )}
          </div>
        </>
      ) : (
        <><Panel title={t("Selected raw observations")}><ResearchObservationTable rows={dataset.observations.filter(r=>r.participantId===s.participantId&&r.session===s.session&&r.phase==="POST_TEST")}/></Panel><div className="notice">
          {t("Comparison unavailable")}: {t(c.reason)}
        </div></>
      )}
      <Panel title={t("Research and personal workflows stay separate")}>
        <p>
          {t(
            "Session adherence, fatigue, and today’s plan are unavailable for NASA participants. No synthetic activity records are attached to these IDs.",
          )}
        </p>
        <OpenPlanDemo />
      </Panel>
      <ResearchLimits />
    </>
  );
}
function Plot({
  metric,
  unit,
}: {
  metric: "force" | "time" | "gap";
  unit: string;
}) {
  const { dataset, selection: s } = useResearch();
  if (!dataset) return null;
  const data = researchTrajectory(dataset.observations, s.participantId);
  return (
    <div
      className="chart"
      role="img"
      aria-label={`${t(metric === "force" ? "Recorded leg force" : metric === "time" ? "Recorded slalom time" : "Descriptive divergence")} (${unit})`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ left: 10, right: 20, top: 10, bottom: 10 }}
        >
          <CartesianGrid
            stroke="#29465c"
            strokeDasharray="3 5"
            vertical={false}
          />
          <XAxis dataKey="label" stroke="#91adc8" fontSize={11} />
          <YAxis
            stroke="#91adc8"
            fontSize={10}
            width={75}
            unit={` ${unit}`}
            domain={["auto", "auto"]}
          />
          <Tooltip
            contentStyle={{
              background: "#091c31",
              border: "1px solid #3b6481",
            }}
            formatter={(v) =>
              `${Number(v).toFixed(metric === "force" ? 5 : 3)} ${unit}`
            }
          />
          {metric === "gap" && <ReferenceLine y={0} stroke="#91adc8" />}
          <Line
            isAnimationActive={false}
            connectNulls={false}
            type="linear"
            dataKey={metric}
            name={t(
              metric === "force"
                ? "Recorded leg force"
                : metric === "time"
                  ? "Recorded slalom time"
                  : "Descriptive divergence",
            )}
            stroke={metric === "time" ? "#ffb355" : "#42e4ed"}
            strokeWidth={2.5}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
function BaselineBars({
  c,
  metric,
}: {
  c: ResearchComparison;
  metric: "force" | "time";
}) {
  const unit = metric === "force" ? "N" : "s";
  const data = [
    {
      label: t("B/C baseline"),
      value: metric === "force" ? c.baselineForce : c.baselineTime,
    },
    {
      label: `POST ${c.session}`,
      value: metric === "force" ? c.force.value : c.time.value,
    },
  ];
  return (
    <div
      className="chart short"
      role="img"
      aria-label={`${t("Baseline and selected observation")} (${unit})`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid stroke="#29465c" vertical={false} />
          <XAxis dataKey="label" stroke="#91adc8" fontSize={10} />
          <YAxis stroke="#91adc8" unit={` ${unit}`} width={70} fontSize={10} />
          <Tooltip
            contentStyle={{
              background: "#091c31",
              border: "1px solid #3b6481",
            }}
            formatter={(v) =>
              `${Number(v).toFixed(metric === "force" ? 5 : 3)} ${unit}`
            }
          />
          <Bar
            isAnimationActive={false}
            dataKey="value"
            name={t(
              metric === "force"
                ? "Recorded leg force"
                : "Recorded slalom time",
            )}
            fill={metric === "force" ? "#42e4ed" : "#ffb355"}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
export function ResearchAnalysis() {
  const { dataset, selection: s } = useResearch();
  if (!dataset) return <ResearchLoading />;
  const c = compareResearch(dataset.observations, s.participantId, s.session);
  return (
    <>
      <PageTitle
        label={t("MATCHED PARTICIPANT / SESSION / ENVIRONMENT")}
        title={t("Recovery Gap")}
        description={`${t("Participant ID")} ${s.participantId} · POST ${s.session}`}
      />
      {c.ok ? (
        <>
          <ComparisonSummary c={c} />
          <div className="two-col">
            <Panel title={t("Leg force: baseline vs selected visit")}>
              <BaselineBars c={c} metric="force" />
            </Panel>
            <Panel title={t("Slalom time: baseline vs selected visit")}>
              <BaselineBars c={c} metric="time" />
            </Panel>
          </div>
          <Panel title={t("B/C baseline provenance")}>
            <ResearchObservationTable rows={c.baselineRows} />
          </Panel>
        </>
      ) : (
        <><Panel title={t('Selected raw observations')}><ResearchObservationTable rows={dataset.observations.filter(r=>r.participantId===s.participantId&&r.session===s.session&&r.phase==='POST_TEST')}/></Panel><div className="notice" role="status">
          {t("Comparison unavailable")}: {t(c.reason)}
        </div></>
      )}
      <div className="two-col">
        <Panel title={t("Recorded leg force")}>
          <Plot metric="force" unit="N" />
        </Panel>
        <Panel title={t("Recorded slalom time")}>
          <Plot metric="time" unit="s" />
        </Panel>
      </div>
      <Panel title={t("Descriptive divergence over recorded POST visits")}>
        <Plot metric="gap" unit={t("pp")} />
        <p>
          {t(
            "D/E/F/G correspond to POST days 0/1/6/11. Missing pairs remain gaps; no visits are interpolated or imputed. PRE BR_Day values are phase-relative source labels, not post-recovery days.",
          )}
        </p>
      </Panel>
      <details className="panel">
        <summary>{t("Expand formulas and interpretation")}</summary>
        <div className="formula">
          <code>baselineForce = mean(PRE B, PRE C) [N]</code>
          <code>baselineTime = mean(PRE B, PRE C) [s]</code>
          <code>forceChangePct = 100 × (force / baselineForce − 1)</code>
          <code>timeChangePct = 100 × (time / baselineTime − 1)</code>
          <code>
            mobilityPerformanceChangePct = 100 × (baselineTime / time − 1)
          </code>
          <code>
            gapPercentagePoints = forceChangePct − mobilityPerformanceChangePct
          </code>
        </div>
        <p>
          {t(
            "Raw time change and inverse-time performance change are different quantities. The gap never subtracts the raw time change. Both B and C are mandatory; A is familiarization and excluded.",
          )}
        </p>
      </details>
      <ResearchLimits />
    </>
  );
}
export function ResearchObservationTable({
  rows,
}: {
  rows: readonly ResearchObservation[];
}) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {[
              "Participant ID",
              "Group label",
              "Metric",
              "Value",
              "Phase",
              "Session",
              "BR_Day",
              "Source date (US M/D/YYYY)",
              "Source row",
            ].map((h) => (
              <th key={h}>{t(h)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={`${r.sourceFile}/${r.sourceRowId}`}>
              <td>{r.participantId}</td>
              <td translate="no">{r.group}</td>
              <td>
                {t(r.metric === "leg_force" ? "Leg force" : "Slalom time")}
              </td>
              <td className="numeric">
                {r.value} {r.unit}
              </td>
              <td>{r.phase}</td>
              <td>{r.session}</td>
              <td>{r.brDay}</td>
              <td>{r.sourceDate ?? t("Not recorded")}</td>
              <td>
                <a href={`/data/cft70/raw/${r.sourceFile}`} download>
                  {r.sourceFile} / {r.sourceRowId}
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export function ResearchObservations() {
  const { dataset, selection: s } = useResearch();
  if (!dataset) return <ResearchLoading />;
  return (
    <>
      <div className="notice">
        {t(
          "Read-only NASA observations. Force requires an external measurement device; this browser does not measure newtons. Personal timed tasks are not the NASA slalom protocol.",
        )}
      </div>
      <ResearchObservationTable
        rows={dataset.observations.filter(
          (r) => r.participantId === s.participantId,
        )}
      />
      <ResearchLimits />
    </>
  );
}
export function researchCSV(
  rows: readonly ResearchObservation[],
  sources: readonly { file: string; url: string; sha256: string }[],
  selectedSession: string,
) {
  const quote = (v: unknown) =>
    `"${(typeof v === "string" ? v.replace(/^[=+@-]/, (m) => "'" + m) : String(v ?? "")).replace(/"/g, '""')}"`;
  const header = [
    "sourceType",
    "participantId",
    "metric",
    "unit",
    "value",
    "phase",
    "session",
    "brDay",
    "sourceDate_US",
    "sourceFile",
    "sourceRowId",
    "group",
    "protocol",
    "environment",
    "readOnly",
    "baselineMethod",
    "baselineValue",
    "forceChangePct",
    "rawTimeChangePct",
    "inverseTimePerformanceChangePct",
    "gapPercentagePoints",
    "selectedSession",
    "sourceURL",
    "sha256",
    "methodURL",
    "forceFormula",
    "rawTimeFormula",
    "performanceFormula",
    "gapFormula",
    "comparisonUnavailableReason",
  ];
  return [
    header,
    ...rows.map((r) => {
      const base = baselineBC(rows, r.participantId, r.metric),
        c = compareResearch(rows, r.participantId, r.session),
        src = sources.find((s) => s.file === r.sourceFile);
      return [
        r.source,
        r.participantId,
        r.metric,
        r.unit,
        r.value,
        r.phase,
        r.session,
        r.brDay,
        r.sourceDate ?? "",
        r.sourceFile,
        r.sourceRowId,
        r.group,
        r.protocol,
        r.environment,
        true,
        BASELINE_METHOD,
        base.ok ? base.value : "",
        c.ok ? c.forceChangePct : "",
        c.ok ? c.timeChangePct : "",
        c.ok ? c.mobilityPerformanceChangePct : "",
        c.ok ? c.gapPercentagePoints : "",
        selectedSession,
        src?.url,
        src?.sha256,
        DATASET_URL,
        "100*(force/baselineForce-1)",
        "100*(time/baselineTime-1)",
        "100*(baselineTime/time-1)",
        "forceChangePct-mobilityPerformanceChangePct",
        c.ok ? "" : c.reason,
      ];
    }),
  ]
    .map((row) => row.map(quote).join(","))
    .join("\n");
}
export function ResearchReports() {
  const { dataset, selection: s } = useResearch();
  const [query, setQuery] = useSearchParams();
  const tab = query.get("tab") === "history" ? "history" : "summary";
  const setTab = (tab: string) => setQuery({ tab });
  if (!dataset) return <ResearchLoading />;
  const rows = dataset.observations.filter(
      (r) => r.participantId === s.participantId,
    ),
    c = compareResearch(dataset.observations, s.participantId, s.session);
  return (
    <>
      <PageTitle
        label={t("RESEARCH REPORT / READ ONLY")}
        title={t("Progress & Reports")}
        description={`${t("Participant ID")} ${s.participantId} · POST ${s.session}`}
        action={
          <button className="button primary" onClick={() => window.print()}>
            {t("Print summary")}
          </button>
        }
      />
      <div className="toolbar">
        <button
          className="button"
          onClick={() =>
            download(
              `cft70-${s.participantId}.csv`,
              researchCSV(rows, dataset.sources, s.session),
              "text/csv;charset=utf-8",
            )
          }
        >
          {t("Export research observations · CSV")}
        </button>
        <button
          className="button"
          onClick={() =>
            download(
              `cft70-${s.participantId}.json`,
              JSON.stringify(
                {
                  source: "NASA_CFT70",
                  participantId: s.participantId,
                  selectedSession: s.session,
                  baselineMethod: BASELINE_METHOD,
                  comparison: c,
                  observations: rows,
                  sources: dataset.sources,
                  datasetURL: DATASET_URL,
                },
                null,
                2,
              ),
            )
          }
        >
          {t("Export research report · JSON")}
        </button>
      </div>
      <div className="mode-tabs secondary-tabs">
        <button
          aria-pressed={tab === "summary"}
          onClick={() => setTab("summary")}
        >
          {t("Summary")}
        </button>
        <button
          aria-pressed={tab === "history"}
          onClick={() => setTab("history")}
        >
          {t("Observation history")}
        </button>
      </div>
      {tab === "summary" && c.ok && <ComparisonSummary c={c} />}
      {!c.ok && (
        <><Panel title={t("Selected raw observations")}><ResearchObservationTable rows={dataset.observations.filter(r=>r.participantId===s.participantId&&r.session===s.session&&r.phase==="POST_TEST")}/></Panel><div className="notice">
          {t("Comparison unavailable")}: {t(c.reason)}
        </div></>
      )}
      <Panel title={t("Recorded observations and provenance")}>
        <ResearchObservationTable rows={rows} />
      </Panel>
      <Panel title={t("Method and citations")}>
        <p>{t(BASELINE_METHOD)}</p>
        <p>
          {t(
            "Source dates remain missing where absent. Pairing uses participant, phase, session, BR_Day, protocol, units, and environment, never date alone.",
          )}
        </p>
        <a
          className="text-link"
          href={DATASET_URL}
          target="_blank"
          rel="noreferrer"
        >
          NASA CFT70
        </a>
        {dataset.sources.map((source) => (
          <p key={source.file}>
            {source.file} · SHA-256: <code>{source.sha256}</code>
            <br />
            <a href={source.url}>{source.url}</a>
          </p>
        ))}
      </Panel>
      <ResearchLimits />
    </>
  );
}
