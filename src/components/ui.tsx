import { localize } from "../i18n";
import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useRecovery } from "../hooks/useRecovery";
import { profiles } from "../data/seed";
export function ProfileSelector() {
  const { state, update, saving } = useRecovery();
  return (
    <select
      aria-label={localize("Select synthetic astronaut profile")}
      value={state.selectedProfile}
      disabled={saving}
      onChange={(e) =>
        void update((s) => ({ ...s, selectedProfile: e.target.value }))
      }
    >
      {localize(
        profiles.map((p) => (
          <option key={p.id} value={p.id}>
            {localize(p.rank)} {localize(p.name)}
          </option>
        )),
      )}
    </select>
  );
}
export function Panel({
  title,
  eyebrow,
  action,
  children,
  className = "",
}: {
  title: string;
  eyebrow?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`panel ${className}`}>
      <div className="panel-head">
        <div>
          {localize(
            eyebrow && <span className="eyebrow">{localize(eyebrow)}</span>,
          )}
          <h2>{localize(title)}</h2>
        </div>
        {localize(action)}
      </div>
      {localize(children)}
    </section>
  );
}
export function PageTitle({
  label,
  title,
  description,
  action,
}: {
  label: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-title">
      <div>
        <span className="eyebrow">{localize(label)}</span>
        <h1>
          {localize(title)}
          <span className="teal">{localize(".")}</span>
        </h1>
        <p>{localize(description)}</p>
      </div>
      {localize(action)}
    </div>
  );
}
export function MetricCard({
  label,
  value,
  unit,
  detail,
  icon,
}: {
  label: string;
  value: string | number;
  unit?: string;
  detail: string;
  icon: ReactNode;
}) {
  return (
    <div className="metric-card">
      <div className="metric-label">
        {localize(label)}
        {localize(icon)}
      </div>
      <div className="metric-value">
        {localize(value)}
        <small>{localize(unit)}</small>
      </div>
      <p>{localize(detail)}</p>
    </div>
  );
}
export function TextLink({
  to,
  children,
}: {
  to: string;
  children: ReactNode;
}) {
  return (
    <Link className="text-link" to={to}>
      {localize(children)}
      <ArrowUpRight size={14} />
    </Link>
  );
}
export function DemoNotice() {
  return (
    <div className="notice">
      <span className="dot amber" />
      {localize(
        " Synthetic demonstration \u00B7 Fictional profiles and manually entered measurements. Not medical advice.",
      )}
    </div>
  );
}
export function Empty({ children }: { children: ReactNode }) {
  return <p className="empty">{localize(children)}</p>;
}
export const fmt = (n: number | undefined, d = 1) =>
  n === undefined ? "—" : n.toFixed(d);
