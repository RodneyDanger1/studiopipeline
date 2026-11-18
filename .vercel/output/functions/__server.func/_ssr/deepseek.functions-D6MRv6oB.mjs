import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
import { a as coerceEpisode, o as episodeErrors, s as estimateUsd, t as DEEPSEEK } from "./validate-Cx6o1oU3.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/deepseek.functions-D6MRv6oB.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
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
function redact(text, key) {
	return text.split(key).join("••••");
}
async function chat(apiKey, messages, maxTokens) {
	const body = {
		model: DEEPSEEK.modelId,
		messages,
		thinking: { type: "disabled" },
		response_format: { type: "json_object" },
		max_tokens: maxTokens,
		stream: false
	};
	let res = await fetch(`${DEEPSEEK.baseUrl}/chat/completions`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${apiKey}`,
			"Content-Type": "application/json"
		},
		body: JSON.stringify(body),
		signal: AbortSignal.timeout(12e4)
	});
	if (!res.ok && res.status === 400) {
		const probe = await res.text();
		if (/response_format|max_tokens/i.test(probe)) {
			delete body.response_format;
			body.max_completion_tokens = maxTokens;
			delete body.max_tokens;
			res = await fetch(`${DEEPSEEK.baseUrl}/chat/completions`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${apiKey}`,
					"Content-Type": "application/json"
				},
				body: JSON.stringify(body),
				signal: AbortSignal.timeout(12e4)
			});
		} else throw new Error(redact(probe.slice(0, 400), apiKey) || `DeepSeek returned ${res.status}`);
	}
	const text = await res.text();
	if (!res.ok) {
		let message = text.slice(0, 400);
		try {
			const parsed = JSON.parse(text);
			if (parsed.error?.message) message = parsed.error.message;
		} catch {}
		if (res.status === 401) message = "DeepSeek refused that key.";
		if (res.status === 402) message = "DeepSeek says this account is out of credit.";
		if (res.status === 429) message = "DeepSeek rate limit. Wait a moment and try again.";
		throw new Error(redact(message, apiKey));
	}
	const data = JSON.parse(text);
	const message = data.choices?.[0]?.message;
	return {
		content: (message?.content || message?.reasoning_content || "").trim(),
		model: data.model || DEEPSEEK.modelId,
		usage: data.usage ?? {}
	};
}
function parseJson(content) {
	const slice = content.match(/```(?:json)?\s*([\s\S]*?)```/)?.[1] ?? content;
	const start = slice.indexOf("{");
	const end = slice.lastIndexOf("}");
	if (start < 0 || end < start) throw new Error("Model did not return a JSON object.");
	return JSON.parse(slice.slice(start, end + 1));
}
var pingDeepseek_createServerFn_handler = createServerRpc({
	id: "13d399f65b85ed258b3b293a54000938f456e1daa6a04b693720d4bf098343a7",
	name: "pingDeepseek",
	filename: "src/lib/studio/deepseek.functions.ts"
}, (opts) => pingDeepseek.__executeServer(opts));
var pingDeepseek = createServerFn({ method: "POST" }).validator((input) => ({ apiKey: cleanKey(input.apiKey) })).handler(pingDeepseek_createServerFn_handler, async ({ data }) => {
	try {
		const result = await chat(data.apiKey, [{
			role: "system",
			content: "Return JSON only: {\"ok\":true}"
		}, {
			role: "user",
			content: "Confirm the model is reachable."
		}], 64);
		const usd = estimateUsd(result.usage);
		return {
			ok: true,
			model: result.model,
			version: DEEPSEEK.version,
			usd,
			usage: result.usage
		};
	} catch (error) {
		return {
			ok: false,
			error: redact(error instanceof Error ? error.message : "Could not reach DeepSeek.", data.apiKey)
		};
	}
});
var writeEpisode_createServerFn_handler = createServerRpc({
	id: "f372d2b556443cac2e7fb82f6cea1badedd920acfee5b81c377ecde6e2ae3cb3",
	name: "writeEpisode",
	filename: "src/lib/studio/deepseek.functions.ts"
}, (opts) => writeEpisode.__executeServer(opts));
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
}).handler(writeEpisode_createServerFn_handler, async ({ data }) => {
	const frames = data.targetSeconds * 24;
	const system = "You are a storyboard artist for an original series. Return one JSON object and no prose. Do not name or imitate any existing film, show, brand, logo, or real person. All characters are original.";
	let prompt = `BRIEF:\n${data.brief}\n\nBIBLE (do not contradict):\n${data.bible}\n\nBuild an episode of about ${data.targetSeconds} seconds at 24 fps (${frames} frames). shoot_on is 2. lane is blender_2p5d. resolution is [1280, 720]. Use 4 to 7 shots. Each shot is 24 to 144 frames. The sum of duration_frames must be within 3 percent of ${frames}. shot_id values are EP01_S001, EP01_S002, and so on. Layers may only use these image paths: assets/sky.png, assets/hills.png, assets/hero.png, assets/lantern.png. Every layer needs a name and a depth greater than 0 (larger means farther). camera needs move, start_z, end_z, and ease (linear, ease_in, ease_out, or ease_in_out). Dialogue is original, short, and fits about 3 words per second. JSON keys: title, logline, beats (title, seconds, summary), shots (shot_id, episode, lane, fps, resolution, duration_frames, shoot_on, camera, layers, fx, dialogue, notes).`;
	let lastError = "The model did not return a valid episode.";
	let attempts = 0;
	let promptTokens = 0;
	let completionTokens = 0;
	let usd = 0;
	let modelEcho = DEEPSEEK.modelId;
	try {
		for (attempts = 1; attempts <= 3; attempts++) {
			const result = await chat(data.apiKey, [{
				role: "system",
				content: system
			}, {
				role: "user",
				content: prompt
			}], 3500);
			modelEcho = result.model;
			promptTokens += result.usage.prompt_tokens ?? 0;
			completionTokens += result.usage.completion_tokens ?? 0;
			usd += estimateUsd(result.usage);
			if (data.budgetUsd > 0 && data.spentUsd + usd > data.budgetUsd + .05) return {
				ok: false,
				error: "Stopped: this call would pass the episode budget.",
				usd,
				usage: {
					prompt_tokens: promptTokens,
					completion_tokens: completionTokens
				},
				model: modelEcho
			};
			try {
				const episode = coerceEpisode(parseJson(result.content), "deepseek", modelEcho, data.targetSeconds);
				const errors = episodeErrors(episode);
				if (errors.length === 0) return {
					ok: true,
					episode,
					attempts,
					usd,
					model: modelEcho,
					version: DEEPSEEK.version,
					usage: {
						prompt_tokens: promptTokens,
						completion_tokens: completionTokens
					}
				};
				lastError = errors.slice(0, 6).join("; ");
			} catch (error) {
				lastError = error instanceof Error ? error.message : "Could not parse JSON.";
			}
			prompt += `\n\nThat failed validation: ${lastError}. Return corrected JSON only.`;
		}
		return {
			ok: false,
			error: `DeepSeek tried ${attempts - 1} times. ${lastError}`,
			usd,
			model: modelEcho,
			usage: {
				prompt_tokens: promptTokens,
				completion_tokens: completionTokens
			}
		};
	} catch (error) {
		return {
			ok: false,
			error: redact(error instanceof Error ? error.message : "DeepSeek call failed.", data.apiKey),
			usd,
			model: modelEcho,
			usage: {
				prompt_tokens: promptTokens,
				completion_tokens: completionTokens
			}
		};
	}
});
var studioDoctor_createServerFn_handler = createServerRpc({
	id: "c453625c7867044ba4e5f1a819c67fcc752b4626abf4090e6e551227e250338d",
	name: "studioDoctor",
	filename: "src/lib/studio/deepseek.functions.ts"
}, (opts) => studioDoctor.__executeServer(opts));
var studioDoctor = createServerFn({ method: "GET" }).handler(studioDoctor_createServerFn_handler, async () => {
	const { execFile } = await import("node:child_process");
	const { promisify } = await import("node:util");
	const run = promisify(execFile);
	async function probe(cmd, args) {
		try {
			const { stdout, stderr } = await run(cmd, args, { timeout: 8e3 });
			return {
				status: "OK",
				detail: (`${stdout}${stderr}`.trim().split("\n")[0] ?? "").slice(0, 120)
			};
		} catch {
			return {
				status: "MISSING",
				detail: `${cmd} is not on this machine`
			};
		}
	}
	const [ffmpeg, ffprobe, python] = await Promise.all([
		probe("ffmpeg", ["-version"]),
		probe("ffprobe", ["-version"]),
		probe("python3", ["--version"])
	]);
	const blender = await probe("blender", ["--version"]);
	return { rows: [
		{
			id: "deepseek",
			name: "DeepSeek V4.1 Flash 1017",
			status: "OK",
			detail: `${DEEPSEEK.modelId} · ${DEEPSEEK.baseUrl}`
		},
		{
			id: "ffmpeg",
			name: "FFmpeg",
			...ffmpeg
		},
		{
			id: "ffprobe",
			name: "ffprobe",
			...ffprobe
		},
		{
			id: "python",
			name: "Python",
			...python
		},
		{
			id: "blender",
			name: "Blender",
			status: blender.status === "OK" ? "OK" : "FALLBACK",
			detail: blender.status === "OK" ? blender.detail : "Pillow multiplane fallback is the preview lane"
		},
		{
			id: "opentoonz",
			name: "OpenToonz",
			status: "MISSING",
			detail: "Install on the Windows controller. Synfig, then the 2.5D lane, are the fallbacks."
		},
		{
			id: "artcraft",
			name: "EffectCraft / FilmCraft",
			status: "UNAVAILABLE",
			detail: "Not installed here. Composite and edit fall back to the multiplane plus FFmpeg."
		}
	] };
});
//#endregion
export { pingDeepseek_createServerFn_handler, studioDoctor_createServerFn_handler, writeEpisode_createServerFn_handler };
