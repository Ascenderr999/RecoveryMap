import { localize } from "./i18n";
import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import { ResearchProvider } from "./research/ResearchContext";
import { RecoveryProvider, useRecovery } from "./hooks/useRecovery";
import { AppLayout } from "./layouts/AppLayout";
import { LocaleProvider, useLocale } from "./i18n";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./styles/index.css";
import "@fontsource/dm-sans/latin-ext-400.css";
import "@fontsource/dm-sans/latin-400.css";
import "@fontsource/dm-sans/latin-ext-500.css";
import "@fontsource/dm-sans/latin-500.css";
import "@fontsource/dm-sans/latin-ext-600.css";
import "@fontsource/dm-sans/latin-600.css";
import "@fontsource/dm-sans/latin-ext-700.css";
import "@fontsource/dm-sans/latin-700.css";
import "@fontsource/manrope/latin-ext-700.css";
import "@fontsource/manrope/latin-700.css";
import "@fontsource/manrope/latin-ext-800.css";
import "@fontsource/manrope/latin-800.css";
import "./styles/reference.css";
import "./styles/bridge.css";
import "./styles/research.css";
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Plan = lazy(() => import("./pages/Plan"));
const Assessment = lazy(() => import("./pages/Assessment"));
const Gap = lazy(() => import("./pages/Gap"));
const Reports = lazy(() => import("./pages/Reports"));
const Research = lazy(() => import("./pages/Research"));
function Pages() {
  useLocale();
  const { state } = useRecovery();
  return (
    <Suspense
      fallback={
        <div className="boot">{localize("Loading workspace\u2026")}</div>
      }
    >
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Dashboard key={state.selectedProfile} />} />
          <Route path="plan" element={<Plan key={state.selectedProfile} />} />
          <Route
            path="assessment"
            element={<Assessment key={state.selectedProfile} />}
          />
          <Route path="gap" element={<Gap />} />
          <Route path="reports" element={<Reports key={state.selectedProfile} />} />
          <Route
            path="library"
            element={<Navigate to="/plan?tab=library" replace />}
          />
          <Route
            path="history"
            element={<Navigate to="/reports?tab=history" replace />}
          />
          <Route
            path="settings"
            element={<Navigate to="/research?tab=settings" replace />}
          />
          <Route path="research" element={<Research />} />
          <Route
            path="*"
            element={
              <div className="boot">
                <h1>{localize("Page not found")}</h1>
                <Link to="/">{localize("Return to Mission Control")}</Link>
              </div>
            }
          />
        </Route>
      </Routes>
    </Suspense>
  );
}
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <LocaleProvider>
        <BrowserRouter>
          <RecoveryProvider>
            <ResearchProvider>
              <Pages />
            </ResearchProvider>
          </RecoveryProvider>
        </BrowserRouter>
      </LocaleProvider>
    </ErrorBoundary>
  </StrictMode>,
);
