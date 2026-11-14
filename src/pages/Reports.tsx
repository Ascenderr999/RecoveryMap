import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { localize as t } from "../i18n";
import { useProfileData } from "../hooks/useProfileData";
import { Panel, PageTitle, DemoNotice } from "../components/ui";
import { AssessmentHistory } from "../components/AssessmentHistory";
import { AdherenceChart } from "../components/Charts";
import { dateFor } from "../data/seed";
import { download } from "../lib/backup";
import { personalReport, reportCSV, reportLines } from "../lib/reportModel";
import { useResearch } from "../research/ResearchContext";
import { ResearchReports } from "../research/ResearchViews";
export default function Reports() {
  const { selection } = useResearch();
  const { p, state } = useProfileData();
  const [query, setQuery] = useSearchParams();
  const [from, setFrom] = useState(""),
    [to, setTo] = useState(""),
    [planId, setPlanId] = useState("all"),
    [error, setError] = useState("");
  const r = personalReport(state, p, from, to, planId);
  const invalid = Boolean(from && to && from > to);
  const history = query.get("tab") === "history";
  if (selection.mode === "research") return <ResearchReports />;
  async function pdf() {
    try {
      setError("");
      const { downloadReportPDF } = await import("../lib/pdfReport");
      await downloadReportPDF(reportLines(r), `recoverymap-${p.id}.pdf`);
    } catch {
      setError(
        "PDF generation failed. Use Print summary or reconnect once to cache the report font.",
      );
    }
  }
  return (
    <>
      <PageTitle
        title={t("Progress & Reports")}
        label={t("OBSERVE / REVIEW / SHARE")}
        description={`${p.name} / ${p.code} / ${t("Demo day")} ${p.day}`}
        action={
          <button
            className="button primary"
            disabled={invalid}
            onClick={() => void pdf()}
          >
            {t("Download PDF report")}
          </button>
        }
      />
      <DemoNotice />
      <p className="notice">
        {t(
          "Activity completion records adherence, not proof of medical improvement.",
        )}
      </p>
      <div className="mode-tabs secondary-tabs">
        <button aria-pressed={!history} onClick={() => setQuery({})}>
          {t("Progress summary")}
        </button>
        <button
          aria-pressed={history}
          onClick={() => setQuery({ tab: "history" })}
        >
          {t("Progress History")}
        </button>
      </div>
      <form
        className="form-row report-filters"
        onSubmit={(e) => {
          e.preventDefault();
          const form = new FormData(e.currentTarget);
          setFrom(String(form.get("from") ?? ""));
          setTo(String(form.get("to") ?? ""));
        }}
      >
        <label>
          {t("From date")}
          <input type="date" name="from" defaultValue={from} />
        </label>
        <label>
          {t("To date")}
          <input type="date" name="to" defaultValue={to} />
        </label>
        <label>
          {t("Plan version")}
          <select value={planId} onChange={(e) => setPlanId(e.target.value)}>
            <option value="all">{t("All plans")}</option>
            <option value="seed">{t("Synthetic seed")}</option>
            {r.plans.map((v) => (
              <option key={v.id} value={v.id}>
                {v.title} / v{v.version ?? 1}
              </option>
            ))}
          </select>
        </label>
        <button className="button primary" type="submit">
          {t("Apply filters")}
        </button>
      </form>
      {invalid && (
        <p role="alert">{t("From date must not be after to date.")}</p>
      )}
      <div className="toolbar">
        <button
          className="button"
          disabled={invalid}
          onClick={() => window.print()}
        >
          {t("Print summary")}
        </button>
        <button
          className="button"
          disabled={invalid}
          onClick={() =>
            download(
              `recoverymap-${p.id}.csv`,
              reportCSV(r),
              "text/csv;charset=utf-8",
            )
          }
        >
          {t("Export measurements · CSV ↓")}
        </button>
        <button
          className="button"
          disabled={invalid}
          onClick={() => {
            const { allAssessments, ...content } = r;
            download(
              `recoverymap-${p.id}.json`,
              JSON.stringify(content, null, 2),
            );
          }}
        >
          {t("Export profile report · JSON ↓")}
        </button>
      </div>
      {error && <p role="alert">{t(error)}</p>}
      <Panel title={t("Profile summary")}>
        <p>
          {p.name} / {t(p.mission)} / {t(p.phase)}
        </p>
        <p>
          {t("Date range")}: {from || t("All")} – {to || t("All")} ·{" "}
          {t("Day 0")}: {p.landing} · {t("Current demo date")}:{" "}
          {dateFor(p, p.day)}
        </p>
        <p>
          {t("Plan adherence")}:{" "}
          <b>
            {r.stats.completed} / {r.stats.total} ({r.stats.percent.toFixed(1)}
            %)
          </b>{" "}
          {t("due activities")}. {t("Completed")}: {r.stats.completed} ·{" "}
          {t("Skipped")}: {r.stats.skipped} · {t("Pending")}: {r.stats.pending}{" "}
          · {t("Future")}: {r.stats.future}
        </p>
        <p>
          {t(
            "Future sessions are excluded from the adherence denominator. Archived pending schedules are retained in local history but excluded from active adherence.",
          )}
        </p>
      </Panel>
      {!history && (
        <>
          <Panel title={t("Daily session adherence")}>
            <AdherenceChart sessions={r.sessions} day={p.day} />
          </Panel>
          <Panel title={t("Strength and function comparison")}>
            {r.latestPair ? (
              <p>
                {r.latestPair.date}: {r.latestPair.forceValue} N /{" "}
                {t("Baseline")} {r.latestPair.baselineForce} N;{" "}
                {r.latestPair.timeValue} s / {t("Baseline")}{" "}
                {r.latestPair.baselineTime} s. {t("Strength change")}:{" "}
                {(r.latestPair.strength - 100).toFixed(2)}%;{" "}
                {t("Relative inverse-time performance change")}:{" "}
                {(r.latestPair.mobility - 100).toFixed(2)}%; {t("Recovery Gap")}
                : {r.latestPair.gap.toFixed(2)} pp.
              </p>
            ) : (
              <p>{t(r.missingData)}</p>
            )}
            <p>{t(r.method)}</p>
          </Panel>
        </>
      )}
      <Panel title={t("Assessment history & baseline comparisons")}>
        <AssessmentHistory
          rows={r.assessments}
          contextRows={r.allAssessments}
        />
      </Panel>
      <Panel title={t("Session timeline")}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {[
                  "Date",
                  "Day",
                  "Exercise",
                  "Status",
                  "Plan version / source",
                  "Notes",
                  "Recorded observations",
                ].map((h) => (
                  <th key={h}>{t(h)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {r.sessions.map((s) => {
                const v = r.plans.find((p) => p.id === s.planId);
                return (
                  <tr key={s.id}>
                    <td>{dateFor(p, s.day)}</td>
                    <td>{s.day}</td>
                    <td translate="no">{s.exercise}</td>
                    <td>
                      {t(
                        s.status === "scheduled"
                          ? s.day > p.day
                            ? "Future"
                            : "Pending"
                          : s.status,
                      )}
                    </td>
                    <td translate="no">
                      {v
                        ? `${v.title} / v${v.version ?? 1} / ${v.sourceName}`
                        : t("Synthetic seed")}
                    </td>
                    <td translate="no">{s.notes || "—"}</td>
                    <td>
                      {s.recordedAt
                        ? `${t("Fatigue")}: ${s.fatigueRecorded ? s.fatigue + "/10" : t("Not recorded")}; ${t("Discomfort")}: ${s.discomfortRecorded ? s.discomfort + "/10" : t("Not recorded")}`
                        : s.id.startsWith(p.id + "-") &&
                            !s.planId &&
                            s.day < p.day
                          ? t("Synthetic recorded observations")
                          : t("Not recorded")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
      <Panel title={t("Plan version history")}>
        {r.plans.length ? (
          r.plans.map((v) => (
            <p key={v.id} translate="no">
              {v.title} / v{v.version ?? 1} / {v.id} / {v.sourceName} /{" "}
              {t("Activation date")}: {v.activatedAt ?? "—"} /{" "}
              {t("Previous version")}: {v.previousVersionId ?? "—"} /{" "}
              {t("Specialist approval")}: {t("NOT VERIFIED")}
            </p>
          ))
        ) : (
          <p>
            {t(
              "Synthetic educational demonstration plan; not NASA-prescribed.",
            )}
          </p>
        )}
      </Panel>
      <footer className="report-provenance">
        <p>{t(r.provenance)}</p>
        <p>
          {t("Export timestamp")}: {r.generatedAt}
        </p>
        <p>
          {t(
            "Unknown protocols, incompatible baselines and incomplete date pairs are missing data, not zero measurements.",
          )}
        </p>
      </footer>
    </>
  );
}
