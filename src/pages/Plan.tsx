import { localize } from "../i18n";
import { useState } from "react";
import { useProfileData } from "../hooks/useProfileData";
import { Panel, PageTitle, fmt, Empty } from "../components/ui";
import { SessionCard } from "../components/SessionCard";
import { PlanEditor } from "../components/PlanEditor";
import { useSearchParams } from "react-router-dom";
import Library from "./Library";
import { useResearch } from "../research/ResearchContext";
import { ResearchUnavailable } from "../research/ModeBar";
export default function Plan() {
  const { p, sessions, stats, state } = useProfileData();
  const activePlan = state.plans?.find(
    (v) => v.profileId === p.id && v.activatedAt && !v.archivedAt,
  );
  const [day, setDay] = useState(p.day);
  const { selection } = useResearch();
  const [query, setQuery] = useSearchParams();
  if (selection.mode === "research")
    return (
      <>
        <PageTitle
          title={localize("Recovery Plan")}
          label={localize("READ-ONLY RESEARCH")}
          description={localize(
            "No participant recovery plan is present in these NASA files.",
          )}
        />
        <ResearchUnavailable />
      </>
    );
  const tabs = (
    <div className="mode-tabs secondary-tabs">
      <button
        aria-pressed={query.get("tab") !== "library"}
        onClick={() => setQuery({})}
      >
        {localize("Plan workflow")}
      </button>
      <button
        aria-pressed={query.get("tab") === "library"}
        onClick={() => setQuery({ tab: "library" })}
      >
        {localize("Exercise Library")}
      </button>
    </div>
  );
  if (query.get("tab") === "library")
    return (
      <>
        {tabs}
        <Library />
      </>
    );
  return (
    <>
      {tabs}
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
          title={
            activePlan
              ? activePlan.title
              : localize("A structured return to function")
          }
          eyebrow={localize(
            activePlan
              ? "ACTIVE DEMO PLAN VERSION"
              : "ASSIGNED DEMONSTRATION PLAN",
          )}
        >
          {activePlan ? (
            <>
              <p>
                {localize("Version")} {activePlan.version ?? 1} ·{" "}
                {activePlan.sourceName}
              </p>
              <p>
                {localize("Source author")}:{" "}
                <span translate="no">{activePlan.author}</span>
              </p>
              <p>
                {localize("Specialist approval")}: {localize("NOT VERIFIED")}
              </p>
              <p>
                {localize("Activation date")}: {activePlan.activatedAt}
              </p>
            </>
          ) : (
            <p>
              {localize("Authored in the fictional scenario by ")}
              {localize(p.author)}.{" "}
              {localize(
                "Synthetic educational demonstration plan; not NASA-prescribed.",
              )}
            </p>
          )}
          <p>
            {localize("Explicit assigned days")}: 1–
            {Math.max(p.day, ...sessions.map((s) => s.day))}.{" "}
            {localize(
              "Day 0 is landing; day 1 is the following calendar day. No clinical recovery duration is inferred.",
            )}
          </p>
          <p>
            {localize("Assessments never change assigned dose or frequency.")}
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
                        {localize(
                          s.fatigueRecorded || (!s.planId && !s.recordedAt)
                            ? s.fatigue
                            : "Not recorded",
                        )}
                        {localize(" /")}
                        {localize(
                          s.discomfortRecorded || (!s.planId && !s.recordedAt)
                            ? s.discomfort
                            : "Not recorded",
                        )}
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
