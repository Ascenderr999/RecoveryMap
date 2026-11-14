import { useEffect, useState } from "react";

/** Report actual app-shell caching support rather than assuming browser support. */
export function useOfflineStatus() {
  const [status, setStatus] = useState(
    import.meta.env.DEV
      ? "Development · local records persist"
      : "Preparing offline app cache…",
  );
  useEffect(() => {
    if (import.meta.env.DEV) return;
    let mounted = true;
    const show = (message: string) => {
      if (mounted) setStatus(message);
    };
    if (!("serviceWorker" in navigator)) {
      show("App caching unavailable in this browser");
      return;
    }
    navigator.serviceWorker
      .register("/sw.js")
      .then(() => navigator.serviceWorker.ready)
      .then(() => show("Offline app cache ready · IndexedDB"))
      .catch(async () => {
        const existing = await navigator.serviceWorker
          .getRegistration()
          .catch(() => undefined);
        show(
          existing?.active
            ? "Offline app cache ready · IndexedDB"
            : "App caching unavailable · records stay local",
        );
      });
    return () => {
      mounted = false;
    };
  }, []);
  return status;
}
