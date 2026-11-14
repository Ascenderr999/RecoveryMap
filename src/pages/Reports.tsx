import { localize } from "../i18n";
import { Printer } from "lucide-react";
import { useProfileData } from "../hooks/useProfileData";
import { Panel, PageTitle, DemoNotice, fmt, Empty } from "../components/ui";
import { AdherenceChart } from "../components/Charts";
import { AssessmentHistory } from "../components/AssessmentHistory";
import { metricInfo, dateFor } from "../data/seed";
import { download } from "../lib/backup";
import {personalAssessmentCSV} from '../lib/personalExport';
import { useSearchParams } from "react-router-dom";
import History from "./History";
import { useResearch } from "../research/ResearchContext";
import { ResearchReports } from "../research/ResearchViews";
export default function Reports() {
  const { selection } = useResearch();
  const [query, setQuery] = useSearchParams();
  const { p, rows, sessions, stats, state } = useProfileData();
  const notes = sessions
    .filter((s) => s.notes.trim())
    .sort((a, b) => b.day - a.day);
  if (selection.mode === "research") return <ResearchReports />;
  const tabs = (
    <div className="mode-tabs secondary-tabs">
      <button
        aria-pressed={query.get("tab") !== "history"}
        onClick={() => setQuery({})}
      >
        {localize("Progress summary")}
      </button>
      <button
        aria-pressed={query.get("tab") === "history"}
        onClick={() => setQuery({ tab: "history" })}
      >
        {localize("Progress History")}
      </button>
    </div>
  );
  if (query.get("tab") === "history")
    return (
      <>
        {tabs}
        <History />
      </>
    );
  return (
    <>
      {tabs}
      <div className="notice">
        {localize(
          "Activity completion records adherence, not proof of medical improvement.",
        )}
      </div>
      <PageTitle
        label={localize("OBSERVE / REVIEW / SHARE")}
        title={localize("Progress & Reports")}
        description={localize(
          `${p.rank} ${p.name} · ${p.code} · Demo day ${p.day}`,
        )}
        action={
          <button className="button primary" onClick={() => window.print()}>
            <Printer size={16} />
            {localize("Print summary")}
          </button>
        }
      />
      <DemoNotice />
      <div className="toolbar">
        <button
          className="button"
          onClick={() =>
            download(
              `recoverymap-${p.id}-report.json`,
              JSON.stringify(
                {
                  profile: p,
                  generatedAt: new Date().toISOString(),
                  assessments: rows,
                  sessions,
                  plans: (state.plans || []).filter(
                    (plan) => plan.profileId === p.id,
                  ),
                  provenance:
                    "Fictional profile; synthetic seed and manually entered records. No NASA participant records.",
                },
                null,
                2,
              ),
            )
          }
        >
          {localize("Export profile report \u00B7 JSON \u2193")}
        </button>
        <button
          className="button"
          onClick={() => {
            const csv=personalAssessmentCSV(rows,p.id);
            download(
              `recoverymap-${p.id}-measurements.csv`,
              csv,
              "text/csv;charset=utf-8",
            );
          }}
        >
          {localize("Export measurements \u00B7 CSV \u2193")}
        </button>
      </div>
      <div className="report-summary">
        <div>
          <span className="eyebrow">{localize("PROFILE SUMMARY")}</span>
          <h2>{localize(p.name)}</h2>
          <p>
            {localize(p.mission)}
            {localize(" \u00B7")}
            {localize(p.phase)}
          </p>
        </div>
        <div>
          <strong>
            {localize(stats.completed)}
            <small>{localize("completed sessions")}</small>
          </strong>
          <strong>
            {localize(fmt(stats.percent, 0))}
            {localize("%")}
            <small>{localize("plan adherence")}</small>
          </strong>
          <strong>
            {localize(rows.filter((a) => !a.baseline).length)}
            <small>{localize("follow-up measurements")}</small>
          </strong>
        </div>
      </div>
      <div className="two-col">
        <Panel
          title={localize("Daily session adherence")}
          eyebrow={localize("COMPLETED / ASSIGNED DUE ACTIVITIES")}
        >
          <AdherenceChart sessions={sessions} day={p.day} />
          <p className="chart-caption">
            {localize(
              "Each bar uses that day's assigned activities. Overall adherence is",
            )}
            {localize(" ")}
            {localize(stats.completed)}
            {localize(" /")}
            {localize(stats.total)}
            {localize("; skipped and pending sessions count as incomplete.")}
          </p>
        </Panel>
        <Panel
          title={localize("Recovery timeline")}
          eyebrow={localize("SYNTHETIC SCENARIO")}
        >
          <div className="timeline">
            {localize(
              [
                [
                  -30,
                  "Pre-mission baseline",
                  "Reference measurements established",
                ],
                [0, "Landing day", p.mission],
                [
                  7,
                  "First observation checkpoint",
                  "Strength, balance, mobility, coordination",
                ],
                [
                  p.day,
                  "Current demo day",
                  `${stats.completed} activities completed; ${stats.skipped} skipped`,
                ],
              ].map(([day, title, desc]) => (
                <div key={`${day}-${title}`}>
                  <i />
                  <div>
                    <span>
                      {localize(dateFor(p, Number(day)))}
                      {localize(" \u00B7 Day")}
                      {localize(day)}
                    </span>
                    <h3>{localize(title)}</h3>
                    <p>{localize(desc)}</p>
                  </div>
                </div>
              )),
            )}
          </div>
        </Panel>
      </div>
      <Panel
        title={localize("Assessment history & baseline comparisons")}
        eyebrow={localize("PROFILE-SPECIFIC MEASUREMENTS")}
      >
        <AssessmentHistory rows={rows} />
      </Panel>
      <Panel
        title={localize("Recent session notes")}
        eyebrow={localize("SELF-REPORTED OBSERVATIONS")}
      >
        {localize(
          notes.length ? (
            notes.slice(0, 8).map((s) => (
              <div className="note" key={s.id}>
                <span className="eyebrow">
                  {localize("DAY ")}
                  {localize(s.day)}
                  {localize(" \u00B7")}
                  {localize(s.exercise)}
                </span>
                <p>{s.notes}</p>
                <small>
                  {localize("Fatigue: ")}
                  {localize(s.fatigue)}
                  {localize("/10 \u00B7 Discomfort:")}
                  {localize(s.discomfort)}
                  {localize("/10 \u00B7")}
                  {localize(" ")}
                  {localize(s.status)}
                </small>
              </div>
            ))
          ) : (
            <Empty>{localize("No notes recorded for this profile.")}</Empty>
          ),
        )}
      </Panel>
      <p className="muted">
        {localize(
          "CSV and JSON exports preserve source units and provenance. Use browser printing for a PDF summary.",
        )}
      </p>
    </>
  );
}
