import { localize } from "../i18n";
import { useEffect } from "react";
import { NavLink, Outlet, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  ScanLine,
  ChartNoAxesCombined,
  FileChartColumn,
  BookOpen,
  Dumbbell,
  History,
  Settings,
} from "lucide-react";
import { useRecovery } from "../hooks/useRecovery";
import { useOfflineStatus } from "../hooks/useOfflineStatus";
import { profiles, dateFor } from "../data/seed";
import { ProfileSelector } from "../components/ui";
import { LanguageSwitcher, useLocale } from "../i18n";
import { ModeBar } from "../research/ModeBar";
import { useResearch } from "../research/ResearchContext";
const links = [
  ["/", "Mission Control", LayoutDashboard],
  ["/plan", "Recovery Plan", ClipboardList],
  ["/assessment", "Functional Assessment", ScanLine],
  ["/gap", "Recovery Gap", ChartNoAxesCombined],
  ["/reports", "Progress & Reports", FileChartColumn],
  ["/research", "NASA Research & Settings", BookOpen],
] as const;
export function AppLayout() {
  useLocale();
  const { state, saving } = useRecovery();
  const { selection } = useResearch();
  const p = profiles.find((p) => p.id === state.selectedProfile)!;
  const { pathname } = useLocation();
  const offline = useOfflineStatus();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return (
    <>
      <div className="masthead">
        <div className="mastbrand">
          <div className="rangers">
            <svg viewBox="0 0 44 44" aria-hidden="true">
              <ellipse cx="22" cy="22" rx="13" ry="13" />
              <ellipse
                cx="22"
                cy="22"
                rx="23"
                ry="7"
                transform="rotate(-35 22 22)"
              />
              <path
                d="M35 5l1 5 5 1-5 2-1 5-2-5-5-2 5-1z"
                fill="#d4faff"
                stroke="none"
              />
            </svg>
            {localize("RANGERS")}
          </div>
          <div className="mastdivider" />
          <div>
            <div className="masttitle">{localize("RecoveryMap")}</div>
            <div className="mastsub">{localize("Recovery Beyond Gravity")}</div>
          </div>
        </div>
        <div className="spacebadge">
          <b>{localize("SPACE APPS 2026")}</b>
          {localize("RANGERS \u00B7 MISSION CONTROL")}
        </div>
      </div>
      <aside className="sidebar">
        <Link className="brand" to="/">
          <span className="logo">{localize("\u2301")}</span>
          {localize("Recovery")}
          <span>{localize("Map")}</span>
        </Link>
        {selection.mode === "personal" ? (
          <div className="mission">
            <span className="tiny">
              {localize("ACTIVE MISSION \u00B7 DEMO")}
            </span>
            <strong>
              {localize(p.code)}
              {localize(" \u00B7")}
              {localize(p.destination)}
            </strong>
            <span>
              <i />
              {localize(p.phase)}
            </span>
          </div>
        ) : (
          <div className="mission">
            <span className="tiny">
              {localize("REAL NASA EARTH-ANALOG DATA")}
            </span>
            <strong>CFT70 · ID {selection.participantId}</strong>
            <span>
              POST {selection.session} · {localize("Read only")}
            </span>
          </div>
        )}
        <div className="navlabel">{localize("MISSION WORKSPACE")}</div>
        <nav>
          {localize(
            links.map(([to, label, Icon]) => (
              <NavLink key={to} to={to} end={to === "/"}>
                <Icon className="navicon" size={19} />
                {localize(label)}
                {localize(
                  to === "/plan" && selection.mode === "personal" && (
                    <span className="badge">
                      {localize(
                        state.sessions.filter(
                          (s) => s.profileId === p.id && s.day === p.day && !s.archivedAt,
                        ).length,
                      )}
                    </span>
                  ),
                )}
              </NavLink>
            )),
          )}
        </nav>
        <div className="sidebottom">
          <div className="offline">
            <i />
            <b>
              {localize(saving ? "Saving locally…" : "Local workspace ready")}
            </b>
            <small>{localize(offline)}</small>
          </div>
          {selection.mode === "personal" ? (
            <div className="profile">
              <span className="avatar">{localize(p.initials)}</span>
              <div className="side-profile">
                <ProfileSelector />
                <small>
                  {localize("DEMO \u00B7")}
                  {localize(p.code)}
                  {localize(" \u00B7 Day")}
                  {localize(p.day)}
                </small>
                <small>{localize(p.phase)}</small>
              </div>
              <Link
                to="/settings"
                aria-label={localize("Profile and settings")}
              >
                <Settings size={16} />
              </Link>
            </div>
          ) : (
            <div className="profile">
              <span className="avatar">ID</span>
              <div>
                <b>CFT70 · {selection.participantId}</b>
                <small>
                  {localize("Research participant, not an astronaut profile")}
                </small>
              </div>
            </div>
          )}
        </div>
      </aside>
      <div className={`workspace ${state.compact ? "compact" : ""}`}>
        <header>
          <div>
            <span className="breadcrumb">{localize("MISSION CONTROL")}</span>
            <span className="slash">{localize("/")}</span>
            <span>
              {localize(
                links.find(([to]) => to === pathname)?.[1] ||
                  "Profile and settings",
              )}
            </span>
          </div>
          <div className="headright">
            <span className="connection">
              <i />
              {localize(
                selection.mode === "research"
                  ? "Real NASA Earth-analog data"
                  : "Local data · DEMO",
              )}
            </span>
            <span className="date">
              {selection.mode === "research"
                ? `POST ${selection.session}`
                : dateFor(p, p.day)}
            </span>
            <LanguageSwitcher />
            <Link
              className="iconbutton"
              to="/settings"
              aria-label={localize("Settings")}
            >
              <Settings size={16} />
            </Link>
          </div>
        </header>
        <main id="page">
          <ModeBar />
          <Outlet />
        </main>
        <footer>
          <span>
            <b>{localize("RANGERS")}</b>
            <span className="dot">{localize("\u00B7")}</span>
            {localize("NASA SPACE APPS 2026")}
          </span>
          <span>
            {localize("Every step, further forward.")}
            <span className="orbitmark">{localize("\u2726")}</span>
          </span>
        </footer>
      </div>
    </>
  );
}
