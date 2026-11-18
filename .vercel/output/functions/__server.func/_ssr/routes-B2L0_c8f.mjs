import { i as __toESM } from "../_runtime.mjs";
import { b as require_jsx_runtime, q as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { c as maskKey, i as STAGES, n as DEFAULT_BIBLE, o as episodeErrors, r as DEFAULT_BRIEF, t as DEEPSEEK } from "./validate-Cx6o1oU3.mjs";
import { a as Pause, c as Clapperboard, i as Play, n as Trash2, o as LoaderCircle, r as ShieldCheck, s as KeyRound } from "../_libs/lucide-react.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-B2L0_c8f.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var KEY_MIN = 20;
function cleanKey(raw) {
	const apiKey = raw.trim();
	if (apiKey.length < KEY_MIN || /[\s]/.test(apiKey)) throw new Error("That does not look like a DeepSeek API key.");
	return apiKey;
}
var pingDeepseek = createServerFn({ method: "POST" }).validator((input) => ({ apiKey: cleanKey(input.apiKey) })).handler(createSsrRpc("13d399f65b85ed258b3b293a54000938f456e1daa6a04b693720d4bf098343a7"));
var writeEpisode = createServerFn({ method: "POST" }).validator((input) => {
	const apiKey = cleanKey(input.apiKey);
	const brief = input.brief.trim().slice(0, 4e3);
	const bible = input.bible.trim().slice(0, 4e3);
	const targetSeconds = Math.min(90, Math.max(5, Math.round(input.targetSeconds || 30)));
	if (!brief) throw new Error("Write a brief first.");
	if (input.budgetUsd > 0 && input.spentUsd >= input.budgetUsd) throw new Error("Episode budget is used up. Raise it in the key vault or clear the ledger.");
	return {
		apiKey,
		brief,
		bible,
		targetSeconds,
		spentUsd: input.spentUsd,
		budgetUsd: input.budgetUsd
	};
}).handler(createSsrRpc("f372d2b556443cac2e7fb82f6cea1badedd920acfee5b81c377ecde6e2ae3cb3"));
var studioDoctor = createServerFn({ method: "GET" }).handler(createSsrRpc("c453625c7867044ba4e5f1a819c67fcc752b4626abf4090e6e551227e250338d"));
/** Original house draft so the desk is watchable before a key is saved.
*  Not a model response. Replaced the moment DeepSeek writes an episode.
*  Frame sum is 192 at 24 fps = 8.00s, inside the 3% check.
*/
function houseDraft() {
	return {
		title: "The Last Lantern",
		logline: "Lantern keeper Mira carries the last steady light down a pine ridge as the valley goes dark.",
		source: "house-draft",
		model: DEEPSEEK.version,
		fps: 24,
		target_seconds: 8,
		beats: [
			{
				title: "Ridge",
				seconds: 4,
				summary: "The valley lights fail, one by one."
			},
			{
				title: "Decision",
				seconds: 2,
				summary: "Mira names what she sees."
			},
			{
				title: "Walk",
				seconds: 2,
				summary: "She starts down with the lantern."
			}
		],
		shots: [
			{
				shot_id: "EP01_S001",
				episode: 1,
				lane: "blender_2p5d",
				fps: 24,
				resolution: [1280, 720],
				duration_frames: 96,
				shoot_on: 2,
				camera: {
					move: "dolly_in",
					start_z: 10.5,
					end_z: 8.2,
					ease: "ease_in_out"
				},
				layers: [
					{
						name: "sky",
						image: "assets/sky.png",
						depth: 40
					},
					{
						name: "hills",
						image: "assets/hills.png",
						depth: 25
					},
					{
						name: "hero",
						image: "assets/hero.png",
						depth: 12
					},
					{
						name: "lantern",
						image: "assets/lantern.png",
						depth: 11
					}
				],
				fx: ["film_grain", "vignette"],
				dialogue: [],
				notes: "Establishing. Painted plates, xerox cel, lights dying on twos."
			},
			{
				shot_id: "EP01_S002",
				episode: 1,
				lane: "blender_2p5d",
				fps: 24,
				resolution: [1280, 720],
				duration_frames: 48,
				shoot_on: 2,
				camera: {
					move: "hold",
					start_z: 8.2,
					end_z: 7.6,
					ease: "ease_out"
				},
				layers: [
					{
						name: "sky",
						image: "assets/sky.png",
						depth: 36
					},
					{
						name: "hills",
						image: "assets/hills.png",
						depth: 22
					},
					{
						name: "hero",
						image: "assets/hero.png",
						depth: 9
					},
					{
						name: "lantern",
						image: "assets/lantern.png",
						depth: 8
					}
				],
				fx: ["film_grain", "vignette"],
				dialogue: [{
					character: "Mira",
					text: "The valley is going dark.",
					start_frame: 8
				}],
				notes: "Closer. Dialogue fits the hold."
			},
			{
				shot_id: "EP01_S003",
				episode: 1,
				lane: "blender_2p5d",
				fps: 24,
				resolution: [1280, 720],
				duration_frames: 48,
				shoot_on: 2,
				camera: {
					move: "dolly_in",
					start_z: 7.6,
					end_z: 6.4,
					ease: "ease_in"
				},
				layers: [
					{
						name: "sky",
						image: "assets/sky.png",
						depth: 30
					},
					{
						name: "hills",
						image: "assets/hills.png",
						depth: 18
					},
					{
						name: "hero",
						image: "assets/hero.png",
						depth: 7
					},
					{
						name: "lantern",
						image: "assets/lantern.png",
						depth: 6
					}
				],
				fx: ["vignette"],
				dialogue: [{
					character: "Mira",
					text: "Then we walk.",
					start_frame: 6
				}],
				notes: "Button. She steps toward the valley."
			}
		]
	};
}
var draft = houseDraft();
var useDesk = create()(persist((set, get) => ({
	hydrated: false,
	tab: "brief",
	apiKey: "",
	budgetUsd: 2,
	brief: DEFAULT_BRIEF,
	bible: DEFAULT_BIBLE,
	targetSeconds: 30,
	episode: draft,
	selectedShotId: draft.shots[0]?.shot_id ?? "",
	ledger: [],
	styleNote: "",
	palette: [],
	keyStatus: "",
	setHydrated: (hydrated) => set({ hydrated }),
	setTab: (tab) => set({ tab }),
	setApiKey: (apiKey) => set({ apiKey }),
	forgetKey: () => set({
		apiKey: "",
		keyStatus: "Key removed from this device."
	}),
	setBudgetUsd: (budgetUsd) => set({ budgetUsd }),
	setBrief: (brief) => set({ brief }),
	setBible: (bible) => set({ bible }),
	setTargetSeconds: (targetSeconds) => set({ targetSeconds }),
	setEpisode: (episode) => set({
		episode,
		selectedShotId: episode.shots[0]?.shot_id ?? ""
	}),
	selectShot: (selectedShotId) => set({
		selectedShotId,
		tab: "preview"
	}),
	addLedger: (row) => set({ ledger: [...get().ledger, row].slice(-40) }),
	setStyle: (palette, styleNote) => set({
		palette,
		styleNote
	}),
	setKeyStatus: (keyStatus) => set({ keyStatus }),
	spent: () => get().ledger.reduce((n, row) => n + row.usd, 0),
	shot: () => get().episode.shots.find((s) => s.shot_id === get().selectedShotId)
}), {
	name: "studio-pipeline-desk-v1",
	version: 2,
	migrate: (persisted, version) => {
		if (version < 2 && (persisted ?? {}).episode?.source !== "deepseek") {
			const next = houseDraft();
			return {
				...persisted,
				episode: next,
				selectedShotId: next.shots[0]?.shot_id ?? "",
				palette: [],
				styleNote: ""
			};
		}
		return persisted;
	},
	partialize: (s) => ({
		apiKey: s.apiKey,
		budgetUsd: s.budgetUsd,
		brief: s.brief,
		bible: s.bible,
		targetSeconds: s.targetSeconds,
		episode: s.episode,
		selectedShotId: s.selectedShotId,
		ledger: s.ledger,
		styleNote: s.styleNote,
		palette: s.palette
	}),
	onRehydrateStorage: () => (state) => {
		state?.setHydrated(true);
	}
}));
function ease(t, kind) {
	const x = Math.min(1, Math.max(0, t));
	if (kind === "ease_in_out") return x * x * (3 - 2 * x);
	if (kind === "ease_in") return x * x;
	if (kind === "ease_out") return 1 - (1 - x) ** 2;
	return x;
}
/** 1-based frame index, held on twos or threes. */
function heldFrame(frame, shootOn) {
	const on = Math.max(1, Math.round(shootOn) || 1);
	return Math.floor((frame - 1) / on) * on + 1;
}
function cameraZ(frame, duration, shootOn, startZ, endZ, kind) {
	const t = (heldFrame(frame, shootOn) - 1) / Math.max(1, duration - 1);
	return startZ + (endZ - startZ) * ease(t, kind);
}
/** Layout gain and placement match pipeline/src/studio/tools/pillow_plane.py. */
var GAIN = 2.2;
var pack = null;
var failed = false;
var listeners = /* @__PURE__ */ new Set();
function loadImage(src) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = () => reject(/* @__PURE__ */ new Error(`Could not load ${src}`));
		img.src = src;
	});
}
function celsReady() {
	return pack !== null;
}
function subscribeCels(fn) {
	listeners.add(fn);
	return () => listeners.delete(fn);
}
function ensureCels() {
	if (pack || failed || typeof window === "undefined") return;
	const base = "/media/cels";
	Promise.all([
		loadImage(`${base}/sky.jpg`),
		loadImage(`${base}/valley.png`),
		loadImage(`${base}/pines.png`),
		loadImage(`${base}/ridge.png`),
		loadImage(`${base}/mira.png`),
		fetch(`${base}/meta.json`).then((res) => {
			if (!res.ok) throw new Error("cel meta missing");
			return res.json();
		})
	]).then(([sky, valley, pines, ridge, mira, meta]) => {
		pack = {
			sky,
			valley,
			pines,
			ridge,
			mira,
			meta: {
				lantern: meta.lantern ?? {
					x: .16,
					y: .58
				},
				lights: Array.isArray(meta.lights) ? meta.lights : []
			}
		};
		failed = false;
		listeners.forEach((fn) => fn());
	}).catch(() => {
		failed = true;
		listeners.forEach((fn) => fn());
	});
}
function pushAmount(shot, frame) {
	const z = cameraZ(frame, shot.duration_frames, shot.shoot_on, shot.camera.start_z, shot.camera.end_z, shot.camera.ease);
	return (shot.camera.start_z - z) / Math.max(.5, Math.abs(shot.camera.start_z)) * GAIN;
}
function heroFrac(shot) {
	const depth = shot.layers.find((layer) => /hero|mira|character/i.test(layer.name))?.depth ?? 12;
	return Math.max(.42, Math.min(.82, .5 + (12 - depth) * .045));
}
function paste(ctx, img, w, h, scale, ox, oy, anchor) {
	const dw = w * scale;
	const dh = h * scale;
	const x = (w - dw) / 2 + ox;
	const y = anchor === "bottom" ? h - dh + oy : (h - dh) / 2 + oy;
	ctx.drawImage(img, x, y, dw, dh);
	return {
		x,
		y,
		dw,
		dh
	};
}
function paintCels(ctx, w, h, shot, frame, art) {
	const push = pushAmount(shot, frame);
	const held = heldFrame(frame, shot.shoot_on);
	ctx.imageSmoothingEnabled = true;
	ctx.imageSmoothingQuality = "high";
	paste(ctx, art.sky, w, h, 1.16 + push * .08, -push * w * .02, -h * .02, "center");
	const valley = paste(ctx, art.valley, w, h, 1.32 + push * .18, -push * w * .05, h * .06, "center");
	if (art.meta.lights.length) {
		ctx.save();
		ctx.globalCompositeOperation = "multiply";
		for (const light of art.meta.lights) {
			if (held < light.die) continue;
			const sx = valley.x + light.x * valley.dw;
			const sy = valley.y + light.y * valley.dh;
			const rad = Math.max(3, valley.dw * .008);
			ctx.fillStyle = "rgba(18, 14, 24, 0.82)";
			ctx.beginPath();
			ctx.arc(sx, sy, rad, 0, Math.PI * 2);
			ctx.fill();
		}
		ctx.restore();
	}
	paste(ctx, art.pines, w, h, 1.5 + push * .28, -push * w * .08, h * .1, "center");
	const hh = h * (heroFrac(shot) + push * .08);
	const hw = hh * (art.mira.naturalWidth / Math.max(1, art.mira.naturalHeight));
	const bob = Math.floor(held / 8) % 2 === 0 ? -2 : 0;
	const fx = w * .58 - hw * .42;
	const fy = h * .8 - hh + bob;
	ctx.save();
	ctx.fillStyle = "rgba(24, 16, 12, 0.35)";
	ctx.filter = "blur(5px)";
	ctx.beginPath();
	ctx.ellipse(fx + hw * .48, fy + hh - 4, hw * .28, 10, 0, 0, Math.PI * 2);
	ctx.fill();
	ctx.filter = "none";
	ctx.restore();
	ctx.drawImage(art.mira, fx, fy, hw, hh);
	paste(ctx, art.ridge, w, h, 1.24 + push * .2, -push * w * .03, h * .015, "bottom");
	const lantern = art.meta.lantern;
	const lx = fx + hw * lantern.x;
	const ly = fy + hh * lantern.y;
	const flicker = .85 + .15 * Math.sin(held * .7);
	ctx.save();
	ctx.globalCompositeOperation = "screen";
	const glow = ctx.createRadialGradient(lx, ly, 2, lx, ly, 78 * flicker);
	glow.addColorStop(0, `rgba(255, 236, 190, ${.75 * flicker})`);
	glow.addColorStop(.28, `rgba(255, 190, 100, ${.38 * flicker})`);
	glow.addColorStop(1, "rgba(255, 160, 60, 0)");
	ctx.fillStyle = glow;
	ctx.beginPath();
	ctx.arc(lx, ly, 78 * flicker, 0, Math.PI * 2);
	ctx.fill();
	ctx.restore();
	if (shot.fx.includes("vignette") || shot.fx.length === 0) {
		const g = ctx.createRadialGradient(w / 2, h / 2, w * .28, w / 2, h / 2, w * .72);
		g.addColorStop(0, "rgba(12, 10, 14, 0)");
		g.addColorStop(1, "rgba(12, 10, 14, 0.38)");
		ctx.fillStyle = g;
		ctx.fillRect(0, 0, w, h);
	}
	if (shot.fx.includes("film_grain")) {
		const tile = grainTile(held);
		ctx.save();
		ctx.globalAlpha = .16;
		ctx.globalCompositeOperation = "overlay";
		const pattern = ctx.createPattern(tile, "repeat");
		if (pattern) {
			ctx.fillStyle = pattern;
			ctx.fillRect(0, 0, w, h);
		}
		ctx.restore();
	}
}
var grainCache = /* @__PURE__ */ new Map();
function grainTile(held) {
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
		seed = seed * 1664525 + 1013904223 >>> 0;
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
		if (first !== void 0) grainCache.delete(first);
	}
	return tile;
}
function paintWaiting(ctx, w, h) {
	const sky = ctx.createLinearGradient(0, 0, 0, h);
	sky.addColorStop(0, "#243456");
	sky.addColorStop(.55, "#c47a68");
	sky.addColorStop(1, "#f0c59a");
	ctx.fillStyle = sky;
	ctx.fillRect(0, 0, w, h);
}
function drawFrame(ctx, w, h, shot, frame) {
	ensureCels();
	ctx.clearRect(0, 0, w, h);
	if (!pack) {
		paintWaiting(ctx, w, h);
		return;
	}
	paintCels(ctx, w, h, shot, frame, pack);
}
/** Cheap palette from a canvas. Measures the picture we drew, not a show. */
function samplePalette(canvas, k = 6) {
	const ctx = canvas.getContext("2d");
	if (!ctx) return [];
	const w = canvas.width;
	const h = canvas.height;
	const data = ctx.getImageData(0, 0, w, h).data;
	const buckets = /* @__PURE__ */ new Map();
	const step = 16;
	let n = 0;
	for (let y = 0; y < h; y += step) for (let x = 0; x < w; x += step) {
		const i = (y * w + x) * 4;
		const q = (c) => Math.round(c / 24) * 24;
		const hex = `#${[
			q(data[i] ?? 0),
			q(data[i + 1] ?? 0),
			q(data[i + 2] ?? 0)
		].map((c) => Math.min(255, c).toString(16).padStart(2, "0")).join("")}`;
		buckets.set(hex, (buckets.get(hex) ?? 0) + 1);
		n++;
	}
	return [...buckets.entries()].sort((a, b) => b[1] - a[1]).slice(0, k).map(([hex, count]) => ({
		hex,
		weight: Math.round(count / Math.max(1, n) * 1e3) / 1e3
	}));
}
function PreviewStage({ shot }) {
	const canvasRef = (0, import_react.useRef)(null);
	const [playing, setPlaying] = (0, import_react.useState)(false);
	const [frame, setFrame] = (0, import_react.useState)(1);
	const [artReady, setArtReady] = (0, import_react.useState)(celsReady());
	const setStyle = useDesk((s) => s.setStyle);
	(0, import_react.useEffect)(() => subscribeCels(() => setArtReady(celsReady())), []);
	(0, import_react.useEffect)(() => {
		setFrame(1);
		setPlaying(false);
	}, [shot?.shot_id]);
	(0, import_react.useEffect)(() => {
		const canvas = canvasRef.current;
		if (!canvas || !shot) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		const w = shot.resolution[0];
		const h = shot.resolution[1];
		const dpr = Math.min(2, window.devicePixelRatio || 1);
		const bw = Math.round(w * dpr);
		const bh = Math.round(h * dpr);
		if (canvas.width !== bw) canvas.width = bw;
		if (canvas.height !== bh) canvas.height = bh;
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		drawFrame(ctx, w, h, shot, frame);
	}, [
		shot,
		frame,
		artReady
	]);
	(0, import_react.useEffect)(() => {
		if (!playing || !shot) return;
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
		let raf = 0;
		let last = performance.now();
		const step = (now) => {
			const ms = 1e3 / shot.fps;
			if (now - last >= ms) {
				last = now;
				setFrame((f) => f >= shot.duration_frames ? 1 : f + 1);
			}
			raf = requestAnimationFrame(step);
		};
		raf = requestAnimationFrame(step);
		return () => cancelAnimationFrame(raf);
	}, [playing, shot]);
	if (!shot) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "desk-card p-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "font-display text-2xl",
			children: "No shot selected"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-muted",
			children: "Pick a shot from the board."
		})]
	});
	const seconds = (shot.duration_frames / shot.fps).toFixed(2);
	const line = shot.dialogue.find((d) => d.text && frame >= d.start_frame);
	function measure() {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const palette = samplePalette(canvas, 6);
		useDesk.getState().setStyle(palette, "Measured from the painted preview frame. Rights: original artwork made for this project. Not sampled from a copyrighted film.");
		setStyle(palette, useDesk.getState().styleNote);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "desk-card overflow-hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-end justify-between gap-3 border-b border-line px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-semibold tracking-widest text-muted uppercase",
					children: "Multiplane preview"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl leading-tight",
					children: shot.shot_id
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted",
					children: [
						shot.resolution[0],
						"×",
						shot.resolution[1],
						" · ",
						shot.fps,
						" fps · ",
						seconds,
						"s · on ",
						shot.shoot_on,
						"s"
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "bg-ink p-3 sm:p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
					ref: canvasRef,
					className: "aspect-video w-full rounded-md bg-ink",
					role: "img",
					"aria-label": `${shot.shot_id} multiplane frame ${frame}`
				}), line ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 text-center text-sm text-paper",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-amber",
						children: [line.character, ". "]
					}), line.text]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-center text-sm text-paper/70",
					children: "Hold. No line on this frame."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-3 px-4 py-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "inline-flex h-11 items-center gap-2 rounded-full bg-ink px-4 text-sm font-semibold text-paper",
						onClick: () => setPlaying((v) => !v),
						children: [playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }), playing ? "Pause" : "Play shot"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex min-w-40 flex-1 items-center gap-3 text-sm text-muted",
						children: [
							"Frame ",
							String(frame).padStart(4, "0"),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: "h-11 w-full accent-amber",
								type: "range",
								min: 1,
								max: shot.duration_frames,
								value: frame,
								onChange: (e) => {
									setPlaying(false);
									setFrame(Number(e.target.value));
								}
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "h-11 rounded-full border border-line bg-card px-4 text-sm font-semibold",
						onClick: measure,
						children: "Measure look"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "px-4 pb-4 text-sm text-muted",
				children: ["Gouache plates and a xerox cel, held on twos. The valley lights go out, the lantern flickers, and nearer layers travel farther than the sky. ", artReady ? "Painted cels are loaded." : "Loading the painted cels."]
			})
		]
	});
}
var TABS = [
	{
		id: "brief",
		label: "Brief"
	},
	{
		id: "board",
		label: "Board"
	},
	{
		id: "preview",
		label: "Preview"
	},
	{
		id: "style",
		label: "Style"
	},
	{
		id: "vault",
		label: "Key"
	},
	{
		id: "setup",
		label: "Setup"
	}
];
function StudioDesk() {
	const hydrated = useDesk((s) => s.hydrated);
	const setHydrated = useDesk((s) => s.setHydrated);
	(0, import_react.useEffect)(() => {
		const done = () => setHydrated(true);
		if (useDesk.persist.hasHydrated()) done();
		return useDesk.persist.onFinishHydration(done);
	}, [setHydrated]);
	if (!hydrated) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "mx-auto max-w-6xl px-4 py-10",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted",
			children: "Opening the desk…"
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "min-h-screen",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Header, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto grid max-w-6xl gap-4 px-4 py-4 lg:grid-cols-[13.5rem_1fr] lg:px-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StageRail, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 flex-col gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabBar, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {})]
			})]
		})]
	});
}
function Header() {
	const apiKey = useDesk((s) => s.apiKey);
	const spent = useDesk((s) => s.ledger.reduce((n, row) => n + row.usd, 0));
	const budget = useDesk((s) => s.budgetUsd);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
		className: "border-b border-ink bg-ink text-paper",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 lg:px-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "flex size-11 items-center justify-center rounded-md bg-amber text-amber-ink",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clapperboard, {
						className: "size-5",
						"aria-hidden": true
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-xl leading-none",
					children: "Studio Pipeline"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-paper/70",
					children: "Original episodes, from a brief to a picture."
				})] })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "rounded-full bg-amber px-3 py-1 font-semibold text-amber-ink",
						children: DEEPSEEK.version
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "rounded-full border border-paper/25 px-3 py-1",
						children: apiKey ? `Key ${maskKey(apiKey)}` : "No key saved"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "rounded-full border border-paper/25 px-3 py-1",
						children: [
							"$",
							spent.toFixed(3),
							" / $",
							budget.toFixed(2)
						]
					})
				]
			})]
		})
	});
}
function StageRail() {
	const episode = useDesk((s) => s.episode);
	const palette = useDesk((s) => s.palette);
	const played = episode.shots.length > 0;
	const flags = {
		S0: episode.source === "deepseek" ? "Written" : "House draft",
		S1: episodeErrors(episode).length === 0 ? "Valid" : "Check",
		S2: "Painted cels",
		S3: palette.length ? "Measured" : "Waiting",
		S4: "Palette locked in preview",
		S5: played ? "Preview lane" : "Waiting",
		S6: "Ink in the draw pass",
		S7: "Grain and vignette",
		S8: episode.shots.some((s) => s.dialogue.length) ? "Lines timed" : "Silent",
		S9: "Shot order",
		S10: "No mix yet",
		S11: episodeErrors(episode).length === 0 ? "Manifest ok" : "Needs attention",
		S12: "You upload"
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
		className: "desk-card flex gap-2 overflow-x-auto p-2 lg:flex-col lg:overflow-visible",
		"aria-label": "Pipeline stages",
		children: STAGES.map((stage) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-36 shrink-0 px-2 py-2 lg:min-w-0",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-semibold tracking-wide text-amber",
					children: stage.id
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-semibold",
					children: stage.name
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted",
					children: flags[stage.id]
				})
			]
		}, stage.id))
	});
}
function TabBar() {
	const tab = useDesk((s) => s.tab);
	const setTab = useDesk((s) => s.setTab);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex gap-2 overflow-x-auto",
		role: "tablist",
		children: TABS.map((item) => {
			const on = tab === item.id;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				role: "tab",
				"aria-selected": on,
				className: "h-11 shrink-0 rounded-full px-4 text-sm font-semibold " + (on ? "bg-ink text-paper" : "border border-line bg-card text-ink"),
				onClick: () => setTab(item.id),
				children: item.label
			}, item.id);
		})
	});
}
function Panel() {
	const tab = useDesk((s) => s.tab);
	if (tab === "brief") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BriefPanel, {});
	if (tab === "board") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BoardPanel, {});
	if (tab === "preview") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewPanel, {});
	if (tab === "style") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StylePanel, {});
	if (tab === "vault") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VaultPanel, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SetupPanel, {});
}
function BriefPanel() {
	const brief = useDesk((s) => s.brief);
	const bible = useDesk((s) => s.bible);
	const targetSeconds = useDesk((s) => s.targetSeconds);
	const setBrief = useDesk((s) => s.setBrief);
	const setBible = useDesk((s) => s.setBible);
	const setTargetSeconds = useDesk((s) => s.setTargetSeconds);
	const setEpisode = useDesk((s) => s.setEpisode);
	const setTab = useDesk((s) => s.setTab);
	const apiKey = useDesk((s) => s.apiKey);
	const budgetUsd = useDesk((s) => s.budgetUsd);
	const ledger = useDesk((s) => s.ledger);
	const addLedger = useDesk((s) => s.addLedger);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)("");
	const [note, setNote] = (0, import_react.useState)("");
	async function write() {
		setError("");
		setNote("");
		if (!apiKey.trim()) {
			useDesk.getState().setKeyStatus("Save a DeepSeek key first. The model is already DeepSeek-V4.1-Flash-1017 (deepseek-flash). The date 1017 is the model version, not the key.");
			setTab("vault");
			return;
		}
		setBusy(true);
		try {
			const spent = ledger.reduce((n, row) => n + row.usd, 0);
			const result = await writeEpisode({ data: {
				apiKey,
				brief,
				bible,
				targetSeconds,
				spentUsd: spent,
				budgetUsd
			} });
			if (result.usd) addLedger({
				ts: Date.now(),
				label: result.ok ? "Episode" : "Episode attempt",
				model: result.model,
				promptTokens: result.usage?.prompt_tokens ?? 0,
				completionTokens: result.usage?.completion_tokens ?? 0,
				usd: result.usd
			});
			if (!result.ok) {
				setError(result.error);
				return;
			}
			setEpisode(result.episode);
			setNote(`Wrote “${result.episode.title}” with ${result.model} in ${result.attempts} pass${result.attempts === 1 ? "" : "es"}.`);
			setTab("board");
		} catch (err) {
			setError(err instanceof Error ? err.message : "The write failed.");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "desk-card p-4 sm:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-semibold tracking-widest text-muted uppercase",
				children: "S0 · Story"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-1 font-display text-3xl leading-tight",
				children: "What are we making?"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 max-w-2xl text-sm text-muted",
				children: "DeepSeek V4.1 Flash 1017 writes the beats and the shot manifest. Thinking is off for this step so the reply stays JSON, fast, and inside the budget. Peak price used for the meter is $0.30 in / $1.20 out per million tokens."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
				className: "mt-5 block text-sm font-semibold",
				htmlFor: "brief",
				children: "Brief"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
				id: "brief",
				value: brief,
				onChange: (e) => setBrief(e.target.value),
				rows: 5,
				className: "mt-2 w-full resize-y rounded-md border border-line bg-paper px-3 py-3 text-base"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
				className: "mt-4 block text-sm font-semibold",
				htmlFor: "bible",
				children: "Style and character bible"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
				id: "bible",
				value: bible,
				onChange: (e) => setBible(e.target.value),
				rows: 5,
				className: "mt-2 w-full resize-y rounded-md border border-line bg-paper px-3 py-3 text-base"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "mt-4 flex items-center justify-between text-sm font-semibold",
				htmlFor: "seconds",
				children: ["Target length", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "font-normal text-muted",
					children: [targetSeconds, " seconds"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				id: "seconds",
				type: "range",
				min: 5,
				max: 90,
				value: targetSeconds,
				onChange: (e) => setTargetSeconds(Number(e.target.value)),
				className: "mt-2 h-11 w-full accent-amber"
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 rounded-md bg-amber-soft px-3 py-2 text-sm text-amber-ink",
				children: error
			}) : null,
			note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-sm",
				children: note
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 flex flex-wrap gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					disabled: busy,
					onClick: write,
					className: "inline-flex h-11 items-center gap-2 rounded-full bg-amber px-5 text-sm font-semibold text-amber-ink disabled:opacity-60",
					children: [busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : null, busy ? "Writing…" : "Write with DeepSeek"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "h-11 rounded-full border border-line bg-card px-5 text-sm font-semibold",
					onClick: () => {
						setEpisode(houseDraft());
						setNote("Loaded the house draft. Original painted cels, not a model write.");
						setTab("preview");
					},
					children: "Load house draft"
				})]
			})
		]
	});
}
function BoardPanel() {
	const episode = useDesk((s) => s.episode);
	const selectShot = useDesk((s) => s.selectShot);
	const errors = episodeErrors(episode);
	const frames = episode.shots.reduce((n, s) => n + s.duration_frames, 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "flex flex-col gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "desk-card p-4 sm:p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-semibold tracking-widest text-muted uppercase",
					children: episode.source === "deepseek" ? `From ${episode.model}` : "House draft · not from the model"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-1 font-display text-3xl leading-tight",
					children: episode.title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 max-w-2xl text-sm",
					children: episode.logline
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 text-sm text-muted",
					children: [
						episode.shots.length,
						" shots · ",
						frames,
						" frames · ",
						(frames / episode.fps).toFixed(1),
						"s at ",
						episode.fps,
						" fps"
					]
				}),
				errors.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 list-disc pl-5 text-sm text-amber-ink",
					children: errors.slice(0, 6).map((err) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: err }, err))
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 inline-flex items-center gap-2 text-sm font-semibold",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-4" }), " Manifest passes the schema checks."]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
			className: "grid gap-3",
			children: episode.shots.map((shot) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => selectShot(shot.shot_id),
				className: "desk-card flex w-full flex-col gap-2 p-4 text-left sm:flex-row sm:items-center sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-display text-xl",
					children: shot.shot_id
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mt-1 block text-sm text-muted",
					children: shot.notes || shot.camera.move
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-sm text-muted",
					children: [
						shot.duration_frames,
						"f · ",
						shot.layers.length,
						" layers · ",
						shot.camera.move
					]
				})]
			}) }, shot.shot_id))
		})]
	});
}
function PreviewPanel() {
	const shot = useDesk((s) => s.shot());
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewStage, { shot }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
				className: "desk-card w-full",
				controls: true,
				preload: "metadata",
				src: "/media/smoke.mp4",
				poster: "",
				children: "A packed 5-second sample plays here once the fallback encoder has written it."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "The player under the canvas is the same painted lane, packed with FFmpeg, so you can scrub it without the live clock."
			})
		]
	});
}
function StylePanel() {
	const palette = useDesk((s) => s.palette);
	const note = useDesk((s) => s.styleNote);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "desk-card p-4 sm:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-semibold tracking-widest text-muted uppercase",
				children: "S3 · Style spec"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-1 font-display text-3xl",
				children: "Measure the look"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 max-w-2xl text-sm text-muted",
				children: "Play a shot, then Measure look. The swatches come from that frame only. Nothing here is sampled from a copyrighted picture."
			}),
			palette.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-6 text-sm",
				children: "No measurement yet."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3",
				children: palette.map((swatch) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "overflow-hidden rounded-md border border-line",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-16",
						style: { background: swatch.hex }
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "bg-card px-2 py-2 text-xs font-semibold",
						children: [
							swatch.hex,
							" · ",
							Math.round(swatch.weight * 100),
							"%"
						]
					})]
				}, swatch.hex))
			}),
			note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-sm text-muted",
				children: note
			}) : null
		]
	});
}
function VaultPanel() {
	const apiKey = useDesk((s) => s.apiKey);
	const setApiKey = useDesk((s) => s.setApiKey);
	const forgetKey = useDesk((s) => s.forgetKey);
	const budgetUsd = useDesk((s) => s.budgetUsd);
	const setBudgetUsd = useDesk((s) => s.setBudgetUsd);
	const ledger = useDesk((s) => s.ledger);
	const keyStatus = useDesk((s) => s.keyStatus);
	const setKeyStatus = useDesk((s) => s.setKeyStatus);
	const addLedger = useDesk((s) => s.addLedger);
	const [draft, setDraft] = (0, import_react.useState)(apiKey);
	const [busy, setBusy] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => setDraft(apiKey), [apiKey]);
	async function saveAndPing() {
		const next = draft.trim();
		setApiKey(next);
		setBusy(true);
		setKeyStatus("");
		try {
			const result = await pingDeepseek({ data: { apiKey: next } });
			if (!result.ok) {
				setKeyStatus(result.error);
				return;
			}
			const row = {
				ts: Date.now(),
				label: "Key check",
				model: result.model,
				promptTokens: result.usage?.prompt_tokens ?? 0,
				completionTokens: result.usage?.completion_tokens ?? 0,
				usd: result.usd
			};
			addLedger(row);
			setKeyStatus(`Saved on this device. ${result.model} answered. Check cost $${result.usd.toFixed(4)}.`);
		} catch (err) {
			setKeyStatus(err instanceof Error ? err.message : "Check failed.");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "desk-card p-4 sm:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, {
					className: "size-5",
					"aria-hidden": true
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-semibold tracking-widest text-muted uppercase",
					children: "Persistent key"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-1 font-display text-3xl leading-tight",
				children: "DeepSeek key vault"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 max-w-2xl text-sm text-muted",
				children: [
					"The studio is wired to ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-semibold text-ink",
						children: DEEPSEEK.modelId
					}),
					", which DeepSeek serves as ",
					DEEPSEEK.version,
					". The key is not the model name. Paste the key from your DeepSeek console. It stays in this browser, is sent only to call DeepSeek, and is never written into the episode files."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
				className: "mt-5 block text-sm font-semibold",
				htmlFor: "key",
				children: "API key"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				id: "key",
				type: "password",
				autoComplete: "off",
				value: draft,
				onChange: (e) => setDraft(e.target.value),
				placeholder: "sk-…",
				className: "mt-2 h-11 w-full rounded-md border border-line bg-paper px-3"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
				className: "mt-4 block text-sm font-semibold",
				htmlFor: "budget",
				children: "Episode budget (USD, peak rates)"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				id: "budget",
				type: "number",
				min: 0,
				step: .5,
				value: budgetUsd,
				onChange: (e) => setBudgetUsd(Number(e.target.value)),
				className: "mt-2 h-11 w-32 rounded-md border border-line bg-paper px-3"
			}),
			keyStatus ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-sm",
				children: keyStatus
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 flex flex-wrap gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					disabled: busy,
					onClick: saveAndPing,
					className: "inline-flex h-11 items-center gap-2 rounded-full bg-amber px-5 text-sm font-semibold text-amber-ink disabled:opacity-60",
					children: [busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : null, "Save and check key"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: forgetKey,
					className: "inline-flex h-11 items-center gap-2 rounded-full border border-line px-4 text-sm font-semibold",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" }), "Forget key"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mt-8 font-display text-xl",
				children: "Cost ledger"
			}),
			ledger.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: "No calls yet."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 divide-y divide-line text-sm",
				children: [...ledger].reverse().map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center justify-between gap-3 py-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [row.label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block text-xs text-muted",
						children: row.model
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["$", row.usd.toFixed(4)] })]
				}, row.ts))
			})
		]
	});
}
function SetupPanel() {
	const [rows, setRows] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		studioDoctor().then((result) => setRows(result.rows)).catch(() => setError("Could not read the tool list."));
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "flex flex-col gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "desk-card p-4 sm:p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-3xl",
					children: "What this desk can run"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 max-w-2xl text-sm text-muted",
					children: "Heavy picture work stays on one lane at a time. OpenToonz, Synfig, and the ArtCraft apps are marked missing until they are installed on the Windows controller. The episode still previews through the multiplane fallback."
				}),
				error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-sm",
					children: error
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-4 divide-y divide-line",
					children: (rows ?? []).map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "grid gap-1 py-3 sm:grid-cols-[9rem_6rem_1fr] sm:items-baseline",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-semibold",
								children: row.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-semibold tracking-wide text-amber uppercase",
								children: row.status
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm text-muted",
								children: row.detail
							})
						]
					}, row.id))
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "desk-card p-4 sm:p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-display text-2xl",
					children: "Windows controller sheet"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: "The OptiPlex is the controller, not the GPU. When you set that machine up, the engine in this project expects these official installers and clones. Do not run unsigned one-liners. Confirm each download page before you install."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
					className: "mt-4 overflow-x-auto rounded-md bg-ink p-4 text-xs leading-relaxed text-paper",
					children: SETUP
				})
			]
		})]
	});
}
var SETUP = `winget install -e --id Python.Python.3.12
winget install -e --id Git.Git
winget install -e --id OpenJS.NodeJS.LTS
winget install -e --id Gyan.FFmpeg
winget install -e --id BlenderFoundation.Blender
winget install -e --id KDE.Krita
winget install -e --id Inkscape.Inkscape
winget install -e --id Rustlang.Rustup

# Optional study clones (outside the repo)
git clone --depth 1 https://github.com/opentoonz/opentoonz C:\\Studio\\refs\\opentoonz
git clone --depth 1 https://github.com/tahoma2d/tahoma2d C:\\Studio\\refs\\tahoma2d
git clone --depth 1 https://github.com/storytold/effectcraft C:\\Studio\\refs\\effectcraft
git clone --depth 1 https://github.com/storytold/filmcraft C:\\Studio\\refs\\filmcraft
git clone --depth 1 https://github.com/smyrgeorge/artcraft-toolbox C:\\Studio\\refs\\artcraft-toolbox

python -m pip install pillow pyyaml jsonschema numpy pytest
python -m studio doctor
python -m studio draw examples\\ep01_s001.json --out C:\\Studio\\vault\\EP01_S001 --mp4 C:\\Studio\\deliverables\\EP01_S001.mp4

# Model wiring (key stays out of git)
# LLM_BASE_URL=https://api.deepseek.com
# LLM_MODEL=deepseek-flash
# LLM_MODEL_VERSION=DeepSeek-V4.1-Flash-1017
# DEEPSEEK_API_KEY=   (paste from platform.deepseek.com)`;
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StudioDesk, {});
}
//#endregion
export { Home as component };
