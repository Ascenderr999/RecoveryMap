import { localize } from "../i18n";
import { Link } from "react-router-dom";
import { useProfileData } from "../hooks/useProfileData";
import { TrajectoryChart } from "../components/Charts";
import { fmt } from "../components/ui";
import { performance } from "../lib/calculations";
import { useResearch } from "../research/ResearchContext";
import { ResearchDashboard, ResearchSpotlight } from "../research/ResearchViews";
export default function Dashboard() {
  const { selection } = useResearch();
  const { p, rows, sessions, latest, baseline, trend, update, saving } =
    useProfileData();
  const today = sessions.filter((s) => s.day === p.day),
    done = today.filter((s) => s.status === "completed").length;
  const force = latest("strength"),
    baseForce = baseline("strength"),
    mobility = latest("mobility"),
    baseMobility = baseline("mobility");
  const strength =
    force && baseForce ? performance(force.value, baseForce.value, true) : null;
  const functionRatio =
    mobility && baseMobility
      ? performance(mobility.value, baseMobility.value, false)
      : null;
  const pair = trend.at(-1);
  if (selection.mode === "research") return <ResearchDashboard />;
  return (
    <>
      <div className="pagetitle">
        <div>
          <h1>{localize("Mission Control")}</h1>
          <p className="sub">
            {localize(
              "Your recovery journey today. Moving closer to your goal, together.",
            )}
          </p>
        </div>
        <span className="chip">
          <b>{localize("\u25C9")}</b>
          {localize("RECOVERY DAY ")}
          {localize(p.day)}
        </span>
      </div>
      <section className="hero">
        <div className="herocopy">
          <div className="eyebrow">
            {localize("RECOVERY BEYOND GRAVITY \u00B7 DEMO")}
          </div>
          <h2>
            {localize("Your strength returns.")}
            <br />
            <em>{localize("Your movement, with it.")}</em>
          </h2>
          <p>
            {localize(
              "An offline-first recovery companion for astronauts after landing. Your assigned plan, movement measurements, and daily progress \u2014 one recovery map.",
            )}
          </p>
          <Link className="btn primary" to="/plan">
            {localize("Start today's program")}
            <span>{localize("\u2197")}</span>
          </Link>
        </div>
        <div className="missionrail" aria-label={localize("Mission stages")}>
          <span className="railnode" />
          {localize("Pre-flight")}
          <span className="railline" />
          <span className="railnode" />
          {localize("Mission")}
          <span className="railline" />
          <span className="railnode" />
          <b className="railnow">
            {localize("Recovery \u00B7 Day")}
            {localize(p.day)}
          </b>
          <span className="railline" />
          <span className="railnode railpending" />
          {localize("Adaptation")}
        </div>
      </section>
      <div className="stats">
        <div className="stat">
          <div className="stathead">
            {localize("Recovery stage")}
            <span>{localize("\u25F7")}</span>
          </div>
          <div className="statvalue">
            {localize(p.day)}
            <small> / {Math.max(p.day,...sessions.map(s=>s.day))} {localize("scheduled days")}</small>
          </div>
          <div className="trend neutral">
            {localize("Synthetic mission timeline")}
          </div>
        </div>
        <div className="stat">
          <div className="stathead">
            {localize("Muscle strength \u00B7 demo")}
            <span>{localize("\u03DF")}</span>
          </div>
          <div className="statvalue">
            {localize(fmt(strength ?? undefined, 0))}
            <small>{localize("% baseline")}</small>
          </div>
          <div className="trend">
            {localize(force?.value)}
            {localize(" N \u00B7")}
            {localize(force?.date)}
          </div>
        </div>
        <div className="stat">
          <div className="stathead">
            {localize("Functional performance \u00B7 demo")}
            <span>{localize("\u2301")}</span>
          </div>
          <div className="statvalue">
            {localize(fmt(functionRatio ?? undefined, 0))}
            <small>{localize("% baseline")}</small>
          </div>
          <div className="trend">
            {localize(mobility?.value)}
            {localize(" s \u00B7")}
            {localize(mobility?.date)}
          </div>
        </div>
        <div className="stat">
          <div className="stathead">
            {localize("Today's sessions")}
            <span>{localize("\u25A4")}</span>
          </div>
          <div className="statvalue">
            {localize(done)}
            <small>
              {localize(" /")}
              {localize(today.length)}
              {localize(" completed")}
            </small>
          </div>
          <div className="trend neutral">
            {localize(today.filter(s=>s.status==="scheduled").length)}
            {localize(" pending activities")}
          </div>
        </div>
      </div>
      <ResearchSpotlight />
      <div className="grid">
        <section className="card">
          <div className="cardhead">
            <h2>{localize("Two sides of recovery")}</h2>
            <Link className="link" to="/gap">
              {localize("Explore \u2197")}
            </Link>
          </div>
          <TrajectoryChart rows={rows} />
          <div className="note">
            <span>{localize("\u25C8")}</span>
            <span>
              <strong>
                {localize(fmt(pair?.gap))}
                {localize(" percentage points difference.")}
              </strong>
              {localize(
                " Strength and function can change at different rates. Matched-date baseline ratios; not a diagnostic score. Seed values are synthetic; manual entries remain labeled in history.",
              )}
            </span>
          </div>
        </section>
        <section className="card">
          <div className="cardhead">
            <h2>{localize("Today's program")}</h2>
            <span className="tag">
              {localize(today.length)}
              {localize(" ACTIVITIES")}
            </span>
          </div>
          {localize(
            today.map((s, i) => (
              <div className="exercise" key={s.id}>
                <span className="exerciseicon">
                  {localize(["↥", "⫶", "⌁"][i % 3])}
                </span>
                <div>
                  <h3 translate={s.planId ? "no" : undefined}>
                    {s.planId ? s.exercise : localize(s.exercise)}
                  </h3>
                  <p translate={s.planId ? "no" : undefined}>
                    {s.planId ? s.dose : localize(s.dose)}
                  </p>
                </div>
                <span className="duration">{localize(s.status)} · {localize(s.category)}</span>
                <button
                  className={`circle ${s.status === "completed" ? "done" : ""}`}
                  disabled={saving}
                  aria-label={localize(`${s.exercise} completed`)}
                  aria-pressed={s.status === "completed"}
                  onClick={() =>
                    void update((state) => ({
                      ...state,
                      sessions: state.sessions.map((row) =>
                        row.id === s.id
                          ? {
                              ...row,
                              recordedAt:new Date().toISOString(),
                              status:
                                row.status === "completed"
                                  ? "scheduled"
                                  : "completed",
                            }
                          : row,
                      ),
                    }))
                  }
                >
                  {localize(s.status === "completed" ? "✓" : "")}
                </button>
              </div>
            )),
          )}
          <div className="progress">
            <span
              style={{
                width: `${today.length ? (done / today.length) * 100 : 0}%`,
              }}
            />
          </div>
          <div className="row">
            <span className="small">
              {localize(done)}
              {localize(" /")}
              {localize(today.length)}
              {localize(" activities completed")}
            </span>
            <Link className="link" to="/plan">
              {localize("Open program \u2192")}
            </Link>
          </div>
        </section>
      </div>
      <div className="lower">
        <section className="card">
          <span className="tag">{localize("DAILY NOTE")}</span>
          <h3>{localize("How are you feeling today?")}</h3>
          <p>
            {localize(
              "Fatigue and discomfort notes give context to your recovery journey.",
            )}
          </p>
          <Link className="link" to="/plan">
            {localize("Add a session note \uFF0B")}
          </Link>
        </section>
        <section className="card">
          <span className="tag orange">{localize("NEXT STEP")}</span>
          <h3>{localize("Measure your movement")}</h3>
          <p>
            {localize(
              "Record strength, balance, mobility, and coordination in one place.",
            )}
          </p>
          <Link className="link" to="/assessment">
            {localize("Enter a new result \u2192")}
          </Link>
        </section>
        <section className="card">
          <span className="tag">
            {localize("SCIENCE WITH VISIBLE SOURCES")}
          </span>
          <h3>{localize("Context from NASA research")}</h3>
          <p>
            {localize(
              "CFT70, human research, and SM-204 \u2014 with transparent limitations.",
            )}
          </p>
          <Link className="link" to="/research">
            {localize("Explore the sources \u2197")}
          </Link>
        </section>
      </div>
      <p className="demo-footnote">
        {localize(
          "DEMO \u00B7 Fictional profiles and synthetic seed data. Manually entered records are stored separately by profile. Not medical advice.",
        )}
      </p>
    </>
  );
}
