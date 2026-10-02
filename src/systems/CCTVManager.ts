import type { Encounter } from "../types";
export function cctvReading(
  e: Encounter,
  sanity: number,
  replay = false,
): string {
  if (sanity <= 40 && !replay)
    return "신호가 불안정합니다. 서로 다른 프레임이 겹칩니다. [CCTV 다시 보기]로 저장 영상을 비교하세요.";
  return e.cctv;
}
export interface CameraAppearance {
  visible: boolean;
  faceless: boolean;
  frozen: boolean;
  uniform: boolean;
  shadow: boolean;
  date: string;
  label?: string;
  brand?: string;
  noise: boolean;
}
export function cameraAppearance(
  e: Encounter | undefined,
  day: number,
  sanity: number,
  replay = false,
): CameraAppearance {
  const story = e?.id === "woman";
  return {
    visible:
      !!e &&
      (e.id === "mirror" || e.id === "bell" || (!e.ghost && e.id !== "silent")),
    faceless: e?.id === "faceless",
    frozen: !!story || e?.kind === "anomaly",
    uniform: !!story && day >= 3,
    shadow: (!!story && day >= 6) || e?.id === "last" || e?.id === "blackout",
    date:
      story && day >= 4
        ? "1998.03.17"
        : "2026.10." + String(day + 1).padStart(2, "0"),
    label:
      e?.id === "expiry"
        ? "2006.10.03"
        : e?.id === "oldmilk"
          ? "1998.03.17"
          : e?.id === "silent"
            ? "PRICE 0"
            : undefined,
    brand: e?.id === "brand" ? "LAST STORE / 0000" : undefined,
    noise: sanity <= 40 && !replay,
  };
}
