//#region node_modules/.nitro/vite/services/ssr/assets/validate-Cx6o1oU3.js
/** DeepSeek-V4.1-Flash-1017. Official API id is `deepseek-flash`.
*  Checked 2026-11-11 against https://api-docs.deepseek.com/quick_start/pricing/
*  and https://api-docs.deepseek.com/updates (V4.1-Flash-1017).
*/
var DEEPSEEK = {
	modelId: "deepseek-flash",
	version: "DeepSeek-V4.1-Flash-1017",
	baseUrl: "https://api.deepseek.com",
	context: "1M",
	maxOutput: "384K",
	/** Peak USD per 1M tokens. Off-peak is half. Cache-hit input is $0.006. */
	priceInPerM: .3,
	priceOutPerM: 1.2,
	priceCacheHitPerM: .006,
	docs: "https://api-docs.deepseek.com/"
};
var DEFAULT_BRIEF = `A 30-second original dusk fable. Mira, a lantern keeper on a pine ridge, watches the valley lights go out one by one and walks the switchbacks with the last steady lantern. Warm paper colors, drawn on twos, gentle dolly. No existing films, brands, or real people.`;
var DEFAULT_BIBLE = `SERIES: The Last Lantern. Original world. No borrowed characters, logos, or celebrity likenesses.
MIRA: lantern keeper. Pine cloak, amber lantern, three flat shading bands, ink line. Voice: warm, quick, a little dry. Outfit colors never change.
WORLD: pine ridge above a valley at dusk. Lights in the valley are practical lamps, not signage. No modern brands.
LOOK: shoot on twos, xerox ink on flat cel color, one hard shadow, gouache backgrounds. Preview 1280x720, master later 1920x1080, 24 fps.`;
var STAGES = [
	{
		id: "S0",
		name: "Story",
		detail: "Brief to beats"
	},
	{
		id: "S1",
		name: "Manifest",
		detail: "Shot list, validated"
	},
	{
		id: "S2",
		name: "Assets",
		detail: "Original art"
	},
	{
		id: "S3",
		name: "Style",
		detail: "Palette and line"
	},
	{
		id: "S4",
		name: "Prep",
		detail: "Trace and lock"
	},
	{
		id: "S5",
		name: "Animate",
		detail: "2.5D multiplane"
	},
	{
		id: "S6",
		name: "Ink",
		detail: "Cel pass"
	},
	{
		id: "S7",
		name: "Comp",
		detail: "Camera and grain"
	},
	{
		id: "S8",
		name: "Voice",
		detail: "Dialogue timing"
	},
	{
		id: "S9",
		name: "Edit",
		detail: "Assemble"
	},
	{
		id: "S10",
		name: "Mix",
		detail: "Loudness"
	},
	{
		id: "S11",
		name: "QC",
		detail: "Platform check"
	},
	{
		id: "S12",
		name: "Deliver",
		detail: "Human uploads"
	}
];
function estimateUsd(usage) {
	const hit = usage.prompt_cache_hit_tokens ?? 0;
	const miss = usage.prompt_cache_miss_tokens ?? Math.max(0, (usage.prompt_tokens ?? 0) - hit);
	const out = usage.completion_tokens ?? 0;
	return hit * DEEPSEEK.priceCacheHitPerM / 1e6 + miss * DEEPSEEK.priceInPerM / 1e6 + out * DEEPSEEK.priceOutPerM / 1e6;
}
function maskKey(key) {
	const t = key.trim();
	if (t.length < 8) return t ? "saved" : "";
	return `••••${t.slice(-4)}`;
}
var SHOT_ID = /^EP[0-9]{2}_S[0-9]{3}$/;
var EASES = /* @__PURE__ */ new Set([
	"linear",
	"ease_in",
	"ease_out",
	"ease_in_out"
]);
function normalizeShot(raw, index) {
	const s = raw && typeof raw === "object" ? raw : {};
	const cam = s.camera && typeof s.camera === "object" ? s.camera : {};
	const ease = typeof cam.ease === "string" && EASES.has(cam.ease) ? cam.ease : "ease_in_out";
	const layersIn = Array.isArray(s.layers) ? s.layers : [];
	const dialogueIn = Array.isArray(s.dialogue) ? s.dialogue : [];
	const res = Array.isArray(s.resolution) ? s.resolution : [960, 540];
	return {
		shot_id: typeof s.shot_id === "string" ? s.shot_id : `EP01_S${String(index + 1).padStart(3, "0")}`,
		episode: typeof s.episode === "number" ? s.episode : 1,
		lane: "blender_2p5d",
		fps: s.fps === 12 || s.fps === 24 || s.fps === 25 || s.fps === 30 ? s.fps : 24,
		resolution: [Math.round(Number(res[0]) || 960), Math.round(Number(res[1]) || 540)],
		duration_frames: Math.round(Number(s.duration_frames) || 48),
		shoot_on: s.shoot_on === 1 || s.shoot_on === 3 ? s.shoot_on : 2,
		camera: {
			move: typeof cam.move === "string" ? cam.move : "dolly_in",
			start_z: Number(cam.start_z ?? 10),
			end_z: Number(cam.end_z ?? 8.5),
			ease
		},
		layers: layersIn.map((layer, i) => {
			const l = layer && typeof layer === "object" ? layer : {};
			return {
				name: typeof l.name === "string" ? l.name : `layer_${i + 1}`,
				image: typeof l.image === "string" ? l.image : "assets/sky.png",
				depth: Number(l.depth ?? 10 + i * 8)
			};
		}),
		fx: Array.isArray(s.fx) ? s.fx.filter((x) => typeof x === "string") : ["film_grain"],
		dialogue: dialogueIn.map((line) => {
			const d = line && typeof line === "object" ? line : {};
			return {
				character: typeof d.character === "string" ? d.character : "mira",
				text: typeof d.text === "string" ? d.text : "",
				start_frame: Math.round(Number(d.start_frame) || 1)
			};
		}),
		notes: typeof s.notes === "string" ? s.notes : ""
	};
}
function shotErrors(shot, targetFps) {
	const errs = [];
	if (!SHOT_ID.test(shot.shot_id)) errs.push(`${shot.shot_id || "(blank)"}: shot id must look like EP01_S001`);
	if (shot.duration_frames < 1 || shot.duration_frames > 2400) errs.push(`${shot.shot_id}: duration out of range`);
	if (shot.duration_frames > targetFps * 10) errs.push(`${shot.shot_id}: longer than 10 seconds`);
	if (shot.layers.length < 1) errs.push(`${shot.shot_id}: needs at least one layer`);
	for (const layer of shot.layers) {
		if (!(layer.depth > 0)) errs.push(`${shot.shot_id}: layer ${layer.name} needs depth > 0`);
		if (!layer.image.trim()) errs.push(`${shot.shot_id}: layer ${layer.name} missing image`);
	}
	if (shot.resolution[0] % 2 !== 0 || shot.resolution[1] % 2 !== 0) errs.push(`${shot.shot_id}: resolution must be even for H.264`);
	const words = shot.dialogue.reduce((n, d) => n + d.text.trim().split(/\s+/).filter(Boolean).length, 0);
	const seconds = shot.duration_frames / shot.fps;
	if (words > Math.ceil(seconds * 3.4) + 2) errs.push(`${shot.shot_id}: dialogue is too long for the shot (about 3 words a second)`);
	return errs;
}
function episodeErrors(ep) {
	const errs = [];
	if (!ep.title.trim()) errs.push("Missing title");
	if (ep.shots.length < 1) errs.push("No shots");
	const ids = ep.shots.map((s) => s.shot_id);
	if (new Set(ids).size !== ids.length) errs.push("Shot ids must be unique");
	ep.shots.forEach((s) => errs.push(...shotErrors(s, ep.fps)));
	const frames = ep.shots.reduce((n, s) => n + s.duration_frames, 0);
	const target = ep.target_seconds * ep.fps;
	if (target > 0 && Math.abs(frames - target) / target > .03) errs.push(`Shot frames (${frames}) are more than 3% off the ${ep.target_seconds}s target (${target} frames)`);
	return errs;
}
function coerceEpisode(raw, source, model, targetSeconds) {
	const o = raw && typeof raw === "object" ? raw : {};
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
			const beat = b && typeof b === "object" ? b : {};
			return {
				title: typeof beat.title === "string" ? beat.title : "Beat",
				seconds: Number(beat.seconds) || 0,
				summary: typeof beat.summary === "string" ? beat.summary : ""
			};
		}),
		shots: shotsIn.map((s, i) => normalizeShot(s, i))
	};
}
//#endregion
export { coerceEpisode as a, maskKey as c, STAGES as i, DEFAULT_BIBLE as n, episodeErrors as o, DEFAULT_BRIEF as r, estimateUsd as s, DEEPSEEK as t };
