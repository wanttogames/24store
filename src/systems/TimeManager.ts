export const SLOT_SECONDS = 18;
export function currentMinute(start: number, next: number, elapsed: number) {
  return Math.floor(
    start +
      Math.max(0, Math.min(1, elapsed / SLOT_SECONDS)) * (next - start - 1),
  );
}
export function formatTime(minute: number) {
  return `${Math.floor(minute / 60)
    .toString()
    .padStart(2, "0")}:${(minute % 60).toString().padStart(2, "0")}`;
}
