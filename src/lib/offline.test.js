import { describe, it, expect } from "vitest";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";

describe("offline app-shell lifecycle", () => {
  it("deduplicates precache entries and serves routes and bundles without a network", async () => {
    const handlers = {};
    const entries = new Map();
    const origin = "http://127.0.0.1:4173";
    const key = (request) =>
      typeof request === "string" ? request : request.url.replace(origin, "");
    const cache = {
      addAll: async (urls) => {
        expect(new Set(urls).size).toBe(urls.length);
        for (const url of urls)
          entries.set(
            url,
            new Response(
              url === "/" ? "<html>Cached app shell</html>" : "cached bundle",
            ),
          );
      },
      put: async (request, response) => entries.set(key(request), response),
    };
    let online = true;
    const context = {
      self: {
        location: { origin },
        addEventListener: (type, fn) => {
          handlers[type] = fn;
        },
        skipWaiting() {},
        clients: { claim: async () => {} },
      },
      caches: {
        open: async () => cache,
        keys: async () => ["recoverymap-old", "recoverymap-v1"],
        delete: async () => true,
        match: async (request) => entries.get(key(request))?.clone(),
      },
      fetch: async () => {
        if (!online) throw Error("offline");
        if (online === "http-error") return new Response("Unavailable", { status: 503 });
        return new Response('<script src="/assets/main.js"></script>');
      },
      URL,
      Response,
    };
    // Mirror the build-time injection of every lazy route bundle.
    const source = (await readFile("public/sw.js", "utf8")).replace(
      "['/',...assets]",
      "['/',...assets,'/assets/main.js','/assets/gap.js']",
    );
    runInNewContext(source, context);
    let pending;
    handlers.install({
      waitUntil: (promise) => {
        pending = promise;
      },
    });
    await pending;
    handlers.activate({
      waitUntil: (promise) => {
        pending = promise;
      },
    });
    await pending;
    online = false;
    async function request(path, mode) {
      let response;
      handlers.fetch({
        request: { method: "GET", url: origin + path, mode },
        respondWith: (promise) => {
          response = promise;
        },
      });
      return response;
    }
    expect(await (await request("/gap", "navigate")).text()).toContain(
      "Cached app shell",
    );
    expect(await (await request("/assets/gap.js", "cors")).text()).toBe(
      "cached bundle",
    );
    expect((await request("/unknown.js", "cors")).type).toBe("error");
    online = "http-error";
    expect(await (await request("/reports", "navigate")).text()).toContain("Cached app shell");
    let intercepted = false;
    handlers.fetch({
      request: { method: "POST", url: origin + "/anything" },
      respondWith: () => {
        intercepted = true;
      },
    });
    expect(intercepted).toBe(false);
  });
});
