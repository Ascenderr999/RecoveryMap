import { localize } from "../i18n";
import { PageTitle, Panel, Empty } from "../components/ui";
import { useProfileData } from "../hooks/useProfileData";
import { AssessmentHistory } from "../components/AssessmentHistory";
import { dateFor } from "../data/seed";
export default function History() {
  const { rows, sessions, p } = useProfileData();
  const completed = sessions
    .filter((s) => s.status !== "scheduled")
    .sort((a, b) => b.day - a.day);
  return (
    <>
      <PageTitle
        label={localize("LOCAL RECORDS / PROFILE TIMELINE")}
        title={localize("Progress History")}
        description={localize(`${p.name} · ${p.code}`)}
      />
      <Panel
        title={localize("Assessment history")}
        eyebrow={localize("MANUAL AND SYNTHETIC SOURCES LABELED")}
      >
        <AssessmentHistory rows={rows} />
      </Panel>
      <Panel
        title={localize("Session timeline")}
        eyebrow={localize("COMPLETION / NOTES")}
      >
        {localize(
          completed.length ? (
            completed.map((s) => (
              <article className="note" key={s.id}>
                <div>
                  <span className="eyebrow">
                    {localize(dateFor(p, s.day))}
                    {localize(" \u00B7 Day")}
                    {localize(s.day)}
                    {localize(" \u00B7")}
                    {localize(s.status)}
                  </span>
                  <h3 translate={s.planId ? "no" : undefined}>
                    {s.planId ? s.exercise : localize(s.exercise)}
                  </h3>
                  <p translate="no">{s.notes || "—"}</p>
                  <small>
                    {localize("Fatigue:")}
                    {localize(s.fatigue)}
                    {localize("/10 \u00B7 Discomfort:")}
                    {localize(s.discomfort)}
                    {localize("/10")}
                  </small>
                </div>
              </article>
            ))
          ) : (
            <Empty>{localize("No sessions recorded.")}</Empty>
          ),
        )}
      </Panel>
    </>
  );
}
