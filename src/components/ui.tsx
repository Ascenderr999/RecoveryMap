import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useRecovery } from "../hooks/useRecovery";
import { profiles } from "../data/seed";
export function ProfileSelector() {
  const { state, update, saving } = useRecovery();
  return (
    <select
      aria-label="Select synthetic astronaut profile"
      value={state.selectedProfile}
      disabled={saving}
      onChange={(e) =>
        void update((s) => ({ ...s, selectedProfile: e.target.value }))
      }
    >
      {profiles.map((p) => (
        <option key={p.id} value={p.id}>
          {p.rank} {p.name}
        </option>
      ))}
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
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          <h2>{title}</h2>
        </div>
        {action}
      </div>
      {children}
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
        <span className="eyebrow">{label}</span>
        <h1>
          {title}
          <span className="teal">.</span>
        </h1>
        <p>{description}</p>
      </div>
      {action}
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
        {label}
        {icon}
      </div>
      <div className="metric-value">
        {value}
        <small>{unit}</small>
      </div>
      <p>{detail}</p>
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
      {children}
      <ArrowUpRight size={14} />
    </Link>
  );
}
export function DemoNotice() {
  return (
    <div className="notice">
      <span className="dot amber" /> Synthetic demonstration · Fictional
      profiles and manually entered measurements. Not medical advice.
    </div>
  );
}
export function Empty({ children }: { children: ReactNode }) {
  return <p className="empty">{children}</p>;
}
export const fmt = (n: number | undefined, d = 1) =>
  n === undefined ? "—" : n.toFixed(d);
