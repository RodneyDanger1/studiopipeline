import { useEffect, useState } from "react";
import {
  Clapperboard,
  KeyRound,
  Loader2,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { pingDeepseek, studioDoctor, writeEpisode } from "@/lib/studio/deepseek.functions";
import { DEEPSEEK, STAGES, maskKey, type LedgerRow } from "@/lib/studio/model";
import { houseDraft } from "@/lib/studio/planner";
import { useDesk, type TabId } from "@/lib/studio/store";
import { episodeErrors } from "@/lib/studio/validate";
import { PreviewStage } from "./preview-stage";

const TABS: { id: TabId; label: string }[] = [
  { id: "brief", label: "Brief" },
  { id: "board", label: "Board" },
  { id: "preview", label: "Preview" },
  { id: "style", label: "Style" },
  { id: "vault", label: "Key" },
  { id: "setup", label: "Setup" },
];

export function StudioDesk() {
  const hydrated = useDesk((s) => s.hydrated);
  const setHydrated = useDesk((s) => s.setHydrated);

  useEffect(() => {
    const done = () => setHydrated(true);
    if (useDesk.persist.hasHydrated()) done();
    return useDesk.persist.onFinishHydration(done);
  }, [setHydrated]);

  if (!hydrated) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
        <p className="text-sm text-muted">Opening the desk…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <Header />
      <div className="mx-auto grid max-w-6xl gap-4 px-4 py-4 lg:grid-cols-[13.5rem_1fr] lg:px-6">
        <StageRail />
        <div className="flex min-w-0 flex-col gap-4">
          <TabBar />
          <Panel />
        </div>
      </div>
    </main>
  );
}

function Header() {
  const apiKey = useDesk((s) => s.apiKey);
  const spent = useDesk((s) => s.ledger.reduce((n, row) => n + row.usd, 0));
  const budget = useDesk((s) => s.budgetUsd);
  return (
    <header className="border-b border-ink bg-ink text-paper">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 lg:px-6">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-md bg-amber text-amber-ink">
            <Clapperboard className="size-5" aria-hidden />
          </span>
          <div>
            <p className="font-display text-xl leading-none">Studio Pipeline</p>
            <p className="mt-1 text-sm text-paper/70">Original episodes, from a brief to a picture.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="rounded-full bg-amber px-3 py-1 font-semibold text-amber-ink">
            {DEEPSEEK.version}
          </span>
          <span className="rounded-full border border-paper/25 px-3 py-1">
            {apiKey ? `Key ${maskKey(apiKey)}` : "No key saved"}
          </span>
          <span className="rounded-full border border-paper/25 px-3 py-1">
            ${spent.toFixed(3)} / ${budget.toFixed(2)}
          </span>
        </div>
      </div>
    </header>
  );
}

function StageRail() {
  const episode = useDesk((s) => s.episode);
  const palette = useDesk((s) => s.palette);
  const played = episode.shots.length > 0;
  const fromModel = episode.source === "deepseek";
  const flags: Record<string, string> = {
    S0: fromModel ? "Written" : "House draft",
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
    S12: "You upload",
  };
  return (
    <nav className="desk-card flex gap-2 overflow-x-auto p-2 lg:flex-col lg:overflow-visible" aria-label="Pipeline stages">
      {STAGES.map((stage) => (
        <div key={stage.id} className="min-w-36 shrink-0 px-2 py-2 lg:min-w-0">
          <p className="text-xs font-semibold tracking-wide text-amber">{stage.id}</p>
          <p className="text-sm font-semibold">{stage.name}</p>
          <p className="text-xs text-muted">{flags[stage.id]}</p>
        </div>
      ))}
    </nav>
  );
}

function TabBar() {
  const tab = useDesk((s) => s.tab);
  const setTab = useDesk((s) => s.setTab);
  return (
    <div className="flex gap-2 overflow-x-auto" role="tablist">
      {TABS.map((item) => {
        const on = tab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={on}
            className={
              "h-11 shrink-0 rounded-full px-4 text-sm font-semibold " +
              (on ? "bg-ink text-paper" : "border border-line bg-card text-ink")
            }
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

function Panel() {
  const tab = useDesk((s) => s.tab);
  if (tab === "brief") return <BriefPanel />;
  if (tab === "board") return <BoardPanel />;
  if (tab === "preview") return <PreviewPanel />;
  if (tab === "style") return <StylePanel />;
  if (tab === "vault") return <VaultPanel />;
  return <SetupPanel />;
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
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");

  async function write() {
    setError("");
    setNote("");
    if (!apiKey.trim()) {
      useDesk.getState().setKeyStatus(
        "Save a DeepSeek key first. The model is already DeepSeek-V4.1-Flash-1017 (deepseek-flash). The date 1017 is the model version, not the key.",
      );
      setTab("vault");
      return;
    }
    setBusy(true);
    try {
      const spent = ledger.reduce((n, row) => n + row.usd, 0);
      const result = await writeEpisode({
        data: { apiKey, brief, bible, targetSeconds, spentUsd: spent, budgetUsd },
      });
      if (result.usd) {
        addLedger({
          ts: Date.now(),
          label: result.ok ? "Episode" : "Episode attempt",
          model: result.model,
          promptTokens: result.usage?.prompt_tokens ?? 0,
          completionTokens: result.usage?.completion_tokens ?? 0,
          usd: result.usd,
        });
      }
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

  return (
    <section className="desk-card p-4 sm:p-6">
      <p className="text-xs font-semibold tracking-widest text-muted uppercase">S0 · Story</p>
      <h2 className="mt-1 font-display text-3xl leading-tight">What are we making?</h2>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        DeepSeek V4.1 Flash 1017 writes the beats and the shot manifest. Thinking is off for this step so the reply stays
        JSON, fast, and inside the budget. Peak price used for the meter is $0.30 in / $1.20 out per million tokens.
      </p>
      <label className="mt-5 block text-sm font-semibold" htmlFor="brief">
        Brief
      </label>
      <textarea
        id="brief"
        value={brief}
        onChange={(e) => setBrief(e.target.value)}
        rows={5}
        className="mt-2 w-full resize-y rounded-md border border-line bg-paper px-3 py-3 text-base"
      />
      <label className="mt-4 block text-sm font-semibold" htmlFor="bible">
        Style and character bible
      </label>
      <textarea
        id="bible"
        value={bible}
        onChange={(e) => setBible(e.target.value)}
        rows={5}
        className="mt-2 w-full resize-y rounded-md border border-line bg-paper px-3 py-3 text-base"
      />
      <label className="mt-4 flex items-center justify-between text-sm font-semibold" htmlFor="seconds">
        Target length
        <span className="font-normal text-muted">{targetSeconds} seconds</span>
      </label>
      <input
        id="seconds"
        type="range"
        min={5}
        max={90}
        value={targetSeconds}
        onChange={(e) => setTargetSeconds(Number(e.target.value))}
        className="mt-2 h-11 w-full accent-amber"
      />
      {error ? <p className="mt-4 rounded-md bg-amber-soft px-3 py-2 text-sm text-amber-ink">{error}</p> : null}
      {note ? <p className="mt-4 text-sm">{note}</p> : null}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={write}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-amber px-5 text-sm font-semibold text-amber-ink disabled:opacity-60"
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : null}
          {busy ? "Writing…" : "Write with DeepSeek"}
        </button>
        <button
          type="button"
          className="h-11 rounded-full border border-line bg-card px-5 text-sm font-semibold"
          onClick={() => {
            setEpisode(houseDraft());
            setNote("Loaded the house draft. Original painted cels, not a model write.");
            setTab("preview");
          }}
        >
          Load house draft
        </button>
      </div>
    </section>
  );
}

function BoardPanel() {
  const episode = useDesk((s) => s.episode);
  const selectShot = useDesk((s) => s.selectShot);
  const errors = episodeErrors(episode);
  const frames = episode.shots.reduce((n, s) => n + s.duration_frames, 0);
  return (
    <section className="flex flex-col gap-4">
      <div className="desk-card p-4 sm:p-6">
        <p className="text-xs font-semibold tracking-widest text-muted uppercase">
          {episode.source === "deepseek" ? `From ${episode.model}` : "House draft · not from the model"}
        </p>
        <h2 className="mt-1 font-display text-3xl leading-tight">{episode.title}</h2>
        <p className="mt-2 max-w-2xl text-sm">{episode.logline}</p>
        <p className="mt-3 text-sm text-muted">
          {episode.shots.length} shots · {frames} frames · {(frames / episode.fps).toFixed(1)}s at {episode.fps} fps
        </p>
        {errors.length ? (
          <ul className="mt-3 list-disc pl-5 text-sm text-amber-ink">
            {errors.slice(0, 6).map((err) => (
              <li key={err}>{err}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 inline-flex items-center gap-2 text-sm font-semibold">
            <ShieldCheck className="size-4" /> Manifest passes the schema checks.
          </p>
        )}
      </div>
      <ol className="grid gap-3">
        {episode.shots.map((shot) => (
          <li key={shot.shot_id}>
            <button
              type="button"
              onClick={() => selectShot(shot.shot_id)}
              className="desk-card flex w-full flex-col gap-2 p-4 text-left sm:flex-row sm:items-center sm:justify-between"
            >
              <span>
                <span className="font-display text-xl">{shot.shot_id}</span>
                <span className="mt-1 block text-sm text-muted">{shot.notes || shot.camera.move}</span>
              </span>
              <span className="text-sm text-muted">
                {shot.duration_frames}f · {shot.layers.length} layers · {shot.camera.move}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}

function PreviewPanel() {
  const shot = useDesk((s) => s.shot());
  return (
    <div className="flex flex-col gap-4">
      <PreviewStage shot={shot} />
      <video
        className="desk-card w-full"
        controls
        preload="metadata"
        src="/media/smoke.mp4"
        poster=""
      >
        A packed 5-second sample plays here once the fallback encoder has written it.
      </video>
      <p className="text-sm text-muted">
        The player under the canvas is the same painted lane, packed with FFmpeg, so you can scrub it without the live clock.
      </p>
    </div>
  );
}

function StylePanel() {
  const palette = useDesk((s) => s.palette);
  const note = useDesk((s) => s.styleNote);
  return (
    <section className="desk-card p-4 sm:p-6">
      <p className="text-xs font-semibold tracking-widest text-muted uppercase">S3 · Style spec</p>
      <h2 className="mt-1 font-display text-3xl">Measure the look</h2>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Play a shot, then Measure look. The swatches come from that frame only. Nothing here is sampled from a
        copyrighted picture.
      </p>
      {palette.length === 0 ? (
        <p className="mt-6 text-sm">No measurement yet.</p>
      ) : (
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {palette.map((swatch) => (
            <li key={swatch.hex} className="overflow-hidden rounded-md border border-line">
              <div className="h-16" style={{ background: swatch.hex }} />
              <p className="bg-card px-2 py-2 text-xs font-semibold">
                {swatch.hex} · {Math.round(swatch.weight * 100)}%
              </p>
            </li>
          ))}
        </ul>
      )}
      {note ? <p className="mt-4 text-sm text-muted">{note}</p> : null}
    </section>
  );
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
  const [draft, setDraft] = useState(apiKey);
  const [busy, setBusy] = useState(false);

  useEffect(() => setDraft(apiKey), [apiKey]);

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
      const row: LedgerRow = {
        ts: Date.now(),
        label: "Key check",
        model: result.model,
        promptTokens: result.usage?.prompt_tokens ?? 0,
        completionTokens: result.usage?.completion_tokens ?? 0,
        usd: result.usd,
      };
      addLedger(row);
      setKeyStatus(`Saved on this device. ${result.model} answered. Check cost $${result.usd.toFixed(4)}.`);
    } catch (err) {
      setKeyStatus(err instanceof Error ? err.message : "Check failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="desk-card p-4 sm:p-6">
      <div className="flex items-center gap-2">
        <KeyRound className="size-5" aria-hidden />
        <p className="text-xs font-semibold tracking-widest text-muted uppercase">Persistent key</p>
      </div>
      <h2 className="mt-1 font-display text-3xl leading-tight">DeepSeek key vault</h2>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        The studio is wired to <span className="font-semibold text-ink">{DEEPSEEK.modelId}</span>, which DeepSeek serves
        as {DEEPSEEK.version}. The key is not the model name. Paste the key from your DeepSeek console. It stays in this
        browser, is sent only to call DeepSeek, and is never written into the episode files.
      </p>
      <label className="mt-5 block text-sm font-semibold" htmlFor="key">
        API key
      </label>
      <input
        id="key"
        type="password"
        autoComplete="off"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="sk-…"
        className="mt-2 h-11 w-full rounded-md border border-line bg-paper px-3"
      />
      <label className="mt-4 block text-sm font-semibold" htmlFor="budget">
        Episode budget (USD, peak rates)
      </label>
      <input
        id="budget"
        type="number"
        min={0}
        step={0.5}
        value={budgetUsd}
        onChange={(e) => setBudgetUsd(Number(e.target.value))}
        className="mt-2 h-11 w-32 rounded-md border border-line bg-paper px-3"
      />
      {keyStatus ? <p className="mt-4 text-sm">{keyStatus}</p> : null}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={saveAndPing}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-amber px-5 text-sm font-semibold text-amber-ink disabled:opacity-60"
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : null}
          Save and check key
        </button>
        <button
          type="button"
          onClick={forgetKey}
          className="inline-flex h-11 items-center gap-2 rounded-full border border-line px-4 text-sm font-semibold"
        >
          <Trash2 className="size-4" />
          Forget key
        </button>
      </div>
      <h3 className="mt-8 font-display text-xl">Cost ledger</h3>
      {ledger.length === 0 ? (
        <p className="mt-2 text-sm text-muted">No calls yet.</p>
      ) : (
        <ul className="mt-3 divide-y divide-line text-sm">
          {[...ledger].reverse().map((row) => (
            <li key={row.ts} className="flex items-center justify-between gap-3 py-2">
              <span>
                {row.label}
                <span className="block text-xs text-muted">{row.model}</span>
              </span>
              <span>${row.usd.toFixed(4)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function SetupPanel() {
  const [rows, setRows] = useState<{ id: string; name: string; status: string; detail: string }[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    studioDoctor()
      .then((result) => setRows(result.rows))
      .catch(() => setError("Could not read the tool list."));
  }, []);

  return (
    <section className="flex flex-col gap-4">
      <div className="desk-card p-4 sm:p-6">
        <h2 className="font-display text-3xl">What this desk can run</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Heavy picture work stays on one lane at a time. OpenToonz, Synfig, and the ArtCraft apps are marked missing
          until they are installed on the Windows controller. The episode still previews through the multiplane fallback.
        </p>
        {error ? <p className="mt-4 text-sm">{error}</p> : null}
        <ul className="mt-4 divide-y divide-line">
          {(rows ?? []).map((row) => (
            <li key={row.id} className="grid gap-1 py-3 sm:grid-cols-[9rem_6rem_1fr] sm:items-baseline">
              <span className="font-semibold">{row.name}</span>
              <span className="text-xs font-semibold tracking-wide text-amber uppercase">{row.status}</span>
              <span className="text-sm text-muted">{row.detail}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="desk-card p-4 sm:p-6">
        <h3 className="font-display text-2xl">Windows controller sheet</h3>
        <p className="mt-2 text-sm text-muted">
          The OptiPlex is the controller, not the GPU. When you set that machine up, the engine in this project expects
          these official installers and clones. Do not run unsigned one-liners. Confirm each download page before you
          install.
        </p>
        <pre className="mt-4 overflow-x-auto rounded-md bg-ink p-4 text-xs leading-relaxed text-paper">{SETUP}</pre>
      </div>
    </section>
  );
}

const SETUP = `winget install -e --id Python.Python.3.12
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
