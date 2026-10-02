import type { Save, Run } from "../types";
const KEY = "24store-save-v1";
export const emptySave = (): Save => ({
  version: 1,
  run: null,
  codex: [],
  endings: [],
  muted: false,
});
export class SaveManager {
  warning = "";
  load(): Save {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return emptySave();
      const s = JSON.parse(raw);
      if (
        s.version !== 1 ||
        !Array.isArray(s.codex) ||
        !Array.isArray(s.endings) ||
        s.codex.some((v: unknown) => typeof v !== "string") ||
        (s.run && !validRun(s.run))
      )
        throw Error("save");
      return s;
    } catch {
      this.warning =
        "저장 파일을 읽지 못했습니다. 새 근무를 시작할 수 있습니다.";
      return emptySave();
    }
  }
  write(s: Save) {
    try {
      localStorage.setItem(KEY, JSON.stringify(s));
      this.warning = "";
    } catch {
      this.warning =
        "이 브라우저에서 저장할 수 없습니다. 탭을 닫으면 진행이 사라질 수 있습니다.";
    }
  }
}
function validRun(r: Run) {
  return (
    Number.isInteger(r.day) &&
    r.day >= 1 &&
    r.day <= 7 &&
    Number.isInteger(r.index) &&
    r.index >= 0 &&
    Array.isArray(r.schedule) &&
    r.schedule.length === 12 &&
    r.index <= 12 &&
    Number.isFinite(r.sanity) &&
    Number.isFinite(r.trust) &&
    Number.isFinite(r.sales) &&
    Array.isArray(r.inspected) &&
    Array.isArray(r.clues) &&
    Array.isArray(r.observedDays) &&
    Array.isArray(r.logs) &&
    r.currentLog &&
    r.schedule.every(
      (e) =>
        e &&
        typeof e.id === "string" &&
        Array.isArray(e.correct) &&
        Array.isArray(e.products),
    )
  );
}
