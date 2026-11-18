import type { Shot } from "./model";
import { cameraZ, heldFrame } from "./timing";

/** Layout gain and placement match pipeline/src/studio/tools/pillow_plane.py. */
const GAIN = 2.2;

type Light = { x: number; y: number; die: number };
type CelMeta = { lantern: { x: number; y: number }; lights: Light[] };
type CelPack = {
  sky: HTMLImageElement;
  valley: HTMLImageElement;
  pines: HTMLImageElement;
  ridge: HTMLImageElement;
  mira: HTMLImageElement;
  meta: CelMeta;
};

let pack: CelPack | null = null;
let failed = false;
const listeners = new Set<() => void>();

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Could not load ${src}`));
    img.src = src;
  });
}

export function celsReady(): boolean {
  return pack !== null;
}

export function subscribeCels(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function ensureCels() {
  if (pack || failed || typeof window === "undefined") return;
  const base = "/media/cels";
  void Promise.all([
    loadImage(`${base}/sky.jpg`),
    loadImage(`${base}/valley.png`),
    loadImage(`${base}/pines.png`),
    loadImage(`${base}/ridge.png`),
    loadImage(`${base}/mira.png`),
    fetch(`${base}/meta.json`).then((res) => {
      if (!res.ok) throw new Error("cel meta missing");
      return res.json() as Promise<CelMeta>;
    }),
  ])
    .then(([sky, valley, pines, ridge, mira, meta]) => {
      pack = {
        sky,
        valley,
        pines,
        ridge,
        mira,
        meta: {
          lantern: meta.lantern ?? { x: 0.16, y: 0.58 },
          lights: Array.isArray(meta.lights) ? meta.lights : [],
        },
      };
      failed = false;
      listeners.forEach((fn) => fn());
    })
    .catch(() => {
      failed = true;
      listeners.forEach((fn) => fn());
    });
}

function pushAmount(shot: Shot, frame: number): number {
  const z = cameraZ(
    frame,
    shot.duration_frames,
    shot.shoot_on,
    shot.camera.start_z,
    shot.camera.end_z,
    shot.camera.ease,
  );
  const travel = (shot.camera.start_z - z) / Math.max(0.5, Math.abs(shot.camera.start_z));
  return travel * GAIN;
}

function heroFrac(shot: Shot): number {
  const hit = shot.layers.find((layer) => /hero|mira|character/i.test(layer.name));
  const depth = hit?.depth ?? 12;
  return Math.max(0.42, Math.min(0.82, 0.5 + (12 - depth) * 0.045));
}

function paste(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  w: number,
  h: number,
  scale: number,
  ox: number,
  oy: number,
  anchor: "center" | "bottom",
) {
  const dw = w * scale;
  const dh = h * scale;
  const x = (w - dw) / 2 + ox;
  const y = anchor === "bottom" ? h - dh + oy : (h - dh) / 2 + oy;
  ctx.drawImage(img, x, y, dw, dh);
  return { x, y, dw, dh };
}

function paintCels(ctx: CanvasRenderingContext2D, w: number, h: number, shot: Shot, frame: number, art: CelPack) {
  const push = pushAmount(shot, frame);
  const held = heldFrame(frame, shot.shoot_on);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  paste(ctx, art.sky, w, h, 1.16 + push * 0.08, -push * w * 0.02, -h * 0.02, "center");
  const valley = paste(ctx, art.valley, w, h, 1.32 + push * 0.18, -push * w * 0.05, h * 0.06, "center");
  if (art.meta.lights.length) {
    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    for (const light of art.meta.lights) {
      if (held < light.die) continue;
      const sx = valley.x + light.x * valley.dw;
      const sy = valley.y + light.y * valley.dh;
      const rad = Math.max(3, valley.dw * 0.008);
      ctx.fillStyle = "rgba(18, 14, 24, 0.82)";
      ctx.beginPath();
      ctx.arc(sx, sy, rad, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
  paste(ctx, art.pines, w, h, 1.5 + push * 0.28, -push * w * 0.08, h * 0.1, "center");
  const hh = h * (heroFrac(shot) + push * 0.08);
  const hw = hh * (art.mira.naturalWidth / Math.max(1, art.mira.naturalHeight));
  const bob = Math.floor(held / 8) % 2 === 0 ? -2 : 0;
  const fx = w * 0.58 - hw * 0.42;
  const fy = h * 0.8 - hh + bob;
  ctx.save();
  ctx.fillStyle = "rgba(24, 16, 12, 0.35)";
  ctx.filter = "blur(5px)";
  ctx.beginPath();
  ctx.ellipse(fx + hw * 0.48, fy + hh - 4, hw * 0.28, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.filter = "none";
  ctx.restore();
  ctx.drawImage(art.mira, fx, fy, hw, hh);
  paste(ctx, art.ridge, w, h, 1.24 + push * 0.2, -push * w * 0.03, h * 0.015, "bottom");
  const lantern = art.meta.lantern;
  const lx = fx + hw * lantern.x;
  const ly = fy + hh * lantern.y;
  const flicker = 0.85 + 0.15 * Math.sin(held * 0.7);
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  const glow = ctx.createRadialGradient(lx, ly, 2, lx, ly, 78 * flicker);
  glow.addColorStop(0, `rgba(255, 236, 190, ${0.75 * flicker})`);
  glow.addColorStop(0.28, `rgba(255, 190, 100, ${0.38 * flicker})`);
  glow.addColorStop(1, "rgba(255, 160, 60, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(lx, ly, 78 * flicker, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  if (shot.fx.includes("vignette") || shot.fx.length === 0) {
    const g = ctx.createRadialGradient(w / 2, h / 2, w * 0.28, w / 2, h / 2, w * 0.72);
    g.addColorStop(0, "rgba(12, 10, 14, 0)");
    g.addColorStop(1, "rgba(12, 10, 14, 0.38)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }
  if (shot.fx.includes("film_grain")) {
    const tile = grainTile(held);
    ctx.save();
    ctx.globalAlpha = 0.16;
    ctx.globalCompositeOperation = "overlay";
    const pattern = ctx.createPattern(tile, "repeat");
    if (pattern) {
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, w, h);
    }
    ctx.restore();
  }
}

const grainCache = new Map<number, HTMLCanvasElement>();

function grainTile(held: number): HTMLCanvasElement {
  const cached = grainCache.get(held);
  if (cached) return cached;
  const tile = document.createElement("canvas");
  tile.width = 96;
  tile.height = 96;
  const g = tile.getContext("2d");
  if (!g) return tile;
  const data = g.createImageData(96, 96);
  let seed = held * 997;
  for (let i = 0; i < data.data.length; i += 4) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const v = seed & 255;
    data.data[i] = v;
    data.data[i + 1] = v;
    data.data[i + 2] = v;
    data.data[i + 3] = 255;
  }
  g.putImageData(data, 0, 0);
  grainCache.set(held, tile);
  if (grainCache.size > 80) {
    const first = grainCache.keys().next().value;
    if (first !== undefined) grainCache.delete(first);
  }
  return tile;
}

function paintWaiting(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#243456");
  sky.addColorStop(0.55, "#c47a68");
  sky.addColorStop(1, "#f0c59a");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);
}

export function drawFrame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  shot: Shot,
  frame: number,
) {
  ensureCels();
  ctx.clearRect(0, 0, w, h);
  if (!pack) {
    paintWaiting(ctx, w, h);
    return;
  }
  paintCels(ctx, w, h, shot, frame, pack);
}

export type Swatch = { hex: string; weight: number };

/** Cheap palette from a canvas. Measures the picture we drew, not a show. */
export function samplePalette(canvas: HTMLCanvasElement, k = 6): Swatch[] {
  const ctx = canvas.getContext("2d");
  if (!ctx) return [];
  const w = canvas.width;
  const h = canvas.height;
  const data = ctx.getImageData(0, 0, w, h).data;
  const buckets = new Map<string, number>();
  const step = 16;
  let n = 0;
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      const i = (y * w + x) * 4;
      const q = (c: number) => Math.round(c / 24) * 24;
      const r = q(data[i] ?? 0);
      const g = q(data[i + 1] ?? 0);
      const b = q(data[i + 2] ?? 0);
      const hex = `#${[r, g, b].map((c) => Math.min(255, c).toString(16).padStart(2, "0")).join("")}`;
      buckets.set(hex, (buckets.get(hex) ?? 0) + 1);
      n++;
    }
  }
  return [...buckets.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, k)
    .map(([hex, count]) => ({ hex, weight: Math.round((count / Math.max(1, n)) * 1000) / 1000 }));
}
