import { describe, it, expect } from "vitest";
import {
  newRun,
  decide,
  nextEncounter,
  nextDay,
  canRelease,
  collectClue,
} from "../src/systems/EventManager";
import { emptySave, SaveManager } from "../src/systems/SaveManager";
import { createSchedule } from "../src/systems/CustomerManager";
import { storyEncounter } from "../src/data/story";
import { anomalies } from "../src/data/anomalies";
import { currentMinute } from "../src/systems/TimeManager";
import type { Action } from "../src/types";
const save = () => ({ ...emptySave(), run: newRun() });
describe("7-night campaign", () => {
  it("has exactly twelve visitors, a fixed 03:17 story and a majority of ordinary customers", () => {
    for (let day = 1; day <= 7; day++) {
      const list = createSchedule(day);
      expect(list).toHaveLength(12);
      expect(list[6].minute).toBe(197);
      expect(
        list.filter((e) => e.kind === "normal").length,
      ).toBeGreaterThanOrEqual(8);
      expect(list.filter((e) => e.id === "woman")).toHaveLength(1);
    }
  });
  it("completes all seven nights once and awards NORMAL END", () => {
    const s = save();
    for (let day = 1; day <= 7; day++) {
      for (let i = 0; i < 12; i++) {
        const e = s.run.schedule[i];
        decide(s, e.id === "woman" ? "pay" : e.correct[0]);
        nextEncounter(s.run);
      }
      expect(s.run.logs).toHaveLength(day);
      nextDay(s);
    }
    expect(s.run.ending).toBe("normal");
    expect(s.endings).toContain("normal");
  });
  it("unlocks TRUE END with consecutive observation and the four story clues", () => {
    const s = save();
    s.run.day = 7;
    s.run.schedule[0] = storyEncounter(7);
    s.run.observedDays = [1, 2, 3];
    s.run.clues = ["memo", "article", "water", "shadow"];
    expect(canRelease(s.run)).toBe(true);
    decide(s, "release");
    expect(s.run.ending).toBe("true");
  });
  it("does not resolve the final choice without sufficient evidence", () => {
    const s = save();
    s.run.day = 7;
    s.run.schedule[0] = storyEncounter(7);
    decide(s, "release");
    expect(s.run.resolved).toBe(false);
    expect(s.run.ending).toBeUndefined();
  });
  it("rejects nonconsecutive observation and duplicate days", () => {
    const s = save();
    s.run.observedDays = [1, 1, 3, 5];
    s.run.clues = ["memo", "article", "water", "shadow"];
    expect(canRelease(s.run)).toBe(false);
  });
  it("awards missing, bad and fired endings with their actual triggers", () => {
    const missing = save();
    missing.run.schedule[0] = {
      ...anomalies.find((a) => a.id === "behind")!,
      minute: 120,
    };
    decide(missing, "turn");
    expect(missing.run.ending).toBe("missing");
    const bad = save();
    bad.run.sanity = 5;
    bad.run.schedule[0] = { ...anomalies[1], minute: 120 };
    decide(bad, "ignore");
    expect(bad.run.ending).toBe("bad");
    const fired = save();
    fired.run.trust = 5;
    decide(fired, "refuse");
    expect(fired.run.ending).toBe("fired");
  });
  it("prevents duplicate rewards and cannot advance undecided encounters", () => {
    const s = save();
    nextEncounter(s.run);
    expect(s.run.index).toBe(0);
    decide(s, "pay");
    const amount = s.run.sales;
    decide(s, "pay");
    expect(s.run.sales).toBe(amount);
    nextEncounter(s.run);
    expect(s.run.inspected).toEqual([]);
    expect(s.run.elapsed).toBe(0);
  });
  it("gathers evidence only in the relevant story encounter", () => {
    const s = save();
    s.run.day = 6;
    s.run.schedule[0] = storyEncounter(6);
    collectClue(s.run, "replay");
    expect(s.run.clues).toContain("shadow");
    const before = s.run.sanity;
    decide(s, "replay");
    expect(s.run.resolved).toBe(false);
    expect(s.run.sanity).toBe(before);
  });
  it("allows benign faceless payment but increases future event pressure", () => {
    const s = save();
    s.run.schedule[0] = { ...anomalies[0], minute: 120 };
    decide(s, "pay");
    expect(s.run.danger).toBe(1);
    expect(s.run.ending).toBeUndefined();
  });
  it("does not fire hidden actions that are absent from the encounter", () => {
    const s = save();
    decide(s, "turn" as Action);
    expect(s.run.resolved).toBe(false);
  });
  it("holds the clock before the next story event rather than skipping it", () => {
    expect(currentMinute(158, 197, 999)).toBe(196);
  });
});
describe("save resilience", () => {
  it("roundtrips a campaign and persistent collections", () => {
    const memory = new Map<string, string>();
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: {
        getItem: (k: string) => memory.get(k) || null,
        setItem: (k: string, v: string) => memory.set(k, v),
      },
    });
    const sm = new SaveManager(),
      s = save();
    s.codex = ["woman"];
    sm.write(s);
    expect(sm.load()).toEqual(s);
    memory.set("24store-save-v1", "{broken");
    expect(sm.load().run).toBeNull();
    expect(sm.warning).not.toBe("");
  });
});
