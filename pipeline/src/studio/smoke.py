import json
import shutil
from pathlib import Path

from .config import root, tool_path
from .runner import run
from .tools.pillow_plane import render_shot


def run_smoke(seconds: int = 5) -> Path:
    base = root() / "vault" / "SMOKE"
    frames = base / "frames"
    if frames.exists():
        shutil.rmtree(frames)
    manifest = {
        "shot_id": "EP01_S001",
        "episode": 1,
        "lane": "blender_2p5d",
        "fps": 24,
        "resolution": [1280, 720],
        "duration_frames": seconds * 24,
        "shoot_on": 2,
        "camera": {"move": "dolly_in", "start_z": 10.5, "end_z": 8.2, "ease": "ease_in_out"},
        "layers": [
            {"name": "sky", "image": "assets/sky.png", "depth": 40},
            {"name": "hills", "image": "assets/hills.png", "depth": 25},
            {"name": "hero", "image": "assets/hero.png", "depth": 12},
        ],
        "fx": ["film_grain", "vignette"],
        "notes": "Fallback smoke. Original artwork.",
    }
    base.mkdir(parents=True, exist_ok=True)
    (base / "shot.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    count = render_shot(manifest, frames)
    if count != manifest["duration_frames"]:
        raise RuntimeError(f"expected {manifest['duration_frames']} frames, got {count}")
    out = root() / "deliverables" / "SMOKE" / "smoke.mp4"
    out.parent.mkdir(parents=True, exist_ok=True)
    ffmpeg = tool_path("ffmpeg")
    run(
        [
            ffmpeg,
            "-y",
            "-framerate",
            "24",
            "-i",
            str(frames / "%04d.png"),
            "-c:v",
            "libx264",
            "-pix_fmt",
            "yuv420p",
            "-crf",
            "20",
            "-movflags",
            "+faststart",
            str(out),
        ],
        cwd=base,
        timeout=180,
    )
    print("SMOKE OK", out)
    return out
