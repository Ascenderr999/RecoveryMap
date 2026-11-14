import Dexie, { type Table } from "dexie";
import type { DemoState } from "../types";
import { createSeed } from "../data/seed";
export class RecoveryDatabase extends Dexie {
  state!: Table<DemoState & { id: string }, string>;
  constructor(name = "RecoveryMap-v1") {
    super(name);
    this.version(1).stores({ state: "id" });
  }
  async load() {
    return this.transaction("rw", this.state, async () => {
      const saved = await this.state.get("demo");
      if (saved) return saved;
      const seed = createSeed();
      await this.state.put({ ...seed, id: "demo" });
      return seed;
    });
  }
  async save(state: DemoState) {
    await this.state.put({ ...state, id: "demo" });
  }
  async reset() {
    const seed = createSeed();
    await this.save(seed);
    return seed;
  }
}
export const db = new RecoveryDatabase();
