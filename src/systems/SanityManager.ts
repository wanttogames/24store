export const clamp = (n: number) => Math.min(100, Math.max(0, n));
export const sanityLabel = (n: number) =>
  n > 70 ? "정상" : n > 40 ? "불안" : n > 0 ? "위험" : "붕괴";
