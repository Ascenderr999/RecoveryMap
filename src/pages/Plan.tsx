import { useState } from "react";
import { useProfileData } from "../hooks/useProfileData";
import { Panel, PageTitle, fmt, Empty } from "../components/ui";
import { SessionCard } from "../components/SessionCard";
export default function Plan() {
  const { p, sessions, stats } = useProfileData();
  const [day, setDay] = useState(p.day);
  return (
    <>
      <PageTitle
        label="ASSIGNED RECOVERY / DAILY WORKFLOW"
        title="Recovery Plan"
        description={`${p.rank} ${p.name} · ${p.focus}`}
      />
      <div className="notice">
        Demo recovery plan — specialist-authored synthetic content. Not medical
        advice.
      </div>
      <div className="plan-summary">
        <Panel
          title="A structured return to function"
          eyebrow="ASSIGNED DEMONSTRATION PLAN"
        >
          <p>
            Authored in the fictional scenario by {p.author}. These static
            activities illustrate a specialist-authored workflow; no real
            clinician has prescribed this plan.
          </p>
          <div className="phase-list">
            {[
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
                {t}
              </span>
            ))}
          </div>
          <p className="muted">
            The 30-day timeline is illustrative. Activities are populated
            through demo day {p.day + 3}. Assessments never change assigned dose
            or frequency.
          </p>
        </Panel>
        <Panel
          title={`${fmt(stats.percent, 0)}% adherence`}
          eyebrow="DUE ACTIVITIES"
        >
          <p>
            {stats.completed} completed of {stats.total} scheduled through day{" "}
            {p.day}. Skipped and pending activities remain in the denominator.
          </p>
          <div className="progress-bar">
            <i style={{ width: `${stats.percent}%` }} />
          </div>
        </Panel>
      </div>
      <div className="section-line">
        <h2>Daily activity schedule</h2>
        <label className="inline-label">
          Mission day
          <select
            aria-label="Mission day"
            value={day}
            onChange={(e) => setDay(Number(e.target.value))}
          >
            {Array.from({ length: p.day + 3 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                Day {i + 1}
                {i + 1 === p.day ? " · Today" : ""}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="exercise-grid">
        {sessions
          .filter((s) => s.day === day)
          .map((s) => (
            <SessionCard key={s.id} session={s} />
          ))}
      </div>
      <Panel title="Session completion history" eyebrow="RECENT LOCAL RECORDS">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Day</th>
                <th>Activity</th>
                <th>Status</th>
                <th>Fatigue / discomfort</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {sessions
                .filter((s) => s.status !== "scheduled")
                .sort((a, b) => b.day - a.day)
                .slice(0, 18)
                .map((s) => (
                  <tr key={s.id}>
                    <td>{s.day}</td>
                    <td>{s.exercise}</td>
                    <td>
                      <span className={`status ${s.status}`}>{s.status}</span>
                    </td>
                    <td>
                      {s.fatigue} / {s.discomfort}
                    </td>
                    <td>{s.notes || "—"}</td>
                  </tr>
                ))}
            </tbody>
          </table>
          {!sessions.some((s) => s.status !== "scheduled") && (
            <Empty>No completed or skipped sessions yet.</Empty>
          )}
        </div>
      </Panel>
    </>
  );
}
