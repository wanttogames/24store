import { describe, it, expect } from "vitest";
import { cameraAppearance } from "../src/systems/CCTVManager";
import { anomalies } from "../src/data/anomalies";
import { storyEncounter } from "../src/data/story";
import { createSchedule } from "../src/systems/CustomerManager";
describe("visual CCTV evidence", () => {
  it("shows ordinary customers consistently", () => {
    const e = createSchedule(1)[0],
      v = cameraAppearance(e, 1, 100);
    expect(v.visible).toBe(true);
    expect(v.faceless).toBe(false);
    expect(v.frozen).toBe(false);
    expect(v.shadow).toBe(false);
  });
  it("hides faces only in the camera view and reveals the mirror visitor", () => {
    expect(
      cameraAppearance({ ...anomalies[0], minute: 120 }, 2, 100).faceless,
    ).toBe(true);
    const mirror = {
      ...anomalies.find((e) => e.id === "mirror")!,
      minute: 120,
    };
    expect(mirror.ghost).toBe(true);
    expect(cameraAppearance(mirror, 3, 100).visible).toBe(true);
  });
  it("progresses the woman from a fixed stare to an old uniform and a shadow", () => {
    expect(cameraAppearance(storyEncounter(1), 1, 100).frozen).toBe(true);
    expect(cameraAppearance(storyEncounter(3), 3, 100).uniform).toBe(true);
    expect(cameraAppearance(storyEncounter(4), 4, 100).date).toBe("1998.03.17");
    expect(cameraAppearance(storyEncounter(6), 6, 100).shadow).toBe(true);
  });
  it("preserves stored evidence when low sanity damages the live signal", () => {
    const e = storyEncounter(6);
    expect(cameraAppearance(e, 6, 30).noise).toBe(true);
    const stored = cameraAppearance(e, 6, 30, true);
    expect(stored.noise).toBe(false);
    expect(stored.shadow).toBe(true);
  });
  it("draws the product date mismatch in the camera feed", () => {
    const e = { ...anomalies.find((e) => e.id === "expiry")!, minute: 120 };
    expect(cameraAppearance(e, 4, 100).label).toBe("2006.10.03");
  });
});
