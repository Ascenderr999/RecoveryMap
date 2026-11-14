import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  CheckCheck,
  Target,
  Dumbbell,
  Timer,
  Orbit,
  ArrowRight,
  Activity,
} from "lucide-react";
import { useProfileData } from "../hooks/useProfileData";
import { dateFor, metricInfo } from "../data/seed";
import { performance } from "../lib/calculations";
import {
  Panel,
  PageTitle,
  MetricCard,
  TextLink,
  DemoNotice,
  fmt,
} from "../components/ui";
import { TrajectoryChart } from "../components/Charts";
import type { Metric } from "../types";
export default function Dashboard() {
  const { p, rows, sessions, stats, latest, baseline, trend } =
    useProfileData();
  const last = trend.at(-1);
  return (
    <>
      <PageTitle
        label="MISSION OPERATIONS / OVERVIEW"
        title="Mission Control"
        description={`Welcome back, ${p.rank} ${p.name.split(" ")[1]}. Your recovery workspace is ready.`}
        action={
          <Link className="button primary" to="/assessment">
            Record assessment <ArrowUpRight size={16} />
          </Link>
        }
      />
      <section className="mission-banner">
        <div className="mission-copy">
          <span className="eyebrow">
            <span className="dot" /> POST-LANDING RECOVERY / DEMO SCENARIO
          </span>
          <h2>
            Every step forward.
            <br />
            <span>A clearer path to recovery.</span>
          </h2>
          <p>
            {p.mission} · {p.focus}
          </p>
          <div className="banner-meta">
            <span>{p.code}</span>
            <span>Landing: {p.landing}</span>
            <span>Demo date: {dateFor(p, p.day)}</span>
          </div>
        </div>
        <div className="planet-scene" aria-hidden="true">
          <div className="orbit-ring ring1" />
          <div className="orbit-ring ring2" />
          <div className={`planet ${p.destination.toLowerCase()}`} />
          <span className="planet-label">
            {p.destination.toUpperCase()} / {p.code}
          </span>
        </div>
        <div className="mission-day">
          <span>MISSION DAY</span>
          <strong>{String(p.day).padStart(2, "0")}</strong>
          <small>days since landing</small>
          <div className="day-track">
            <i style={{ width: `${(p.day / 30) * 100}%` }} />
          </div>
          <small>30-day synthetic timeline</small>
        </div>
      </section>
      <div className="metrics">
        <MetricCard
          label="Sessions completed"
          value={stats.completed}
          unit={`/ ${stats.total}`}
          detail="All assigned sessions due through today"
          icon={<CheckCheck />}
        />
        <MetricCard
          label="Plan adherence"
          value={fmt(stats.percent, 0)}
          unit="%"
          detail={`${stats.skipped} skipped · due activities denominator`}
          icon={<Target />}
        />
        <MetricCard
          label="Latest measured force"
          value={fmt(latest("strength")?.value, 0)}
          unit="N"
          detail={`${fmt(performance(latest("strength")!.value, baseline("strength")!.value, true)!)}% of baseline · manually entered`}
          icon={<Dumbbell />}
        />
        <MetricCard
          label="Functional mobility"
          value={fmt(latest("mobility")?.value)}
          unit="s"
          detail="Timed task · lower indicates faster completion"
          icon={<Timer />}
        />
      </div>
      <div className="dashboard-grid">
        <Panel
          title="Recovery trajectory"
          eyebrow="BASELINE-RELATIVE PERFORMANCE"
          action={<span className="pill">Matched observations</span>}
        >
          <TrajectoryChart rows={rows} />
          <p className="chart-caption">
            Ratios to baseline, not clinical recovery percentages. Only
            same-date force and mobility observations appear.
          </p>
        </Panel>
        <Panel
          title="Functional performance"
          eyebrow="LATEST MANUAL MEASUREMENTS"
          action={<Activity size={18} className="teal" />}
        >
          <div className="performance-list">
            {(
              ["strength", "mobility", "balance", "coordination"] as Metric[]
            ).map((m) => {
              const a = latest(m),
                b = baseline(m),
                percent =
                  a && b
                    ? performance(a.value, b.value, metricInfo[m].higher)
                    : null;
              return (
                <div key={m} className="performance-row">
                  <div>
                    <span>{metricInfo[m].label}</span>
                    <strong>
                      {fmt(a?.value)} <small>{metricInfo[m].unit}</small>
                    </strong>
                  </div>
                  <div
                    className={`progress-bar ${m === "mobility" ? "purple" : ""}`}
                  >
                    <i style={{ width: `${Math.min(percent || 0, 100)}%` }} />
                  </div>
                  <small>
                    {fmt(percent ?? undefined)}% of baseline ·{" "}
                    {metricInfo[m].direction}
                  </small>
                </div>
              );
            })}
          </div>
          <TextLink to="/assessment">View assessment history</TextLink>
        </Panel>
        <Panel
          title="Today's recovery schedule"
          eyebrow={`DAY ${p.day} / SYNTHETIC PLAN`}
          action={<TextLink to="/plan">Open plan</TextLink>}
        >
          <div className="schedule">
            {sessions
              .filter((s) => s.day === p.day)
              .map((s, i) => (
                <Link key={s.id} to="/plan" className="schedule-row">
                  <span className="schedule-index">0{i + 1}</span>
                  <div>
                    <strong>{s.exercise}</strong>
                    <small>
                      {s.category} · {s.dose}
                    </small>
                  </div>
                  <span className={`status ${s.status}`}>{s.status}</span>
                  <ArrowRight size={16} />
                </Link>
              ))}
          </div>
        </Panel>
        <Panel
          title="The Recovery Gap"
          eyebrow="STRENGTH ≠ FUNCTION"
          action={<Orbit size={20} className="teal" />}
        >
          <div className="gap-preview">
            <strong>
              {last ? fmt(last.gap) : "—"}
              <small>pp</small>
            </strong>
            <span>
              Descriptive difference in
              <br />
              baseline-relative changes
            </span>
          </div>
          <p>
            Measured strength and functional mobility can follow different
            trajectories. Compare them without assuming a clinical outcome.
          </p>
          <TextLink to="/gap">Explore the comparison</TextLink>
        </Panel>
      </div>
      <Panel title="Recent activity" eyebrow="LOCAL MISSION LOG">
        <div className="activity-feed">
          {rows
            .filter((a) => !a.baseline)
            .sort((a, b) => b.date.localeCompare(a.date))
            .slice(0, 3)
            .map((a) => (
              <div key={a.id}>
                <span className="activity-icon">
                  <Activity size={17} />
                </span>
                <div>
                  <strong>{metricInfo[a.metric].label} recorded</strong>
                  <small>
                    {a.value} {metricInfo[a.metric].unit} · Synthetic manual
                    measurement
                  </small>
                </div>
                <time>{a.date}</time>
              </div>
            ))}
          {sessions
            .filter((s) => s.status === "completed")
            .slice(-2)
            .map((s) => (
              <div key={s.id}>
                <span className="activity-icon">
                  <CheckCheck size={17} />
                </span>
                <div>
                  <strong>{s.exercise} completed</strong>
                  <small>Assigned demonstration activity · Day {s.day}</small>
                </div>
                <time>{dateFor(p, s.day)}</time>
              </div>
            ))}
        </div>
      </Panel>
      <DemoNotice />
    </>
  );
}
