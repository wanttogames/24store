import type { Run, DayLog, Action, Save } from "../types";
import { createSchedule } from "./CustomerManager";
import { getProduct } from "../data/products";
import { clamp } from "./SanityManager";
const log = (day: number): DayLog => ({
  day,
  normal: 0,
  anomalies: 0,
  correct: 0,
  wrong: 0,
  sales: 0,
  sanity: 100,
  entries: [],
});
export const newRun = (): Run => ({
  day: 1,
  index: 0,
  sanity: 100,
  trust: 80,
  sales: 0,
  danger: 0,
  schedule: createSchedule(1),
  observedDays: [],
  clues: [],
  logs: [],
  currentLog: log(1),
  inspected: [],
  resolved: false,
  feedback: "",
  elapsed: 0,
});
export function canRelease(r: Run) {
  const days = [...new Set(r.observedDays)].sort((a, b) => a - b);
  const consecutive = days.some(
    (d) => days.includes(d + 1) && days.includes(d + 2),
  );
  return (
    consecutive &&
    ["memo", "article", "water", "shadow"].every((c) => r.clues.includes(c))
  );
}
export function collectClue(r: Run, source: string) {
  const e = r.schedule[r.index];
  if (e?.id !== "woman") return;
  const add = (c: string) => {
    if (!r.clues.includes(c)) r.clues.push(c);
  };
  if (source === "memo" && r.day === 4) add("memo");
  if (source === "memo" && r.day === 5) add("article");
  if (source === "product" && r.day >= 5) add("water");
  if (source === "replay" && r.day === 6) add("shadow");
}
export function decide(s: Save, action: Action): string {
  const r = s.run!;
  if (r.resolved || r.ending || r.index >= 12) return r.feedback;
  const e = r.schedule[r.index];
  if (
    ![
      "pay",
      "refuse",
      "report",
      "ignore",
      ...(e.extra || []),
      "replay",
    ].includes(action)
  )
    return "";
  if (action === "replay") {
    collectClue(r, "replay");
    return "저장 영상 확인: " + e.cctv;
  }
  let correct = e.correct.includes(action);
  if (e.id === "woman" && r.day === 7) {
    correct = action === "release" && canRelease(r);
    if (action === "release" && !canRelease(r)) {
      r.feedback =
        "그녀를 돌려보낼 근거가 부족하다. 3일 연속 관찰과 메모·기사·생수·6일째 저장 영상이 필요하다.";
      return r.feedback;
    }
    if (action === "lock" || action === "pay" || action === "ignore")
      correct = true;
  }
  if (
    e.id === "woman" &&
    r.inspected.includes("customer") &&
    r.inspected.includes("cctv") &&
    r.inspected.includes("product") &&
    !r.observedDays.includes(r.day)
  )
    r.observedDays.push(r.day);
  r.resolved = true;
  if (e.kind === "normal") r.currentLog.normal++;
  else r.currentLog.anomalies++;
  if (correct) {
    r.currentLog.correct++;
    r.sanity = clamp(r.sanity + (e.kind === "normal" ? 2 : 3));
    r.trust = clamp(r.trust + 1);
    if (e.kind !== "normal" && !s.codex.includes(e.id) && e.id !== "woman")
      s.codex.push(e.id);
  } else {
    r.currentLog.wrong++;
    r.sanity = clamp(r.sanity - (e.kind === "normal" ? 3 : e.sanityCost || 17));
    r.trust = clamp(r.trust - (e.kind === "normal" ? 12 : 3));
    if (e.id === "faceless" && action === "pay") r.danger++;
  }
  if (action === "pay") {
    const amount = e.products.reduce((n, p) => n + getProduct(p).price, 0);
    r.sales += amount;
    r.currentLog.sales += amount;
  }
  if (
    r.observedDays.some(
      (d) => r.observedDays.includes(d + 1) && r.observedDays.includes(d + 2),
    ) &&
    !s.codex.includes("woman")
  )
    s.codex.push("woman");
  r.feedback = correct
    ? e.result
    : e.kind === "normal"
      ? "손님은 불만을 남기고 나갔다. 점장이 매출과 민원을 확인했다."
      : e.id === "faceless" && action === "pay"
        ? "결제는 끝났다. 손님은 나갔지만 CCTV의 빈 얼굴이 다른 영상에도 나타난다."
        : "처리가 끝났지만 매장에 차가운 기운이 남았다. 기록을 다시 비교해야 한다.";
  r.currentLog.entries.push(
    `${e.id === "woman" ? "03:17" : e.minute === 361 ? "06:01" : `${Math.floor(e.minute / 60)}:${String(e.minute % 60).padStart(2, "0")}`} · ${correct ? "적절한 판단" : "판단 재검토"} · ${e.kind === "normal" ? "손님 응대" : e.line}`,
  );
  if (e.fatal?.includes(action)) r.ending = "missing";
  else if (r.sanity <= 0) r.ending = "bad";
  else if (r.trust <= 0) r.ending = "fired";
  else if (
    e.id === "woman" &&
    r.day === 7 &&
    action === "release" &&
    canRelease(r)
  )
    r.ending = "true";
  if (r.ending && !s.endings.includes(r.ending)) s.endings.push(r.ending);
  return r.feedback;
}
export function nextEncounter(r: Run) {
  if (!r.resolved || r.ending) return;
  r.index++;
  r.inspected = [];
  r.elapsed = 0;
  r.feedback = "";
  r.resolved = false;
  if (r.index === 12) {
    r.currentLog.sanity = r.sanity;
    if (!r.logs.some((l) => l.day === r.day))
      r.logs.push(structuredClone(r.currentLog));
  }
}
export function nextDay(s: Save) {
  const r = s.run!;
  if (r.index !== 12) return;
  if (r.day === 7) {
    r.ending = "normal";
    if (!s.endings.includes("normal")) s.endings.push("normal");
    return;
  }
  r.day++;
  r.index = 0;
  r.schedule = createSchedule(r.day, r.danger);
  r.currentLog = log(r.day);
  r.sanity = clamp(r.sanity + 8);
  r.inspected = [];
  r.resolved = false;
  r.elapsed = 0;
}
