import { localize } from "./i18n";
import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
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
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Library = lazy(() => import("./pages/Library"));
const History = lazy(() => import("./pages/History"));
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
          <Route path="reports" element={<Reports />} />
          <Route
            path="library"
            element={<Library key={state.selectedProfile} />}
          />
          <Route path="history" element={<History />} />
          <Route path="settings" element={<Research />} />
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
            <Pages />
          </RecoveryProvider>
        </BrowserRouter>
      </LocaleProvider>
    </ErrorBoundary>
  </StrictMode>,
);
