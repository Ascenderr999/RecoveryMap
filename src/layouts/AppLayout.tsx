import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  Activity,
  LayoutDashboard,
  ClipboardList,
  ScanLine,
  ChartNoAxesCombined,
  FileChartColumn,
  BookOpen,
  Radio,
  Menu,
  X,
  ShieldCheck,
  Orbit,
  ChevronDown,
} from "lucide-react";
import { useRecovery } from "../hooks/useRecovery";
import { useOfflineStatus } from "../hooks/useOfflineStatus";
import { profiles } from "../data/seed";
import { ProfileSelector } from "../components/ui";
const links = [
  ["/", "Mission Control", LayoutDashboard],
  ["/plan", "Recovery Plan", ClipboardList],
  ["/assessment", "Functional Assessment", ScanLine],
  ["/gap", "Recovery Gap", ChartNoAxesCombined],
  ["/reports", "Progress & Reports", FileChartColumn],
  ["/research", "Research & Settings", BookOpen],
] as const;
export function AppLayout() {
  const offlineStatus = useOfflineStatus();
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  const { state, saving } = useRecovery();
  const p = profiles.find((p) => p.id === state.selectedProfile)!;
  const [open, setOpen] = useState(false),
    [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const fn = () => setOnline(navigator.onLine);
    window.addEventListener("online", fn);
    window.addEventListener("offline", fn);
    return () => {
      window.removeEventListener("online", fn);
      window.removeEventListener("offline", fn);
    };
  }, []);
  return (
    <div className={state.compact ? "app compact" : "app"}>
      <button
        className="mobile-toggle"
        aria-label={open ? "Close navigation" : "Open navigation"}
        onClick={() => setOpen(!open)}
      >
        {open ? <X /> : <Menu />}
      </button>
      {open && (
        <button
          className="scrim"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
        />
      )}
      <aside className={open ? "sidebar open" : "sidebar"}>
        <NavLink to="/" className="brand" onClick={() => setOpen(false)}>
          <div className="brand-mark">
            <Orbit size={26} />
          </div>
          <div>
            RecoveryMap<span>R A N G E R S</span>
          </div>
        </NavLink>
        <div className="nav-label">MISSION WORKSPACE</div>
        <nav>
          {links.map(([to, label, Icon]) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={() => setOpen(false)}
            >
              <Icon size={19} />
              <span>{label}</span>
              {to === "/gap" && <i className="nav-new">CORE</i>}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="mission-mini">
            <span className="eyebrow">ACTIVE DEMO MISSION</span>
            <strong>
              <Orbit size={17} />
              {p.code}
            </strong>
            <p>{p.mission}</p>
            <span className="pill">
              Day {p.day} · {p.destination}
            </span>
          </div>
          <div className="local-status">
            <span className="dot" />
            <div>
              {saving ? "Saving locally…" : "Local workspace ready"}
              <small>
                {online ? offlineStatus : "Offline · data stays on device"}
              </small>
            </div>
            <ShieldCheck size={16} />
          </div>
          <p className="version">
            RANGERS / SPACE APPS 2026 <span>v0.1</span>
          </p>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="breadcrumb">
            <Activity size={16} />
            <span>EXPLORATION HEALTH</span>
            <span className="separator">/</span>
            <b>Recovery operations</b>
          </div>
          <div className="top-right">
            <span className="demo-badge">SYNTHETIC DATA</span>
            <span className="avatar">{p.initials}</span>
            <div className="profile-control">
              <ProfileSelector />
              <span>
                {p.code} · {p.phase}
              </span>
            </div>
            <ChevronDown size={14} />
          </div>
        </header>
        <main>
          <Outlet />
        </main>
        <footer>
          <span>
            <Radio size={13} /> RecoveryMap · Autonomous Post-Landing Recovery
            Companion
          </span>
          <span>Synthetic demo · No device connection</span>
        </footer>
      </div>
    </div>
  );
}
