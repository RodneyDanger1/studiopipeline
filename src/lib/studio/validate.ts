import type { Episode, Shot } from "./model";

const SHOT_ID = /^EP[0-9]{2}_S[0-9]{3}$/;
const EASES = new Set(["linear", "ease_in", "ease_out", "ease_in_out"]);

export function normalizeShot(raw: unknown, index: number): Shot {
  const s = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const cam = (s.camera && typeof s.camera === "object" ? s.camera : {}) as Record<
    string,
    unknown
  >;
  const ease = typeof cam.ease === "string" && EASES.has(cam.ease) ? cam.ease : "ease_in_out";
  const layersIn = Array.isArray(s.layers) ? s.layers : [];
  const dialogueIn = Array.isArray(s.dialogue) ? s.dialogue : [];
  const res = Array.isArray(s.resolution) ? s.resolution : [960, 540];
  return {
    shot_id: typeof s.shot_id === "string" ? s.shot_id : `EP01_S${String(index + 1).padStart(3, "0")}`,
    episode: typeof s.episode === "number" ? s.episode : 1,
    lane: "blender_2p5d",
    fps: s.fps === 12 || s.fps === 24 || s.fps === 25 || s.fps === 30 ? s.fps : 24,
    resolution: [
      Math.round(Number(res[0]) || 960),
      Math.round(Number(res[1]) || 540),
    ],
    duration_frames: Math.round(Number(s.duration_frames) || 48),
    shoot_on: s.shoot_on === 1 || s.shoot_on === 3 ? s.shoot_on : 2,
    camera: {
      move: typeof cam.move === "string" ? cam.move : "dolly_in",
      start_z: Number(cam.start_z ?? 10),
      end_z: Number(cam.end_z ?? 8.5),
      ease: ease as Shot["camera"]["ease"],
    },
    layers: layersIn.map((layer, i) => {
      const l = (layer && typeof layer === "object" ? layer : {}) as Record<string, unknown>;
      return {
        name: typeof l.name === "string" ? l.name : `layer_${i + 1}`,
        image: typeof l.image === "string" ? l.image : "assets/sky.png",
        depth: Number(l.depth ?? 10 + i * 8),
      };
    }),
    fx: Array.isArray(s.fx) ? s.fx.filter((x): x is string => typeof x === "string") : ["film_grain"],
    dialogue: dialogueIn.map((line) => {
      const d = (line && typeof line === "object" ? line : {}) as Record<string, unknown>;
      return {
        character: typeof d.character === "string" ? d.character : "mira",
        text: typeof d.text === "string" ? d.text : "",
        start_frame: Math.round(Number(d.start_frame) || 1),
      };
    }),
    notes: typeof s.notes === "string" ? s.notes : "",
  };
}

export function shotErrors(shot: Shot, targetFps: number): string[] {
  const errs: string[] = [];
  if (!SHOT_ID.test(shot.shot_id)) errs.push(`${shot.shot_id || "(blank)"}: shot id must look like EP01_S001`);
  if (shot.duration_frames < 1 || shot.duration_frames > 2400) {
    errs.push(`${shot.shot_id}: duration out of range`);
  }
  if (shot.duration_frames > targetFps * 10) {
    errs.push(`${shot.shot_id}: longer than 10 seconds`);
  }
  if (shot.layers.length < 1) errs.push(`${shot.shot_id}: needs at least one layer`);
  for (const layer of shot.layers) {
    if (!(layer.depth > 0)) errs.push(`${shot.shot_id}: layer ${layer.name} needs depth > 0`);
    if (!layer.image.trim()) errs.push(`${shot.shot_id}: layer ${layer.name} missing image`);
  }
  if (shot.resolution[0] % 2 !== 0 || shot.resolution[1] % 2 !== 0) {
    errs.push(`${shot.shot_id}: resolution must be even for H.264`);
  }
  const words = shot.dialogue.reduce((n, d) => n + d.text.trim().split(/\s+/).filter(Boolean).length, 0);
  const seconds = shot.duration_frames / shot.fps;
  if (words > Math.ceil(seconds * 3.4) + 2) {
    errs.push(`${shot.shot_id}: dialogue is too long for the shot (about 3 words a second)`);
  }
  return errs;
}

export function episodeErrors(ep: Episode): string[] {
  const errs: string[] = [];
  if (!ep.title.trim()) errs.push("Missing title");
  if (ep.shots.length < 1) errs.push("No shots");
  const ids = ep.shots.map((s) => s.shot_id);
  if (new Set(ids).size !== ids.length) errs.push("Shot ids must be unique");
  ep.shots.forEach((s) => errs.push(...shotErrors(s, ep.fps)));
  const frames = ep.shots.reduce((n, s) => n + s.duration_frames, 0);
  const target = ep.target_seconds * ep.fps;
  if (target > 0 && Math.abs(frames - target) / target > 0.03) {
    errs.push(`Shot frames (${frames}) are more than 3% off the ${ep.target_seconds}s target (${target} frames)`);
  }
  return errs;
}

export function coerceEpisode(
  raw: unknown,
  source: Episode["source"],
  model: string,
  targetSeconds: number,
): Episode {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const shotsIn = Array.isArray(o.shots) ? o.shots : [];
  const beatsIn = Array.isArray(o.beats) ? o.beats : [];
  return {
    title: typeof o.title === "string" ? o.title : "Untitled",
    logline: typeof o.logline === "string" ? o.logline : "",
    source,
    model,
    fps: 24,
    target_seconds: targetSeconds,
    beats: beatsIn.map((b) => {
      const beat = (b && typeof b === "object" ? b : {}) as Record<string, unknown>;
      return {
        title: typeof beat.title === "string" ? beat.title : "Beat",
        seconds: Number(beat.seconds) || 0,
        summary: typeof beat.summary === "string" ? beat.summary : "",
      };
    }),
    shots: shotsIn.map((s, i) => normalizeShot(s, i)),
  };
}
