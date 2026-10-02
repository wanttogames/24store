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
