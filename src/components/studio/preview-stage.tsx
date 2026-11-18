import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { celsReady, drawFrame, samplePalette, subscribeCels } from "@/lib/studio/draw";
import type { Shot } from "@/lib/studio/model";
import { useDesk } from "@/lib/studio/store";

export function PreviewStage({ shot }: { shot: Shot | undefined }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [playing, setPlaying] = useState(false);
  const [frame, setFrame] = useState(1);
  const [artReady, setArtReady] = useState(celsReady());
  const setStyle = useDesk((s) => s.setStyle);

  useEffect(() => subscribeCels(() => setArtReady(celsReady())), []);

  useEffect(() => {
    setFrame(1);
    setPlaying(false);
  }, [shot?.shot_id]);

  useEffect(() => {
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
  }, [shot, frame, artReady]);

  useEffect(() => {
    if (!playing || !shot) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    let raf = 0;
    let last = performance.now();
    const step = (now: number) => {
      const ms = 1000 / shot.fps;
      if (now - last >= ms) {
        last = now;
        setFrame((f) => (f >= shot.duration_frames ? 1 : f + 1));
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [playing, shot]);

  if (!shot) {
    return (
      <section className="desk-card p-6">
        <h2 className="font-display text-2xl">No shot selected</h2>
        <p className="mt-2 text-muted">Pick a shot from the board.</p>
      </section>
    );
  }

  const seconds = (shot.duration_frames / shot.fps).toFixed(2);
  const line = shot.dialogue.find((d) => d.text && frame >= d.start_frame);

  function measure() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const palette = samplePalette(canvas, 6);
    useDesk.getState().setStyle(
      palette,
      "Measured from the painted preview frame. Rights: original artwork made for this project. Not sampled from a copyrighted film.",
    );
    setStyle(palette, useDesk.getState().styleNote);
  }

  return (
    <section className="desk-card overflow-hidden">
      <div className="flex items-end justify-between gap-3 border-b border-line px-4 py-3">
        <div>
          <p className="text-xs font-semibold tracking-widest text-muted uppercase">Multiplane preview</p>
          <h2 className="font-display text-2xl leading-tight">{shot.shot_id}</h2>
        </div>
        <p className="text-sm text-muted">
          {shot.resolution[0]}×{shot.resolution[1]} · {shot.fps} fps · {seconds}s · on {shot.shoot_on}s
        </p>
      </div>
      <div className="bg-ink p-3 sm:p-4">
        <canvas
          ref={canvasRef}
          className="aspect-video w-full rounded-md bg-ink"
          role="img"
          aria-label={`${shot.shot_id} multiplane frame ${frame}`}
        />
        {line ? (
          <p className="mt-3 text-center text-sm text-paper">
            <span className="text-amber">{line.character}. </span>
            {line.text}
          </p>
        ) : (
          <p className="mt-3 text-center text-sm text-paper/70">Hold. No line on this frame.</p>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-3 px-4 py-3">
        <button
          type="button"
          className="inline-flex h-11 items-center gap-2 rounded-full bg-ink px-4 text-sm font-semibold text-paper"
          onClick={() => setPlaying((v) => !v)}
        >
          {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
          {playing ? "Pause" : "Play shot"}
        </button>
        <label className="flex min-w-40 flex-1 items-center gap-3 text-sm text-muted">
          Frame {String(frame).padStart(4, "0")}
          <input
            className="h-11 w-full accent-amber"
            type="range"
            min={1}
            max={shot.duration_frames}
            value={frame}
            onChange={(e) => {
              setPlaying(false);
              setFrame(Number(e.target.value));
            }}
          />
        </label>
        <button
          type="button"
          className="h-11 rounded-full border border-line bg-card px-4 text-sm font-semibold"
          onClick={measure}
        >
          Measure look
        </button>
      </div>
      <p className="px-4 pb-4 text-sm text-muted">
        Gouache plates and a xerox cel, held on twos. The valley lights go out, the lantern flickers, and nearer layers
        travel farther than the sky. {artReady ? "Painted cels are loaded." : "Loading the painted cels."}
      </p>
    </section>
  );
}
