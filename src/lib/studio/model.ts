/** DeepSeek-V4.1-Flash-1017. Official API id is `deepseek-flash`.
 *  Checked 2026-11-11 against https://api-docs.deepseek.com/quick_start/pricing/
 *  and https://api-docs.deepseek.com/updates (V4.1-Flash-1017).
 */
export const DEEPSEEK = {
  modelId: "deepseek-flash",
  version: "DeepSeek-V4.1-Flash-1017",
  baseUrl: "https://api.deepseek.com",
  context: "1M",
  maxOutput: "384K",
  /** Peak USD per 1M tokens. Off-peak is half. Cache-hit input is $0.006. */
  priceInPerM: 0.3,
  priceOutPerM: 1.2,
  priceCacheHitPerM: 0.006,
  docs: "https://api-docs.deepseek.com/",
} as const;

export const DEFAULT_BRIEF = `A 30-second original dusk fable. Mira, a lantern keeper on a pine ridge, watches the valley lights go out one by one and walks the switchbacks with the last steady lantern. Warm paper colors, drawn on twos, gentle dolly. No existing films, brands, or real people.`;

export const DEFAULT_BIBLE = `SERIES: The Last Lantern. Original world. No borrowed characters, logos, or celebrity likenesses.
MIRA: lantern keeper. Pine cloak, amber lantern, three flat shading bands, ink line. Voice: warm, quick, a little dry. Outfit colors never change.
WORLD: pine ridge above a valley at dusk. Lights in the valley are practical lamps, not signage. No modern brands.
LOOK: shoot on twos, xerox ink on flat cel color, one hard shadow, gouache backgrounds. Preview 1280x720, master later 1920x1080, 24 fps.`;

export const STAGES = [
  { id: "S0", name: "Story", detail: "Brief to beats" },
  { id: "S1", name: "Manifest", detail: "Shot list, validated" },
  { id: "S2", name: "Assets", detail: "Original art" },
  { id: "S3", name: "Style", detail: "Palette and line" },
  { id: "S4", name: "Prep", detail: "Trace and lock" },
  { id: "S5", name: "Animate", detail: "2.5D multiplane" },
  { id: "S6", name: "Ink", detail: "Cel pass" },
  { id: "S7", name: "Comp", detail: "Camera and grain" },
  { id: "S8", name: "Voice", detail: "Dialogue timing" },
  { id: "S9", name: "Edit", detail: "Assemble" },
  { id: "S10", name: "Mix", detail: "Loudness" },
  { id: "S11", name: "QC", detail: "Platform check" },
  { id: "S12", name: "Deliver", detail: "Human uploads" },
] as const;

export type Ease = "linear" | "ease_in" | "ease_out" | "ease_in_out";

export type Shot = {
  shot_id: string;
  episode: number;
  lane: "blender_2p5d";
  fps: number;
  resolution: [number, number];
  duration_frames: number;
  shoot_on: 1 | 2 | 3;
  camera: { move: string; start_z: number; end_z: number; ease: Ease };
  layers: { name: string; image: string; depth: number }[];
  fx: string[];
  dialogue: { character: string; text: string; start_frame: number }[];
  notes: string;
};

export type Beat = { title: string; seconds: number; summary: string };

export type Episode = {
  title: string;
  logline: string;
  source: "deepseek" | "house-draft";
  model: string;
  fps: number;
  target_seconds: number;
  beats: Beat[];
  shots: Shot[];
};

export type LedgerRow = {
  ts: number;
  label: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  usd: number;
};

export type Usage = {
  prompt_tokens?: number;
  completion_tokens?: number;
  prompt_cache_hit_tokens?: number;
  prompt_cache_miss_tokens?: number;
};

export function estimateUsd(usage: Usage): number {
  const hit = usage.prompt_cache_hit_tokens ?? 0;
  const miss =
    usage.prompt_cache_miss_tokens ??
    Math.max(0, (usage.prompt_tokens ?? 0) - hit);
  const out = usage.completion_tokens ?? 0;
  return (
    (hit * DEEPSEEK.priceCacheHitPerM) / 1e6 +
    (miss * DEEPSEEK.priceInPerM) / 1e6 +
    (out * DEEPSEEK.priceOutPerM) / 1e6
  );
}

export function maskKey(key: string): string {
  const t = key.trim();
  if (t.length < 8) return t ? "saved" : "";
  return `••••${t.slice(-4)}`;
}
