import "fake-indexeddb/auto";
import { describe, it, expect } from "vitest";
import { RecoveryDatabase } from "./store";
describe("IndexedDB lifecycle", () => {
  it("seeds once, persists changes across reopening, isolates profiles, and resets", async () => {
    const name = "test-" + crypto.randomUUID();
    let db = new RecoveryDatabase(name);
    const seed = await db.load();
    expect((await db.load()).assessments).toHaveLength(seed.assessments.length);
    const chen = seed.sessions.filter((s) => s.profileId === "chen");
    await db.save({
      ...seed,
      selectedProfile: "rivera",
      compact: true,
      sessions: seed.sessions.map((s) =>
        s.id === "morgan-14-0"
          ? { ...s, status: "completed", notes: "Persistence test" }
          : s,
      ),
      assessments: [
        ...seed.assessments,
        {
          id: "manual",
          profileId: "rivera",
          date: "2026-11-15",
          metric: "balance",
          value: 42,
        },
      ],
    });
    db.close();
    db = new RecoveryDatabase(name);
    const loaded = await db.load();
    expect(loaded.selectedProfile).toBe("rivera");
    expect(loaded.compact).toBe(true);
    expect(loaded.sessions.find((s) => s.id === "morgan-14-0")?.notes).toBe(
      "Persistence test",
    );
    expect(loaded.sessions.filter((s) => s.profileId === "chen")).toEqual(chen);
    expect(loaded.assessments.find((a) => a.id === "manual")?.profileId).toBe(
      "rivera",
    );
    const reset = await db.reset();
    expect(reset.selectedProfile).toBe("morgan");
    expect(reset.assessments).toHaveLength(seed.assessments.length);
    expect((await db.load()).sessions).toEqual(seed.sessions);
    await db.delete();
  });
});
