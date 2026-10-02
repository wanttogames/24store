import { customers } from "../data/customers";
import { anomalies } from "../data/anomalies";
import { storyEncounter } from "../data/story";
import { products } from "../data/products";
import type { Encounter } from "../types";
const times = [10, 38, 68, 97, 126, 158, 197, 224, 253, 284, 320, 350];
export function shuffle<T>(list: T[], rng = Math.random): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export function createSchedule(
  day: number,
  danger = 0,
  rng = Math.random,
): Encounter[] {
  const pool = shuffle(customers.slice(0, 8), rng);
  const entries: Encounter[] = times.map((minute, i) => {
    const c = pool[i % pool.length];
    const basket = shuffle(
      products.filter((p) => p.id !== "oldmilk" && p.id !== "beer"),
      rng,
    )
      .slice(0, 1 + Math.floor(rng() * 2))
      .map((p) => p.id);
    return {
      id: `normal-${day}-${i}`,
      minute,
      customer: c.id,
      products: basket,
      kind: "normal",
      line: c.line,
      look: c.look,
      productClue: "상품명과 가격, 유통기한이 POS 등록 정보와 일치한다.",
      cctv: "실제 모습과 영상이 일치한다. 그림자도 자연스럽게 움직인다.",
      correct: ["pay"],
      result: "정상 결제. 손님은 영수증을 받고 조용히 나갔다.",
    };
  });
  entries[6] = storyEncounter(day);
  if (day > 1) {
    const selections = shuffle(anomalies, rng);
    const slots = shuffle([3, 4, 5, 7, 8, 9, 10], rng).slice(0, 2);
    slots.forEach(
      (slot, i) => (entries[slot] = { ...selections[i], minute: times[slot] }),
    );
  }
  if (danger >= 2 && day > 2) entries[9] = { ...anomalies[0], minute: 284 };
  if (day === 6)
    entries[9] = {
      id: "blackout",
      minute: 284,
      kind: "anomaly",
      customer: "stranger",
      products: [],
      ghost: true,
      line: "형광등이 꺼졌다. 창고 문이 저절로 열린다.",
      look: "계산대에는 아무도 없다. 냉장고 쪽에서 발소리가 난다.",
      productClue: "POS는 계속 켜져 있다.",
      cctv: "창고 안쪽에 작은 불빛. 매장에는 여러 그림자가 지나간다.",
      extra: ["hide", "lights"],
      correct: ["hide"],
      result: "창고에서 소리가 지나가기를 기다렸다. 다시 불이 들어왔다.",
    };
  if (day === 7)
    entries[11] = {
      id: "last",
      minute: 361,
      kind: "anomaly",
      customer: "stranger",
      products: [],
      line: "퇴근하셔도 됩니다. 문만 열어주세요.",
      look: "이미 잠긴 문 안쪽에 손님이 서 있다. 젖은 발자국이 없다.",
      productClue: "영수증에는 당신의 이름이 적혀 있다.",
      cctv: "그 사람 대신 계산대 뒤 검은 그림자가 보인다.",
      extra: ["lock", "hide"],
      correct: ["lock"],
      fatal: ["pay"],
      result: "문을 잠그고 교대자가 올 때까지 기다렸다.",
    };
  return entries;
}
