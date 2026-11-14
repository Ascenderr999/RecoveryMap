import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { RecoveryProvider, useRecovery } from "./hooks/useRecovery";
import { AppLayout } from "./layouts/AppLayout";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./styles/index.css";
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Plan = lazy(() => import("./pages/Plan"));
const Assessment = lazy(() => import("./pages/Assessment"));
const Gap = lazy(() => import("./pages/Gap"));
const Reports = lazy(() => import("./pages/Reports"));
const Research = lazy(() => import("./pages/Research"));
function Pages() {
  const { state } = useRecovery();
  return (
    <Suspense fallback={<div className="boot">Loading workspace…</div>}>
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
          <Route path="research" element={<Research />} />
          <Route
            path="*"
            element={
              <div className="boot">
                <h1>Page not found</h1>
                <Link to="/">Return to Mission Control</Link>
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
      <BrowserRouter>
        <RecoveryProvider>
          <Pages />
        </RecoveryProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
);
