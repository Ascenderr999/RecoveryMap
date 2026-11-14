import { useEffect, useState } from "react";
export function useOfflineStatus() {
  const [status, setStatus] = useState(
    import.meta.env.DEV
      ? "Development · local records persist"
      : "Preparing offline app cache…",
  );
  useEffect(() => {
    if (import.meta.env.DEV) return;
    let mounted = true;
    const show = (s: string) => {
      if (mounted) setStatus(s);
    };
    async function verify() {
      if (!("serviceWorker" in navigator) || !("caches" in window)) {
        show("App caching unavailable in this browser");
        return;
      }
      try {
        const existing=await navigator.serviceWorker.getRegistration();
        if(existing?.active)void existing.update().catch(()=>{});
        else await navigator.serviceWorker.register("/sw.js", {updateViaCache:"none"});
        const response = await fetch("/offline-manifest.json", {
          cache: "no-cache",
        });
        if (!response.ok) throw Error();
        const manifest = (await response.json()) as {
          cacheName: string;
          assets: string[];
        };
        if (
          !manifest.cacheName.startsWith("recoverymap-") ||
          !Array.isArray(manifest.assets)
        )
          throw Error();
        let lastStatus='Offline cache incomplete. Keep a connection and reload.';
        for (let attempt = 0; attempt < 60 && mounted; attempt++) {
          if (await caches.has(manifest.cacheName)) {
            const cache = await caches.open(manifest.cacheName);
            const present = await Promise.all(
              manifest.assets.map((asset) => cache.match(asset)),
            );
            if (present.every(Boolean)&&navigator.serviceWorker.controller) {
              show("Offline research bundle verified · IndexedDB");
              return;
            }
            lastStatus=present.every(Boolean)?'Offline files cached; reload once to activate offline control.':`Offline cache incomplete: ${present.filter(Boolean).length}/${manifest.assets.length} files. Keep a connection and reload.`;
          }
          await new Promise((resolve) => setTimeout(resolve, 250));
        }
        show(lastStatus);
      } catch {
        show(
          "Offline cache could not be verified. Personal records remain local.",
        );
      }
    }
    void verify();
    return () => {
      mounted = false;
    };
  }, []);
  return status;
}
