import { localize } from "../i18n";
import { useState } from "react";
import { useProfileData } from "../hooks/useProfileData";
import { Panel, PageTitle, fmt, Empty } from "../components/ui";
import { SessionCard } from "../components/SessionCard";
import { PlanEditor } from "../components/PlanEditor";
export default function Plan() {
  const { p, sessions, stats } = useProfileData();
  const [day, setDay] = useState(p.day);
  return (
    <>
      <PageTitle
        label={localize("ASSIGNED RECOVERY / DAILY WORKFLOW")}
        title={localize("Recovery Plan")}
        description={localize(`${p.rank} ${p.name} · ${p.focus}`)}
      />
      <div className="notice">
        {localize(
          "Demo recovery plan \u2014 specialist-authored synthetic content. Not medical advice.",
        )}
      </div>
      <div className="plan-summary">
        <div className="plan-import-span">
          <PlanEditor />
        </div>
        <Panel
          title={localize("A structured return to function")}
          eyebrow={localize("ASSIGNED DEMONSTRATION PLAN")}
        >
          <p>
            {localize("Authored in the fictional scenario by ")}
            {localize(p.author)}
            {localize(
              ". These static activities illustrate a specialist-authored workflow; no real clinician has prescribed this plan.",
            )}
          </p>
          <div className="phase-list">
            {localize(
              [
                "Days 1–7 · Familiarization",
                "Days 8–14 · Structured practice",
                "Days 15–30 · Follow-up observation",
              ].map((t, i) => (
                <span
                  key={t}
                  className={
                    (p.day <= 7 ? 0 : p.day <= 14 ? 1 : 2) === i ? "active" : ""
                  }
                >
                  {localize(t)}
                </span>
              )),
            )}
          </div>
          <p className="muted">
            {localize(
              "The 30-day timeline is illustrative. Activities are populated through demo day ",
            )}
            {localize(p.day + 3)}
            {localize(". Assessments never change assigned dose or frequency.")}
          </p>
        </Panel>
        <Panel
          title={localize(`${fmt(stats.percent, 0)}% adherence`)}
          eyebrow={localize("DUE ACTIVITIES")}
        >
          <p>
            {localize(stats.completed)}
            {localize(" completed of ")}
            {localize(stats.total)}
            {localize(" scheduled through day ")}
            {localize(" ")}
            {localize(p.day)}
            {localize(
              ". Skipped and pending activities remain in the denominator.",
            )}
          </p>
          <div className="progress-bar">
            <i style={{ width: `${stats.percent}%` }} />
          </div>
        </Panel>
      </div>
      <div className="section-line">
        <h2>{localize("Daily activity schedule")}</h2>
        <label className="inline-label">
          {localize("Mission day")}
          <select
            aria-label={localize("Mission day")}
            value={day}
            onChange={(e) => setDay(Number(e.target.value))}
          >
            {localize(
              Array.from(
                { length: Math.max(p.day + 3, ...sessions.map((s) => s.day)) },
                (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {localize("Day ")}
                    {localize(i + 1)}
                    {localize(i + 1 === p.day ? " · Today" : "")}
                  </option>
                ),
              ),
            )}
          </select>
        </label>
      </div>
      <div className="exercise-grid">
        {localize(
          sessions
            .filter((s) => s.day === day)
            .map((s) => <SessionCard key={s.id} session={s} />),
        )}
      </div>
      <Panel
        title={localize("Session completion history")}
        eyebrow={localize("RECENT LOCAL RECORDS")}
      >
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{localize("Day ")}</th>
                <th>{localize("Activity")}</th>
                <th>{localize("Status")}</th>
                <th>{localize("Fatigue / discomfort")}</th>
                <th>{localize("Notes")}</th>
              </tr>
            </thead>
            <tbody>
              {localize(
                sessions
                  .filter((s) => s.status !== "scheduled")
                  .sort((a, b) => b.day - a.day)
                  .slice(0, 18)
                  .map((s) => (
                    <tr key={s.id}>
                      <td>{localize(s.day)}</td>
                      <td>{localize(s.exercise)}</td>
                      <td>
                        <span className={`status ${s.status}`}>
                          {localize(s.status)}
                        </span>
                      </td>
                      <td>
                        {localize(s.fatigue)}
                        {localize(" /")}
                        {localize(s.discomfort)}
                      </td>
                      <td>{localize(s.notes || "—")}</td>
                    </tr>
                  )),
              )}
            </tbody>
          </table>
          {localize(
            !sessions.some((s) => s.status !== "scheduled") && (
              <Empty>{localize("No completed or skipped sessions yet.")}</Empty>
            ),
          )}
        </div>
      </Panel>
    </>
  );
}
