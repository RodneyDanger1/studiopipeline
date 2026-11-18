import type { Ease } from "./model";

export function ease(t: number, kind: Ease | string): number {
  const x = Math.min(1, Math.max(0, t));
  if (kind === "ease_in_out") return x * x * (3 - 2 * x);
  if (kind === "ease_in") return x * x;
  if (kind === "ease_out") return 1 - (1 - x) ** 2;
  return x;
}

/** 1-based frame index, held on twos or threes. */
export function heldFrame(frame: number, shootOn: number): number {
  const on = Math.max(1, Math.round(shootOn) || 1);
  return Math.floor((frame - 1) / on) * on + 1;
}

export function cameraZ(
  frame: number,
  duration: number,
  shootOn: number,
  startZ: number,
  endZ: number,
  kind: string,
): number {
  const held = heldFrame(frame, shootOn);
  const t = (held - 1) / Math.max(1, duration - 1);
  return startZ + (endZ - startZ) * ease(t, kind);
}
