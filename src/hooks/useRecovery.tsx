import { localize } from "../i18n";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  type ReactNode,
} from "react";
import { db } from "../db/store";
import type { DemoState } from "../types";
const Context = createContext<{
  state: DemoState;
  update: (fn: (s: DemoState) => DemoState) => Promise<boolean>;
  reset: () => Promise<boolean>;
  saving: boolean;
} | null>(null);
export function RecoveryProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState | null>(null),
    [error, setError] = useState(""),
    [saving, setSaving] = useState(false);
  const busy = useRef(false);
  useEffect(() => {
    db.load()
      .then(setState)
      .catch(() =>
        setError(
          "Local database could not open. Allow browser storage, then reload.",
        ),
      );
  }, []);
  async function update(fn: (s: DemoState) => DemoState) {
    if (!state || busy.current) return false;
    busy.current = true;
    setSaving(true);
    try {
      const next = fn(state);
      await db.save(next);
      setState(next);
      return true;
    } catch {
      setError(
        "Your change could not be saved. Check available browser storage and try again.",
      );
      return false;
    } finally {
      busy.current = false;
      setSaving(false);
    }
  }
  async function reset() {
    if (busy.current) return false;
    busy.current = true;
    setSaving(true);
    try {
      setState(await db.reset());
      return true;
    } catch {
      setError("Reset failed. Your previous data remains available.");
      return false;
    } finally {
      busy.current = false;
      setSaving(false);
    }
  }
  if (!state)
    return (
      <div className="boot">
        <strong>{localize("R / RecoveryMap")}</strong>
        <p>{localize(error || "Initializing local mission workspace…")}</p>
      </div>
    );
  return (
    <Context.Provider value={{ state, update, reset, saving }}>
      {localize(
        error && (
          <div role="alert" className="error">
            {localize(error)}
            <button onClick={() => setError("")}>{localize("Dismiss")}</button>
          </div>
        ),
      )}
      {localize(children)}
    </Context.Provider>
  );
}
export function useRecovery() {
  const ctx = useContext(Context);
  if (!ctx) throw Error("Missing recovery provider");
  return ctx;
}
