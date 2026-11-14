import { useNavigate } from "react-router-dom";
import { localize as t } from "../i18n";
import { useResearch } from "./ResearchContext";
import { POST_DAYS } from "./model";
export function ModeBar() {
  const { selection: s, setSelection, dataset } = useResearch();
  return (
    <section className="mode-bar" aria-label={t("Workspace mode")}>
      <div className="mode-tabs">
        <button
          aria-pressed={s.mode === "personal"}
          onClick={() => setSelection({ mode: "personal" })}
        >
          {t("Personal Demo")}
        </button>
        <button
          aria-pressed={s.mode === "research"}
          onClick={() => setSelection({ mode: "research" })}
        >
          {t("NASA CFT70 Research Replay")}
        </button>
      </div>
      {s.mode === "research" ? (
        <div className="research-selectors">
          <span className="research-badge">
            {t("Real NASA Earth-analog data")}
          </span>
          <label>
            {t("Participant ID")}
            <select
              aria-label={t("Research participant")}
              value={s.participantId}
              onChange={(e) => setSelection({ participantId: e.target.value })}
            >
              {(dataset?.participantIds || ["9023"]).map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t("Recorded POST session")}
            <select
              aria-label={t("Research session")}
              value={s.session}
              onChange={(e) =>
                setSelection({ session: e.target.value as typeof s.session })
              }
            >
              {(["D", "E", "F", "G"] as const).map((session) => (
                <option key={session} value={session}>
                  {session} · {t("day")} {POST_DAYS[session]}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : (
        <p>
          {t(
            "Fictional profiles, approved user plans, and manually entered measurements. Research records stay separate.",
          )}
        </p>
      )}
    </section>
  );
}
export function OpenPlanDemo() {
  const { setSelection } = useResearch();
  const navigate = useNavigate();
  return (
    <button
      className="button primary"
      onClick={() => {
        setSelection({ mode: "personal" });
        navigate("/plan");
      }}
    >
      {t("Open plan workflow demo")}
    </button>
  );
}
export function ResearchUnavailable() {
  return (
    <div className="panel">
      <h2>
        {t("No participant recovery plan is present in these NASA files.")}
      </h2>
      <p>
        {t(
          "Prescriptions, session adherence, fatigue, symptoms, and completion records are unavailable in research replay. They are never borrowed from demo profiles.",
        )}
      </p>
      <OpenPlanDemo />
    </div>
  );
}
