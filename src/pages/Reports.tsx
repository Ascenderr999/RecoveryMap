import { Printer } from "lucide-react";
import { useProfileData } from "../hooks/useProfileData";
import { Panel, PageTitle, DemoNotice, fmt, Empty } from "../components/ui";
import { AdherenceChart } from "../components/Charts";
import { AssessmentHistory } from "../components/AssessmentHistory";
import { dateFor } from "../data/seed";
export default function Reports() {
  const { p, rows, sessions, stats } = useProfileData();
  const notes = sessions
    .filter((s) => s.notes.trim())
    .sort((a, b) => b.day - a.day);
  return (
    <>
      <PageTitle
        label="OBSERVE / REVIEW / SHARE"
        title="Progress & Reports"
        description={`${p.rank} ${p.name} · ${p.code} · Demo day ${p.day}`}
        action={
          <button className="button primary" onClick={() => window.print()}>
            <Printer size={16} />
            Print summary
          </button>
        }
      />
      <DemoNotice />
      <div className="report-summary">
        <div>
          <span className="eyebrow">PROFILE SUMMARY</span>
          <h2>{p.name}</h2>
          <p>
            {p.mission} · {p.phase}
          </p>
        </div>
        <div>
          <strong>
            {stats.completed}
            <small>completed sessions</small>
          </strong>
          <strong>
            {fmt(stats.percent, 0)}%<small>plan adherence</small>
          </strong>
          <strong>
            {rows.filter((a) => !a.baseline).length}
            <small>follow-up measurements</small>
          </strong>
        </div>
      </div>
      <div className="two-col">
        <Panel
          title="Daily session adherence"
          eyebrow="COMPLETED / ASSIGNED DUE ACTIVITIES"
        >
          <AdherenceChart sessions={sessions} day={p.day} />
          <p className="chart-caption">
            Each bar uses that day's assigned activities. Overall adherence is{" "}
            {stats.completed} / {stats.total}; skipped and pending sessions
            count as incomplete.
          </p>
        </Panel>
        <Panel title="Recovery timeline" eyebrow="SYNTHETIC SCENARIO">
          <div className="timeline">
            {[
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
                    {dateFor(p, Number(day))} · Day {day}
                  </span>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
      <Panel
        title="Assessment history & baseline comparisons"
        eyebrow="PROFILE-SPECIFIC MEASUREMENTS"
      >
        <AssessmentHistory rows={rows} />
      </Panel>
      <Panel title="Recent session notes" eyebrow="SELF-REPORTED OBSERVATIONS">
        {notes.length ? (
          notes.slice(0, 8).map((s) => (
            <div className="note" key={s.id}>
              <span className="eyebrow">
                DAY {s.day} · {s.exercise}
              </span>
              <p>{s.notes}</p>
              <small>
                Fatigue: {s.fatigue}/10 · Discomfort: {s.discomfort}/10 ·{" "}
                {s.status}
              </small>
            </div>
          ))
        ) : (
          <Empty>No notes recorded for this profile.</Empty>
        )}
      </Panel>
      <p className="muted">
        Advanced CSV/PDF export is planned for Prompt 04. Browser printing is
        available now.
      </p>
    </>
  );
}
