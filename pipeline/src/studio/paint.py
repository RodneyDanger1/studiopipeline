"""Agent draw entry. Validates a shot, runs it through the stage graph, writes frames."""

from __future__ import annotations

import json
import shutil
import subprocess
from pathlib import Path

import jsonschema

from .config import PACKAGE_ROOT, tool_path
from .stages import Stage, run_graph
from .tools.pillow_plane import cel_dir, render_shot

SCHEMA = PACKAGE_ROOT / "schemas" / "shot.schema.json"
EXAMPLE = PACKAGE_ROOT / "examples" / "ep01_s001.json"


def load_shot(path: Path) -> dict:
    manifest = json.loads(path.read_text(encoding="utf-8"))
    schema = json.loads(SCHEMA.read_text(encoding="utf-8"))
    jsonschema.validate(manifest, schema)
    if "camera" not in manifest:
        manifest["camera"] = {"move": "dolly_in", "start_z": 10.5, "end_z": 8.2, "ease": "ease_in_out"}
    manifest.setdefault("shoot_on", 2)
    manifest.setdefault("fps", 24)
    manifest.setdefault("fx", ["vignette"])
    return manifest


def encode_mp4(frames: Path, fps: int, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    ffmpeg = tool_path("ffmpeg")
    cmd = [
        ffmpeg,
        "-y",
        "-framerate",
        str(fps),
        "-i",
        str(frames / "%04d.png"),
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-crf",
        "18",
        "-movflags",
        "+faststart",
        str(dest),
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=300)
    if result.returncode != 0:
        tail = (result.stderr or "")[-1500:]
        raise RuntimeError(f"ffmpeg failed ({result.returncode}): {tail}")


def draw_shot(shot_path: Path, out_dir: Path, mp4: Path | None = None) -> dict:
    """Run S5 (paint) and, when asked, S9 (encode) on the stage graph."""
    manifest = load_shot(shot_path)
    out_dir.mkdir(parents=True, exist_ok=True)
    result: dict = {
        "shot_id": manifest.get("shot_id"),
        "cels": str(cel_dir() or ""),
        "frames_dir": str(out_dir),
    }

    def animate(_force: bool = False) -> str:
        result["frames"] = render_shot(manifest, out_dir)
        return "ran"

    stages = {"S5": Stage("S5", animate, ram_mb=900)}
    if mp4 is not None:
        dest = mp4

        def comp(_force: bool = False) -> str:
            encode_mp4(out_dir, int(manifest.get("fps") or 24), dest)
            result["mp4"] = str(dest)
            return "ran"

        stages["S9"] = Stage("S9", comp, deps=("S5",), ram_mb=400)
    run_graph(stages, force=True)
    result["ok"] = True
    if not result.get("cels"):
        result["lane"] = "fallback"
    else:
        result["lane"] = "painted"
    return result


def default_example() -> Path:
    if not EXAMPLE.is_file():
        raise FileNotFoundError(f"missing example shot: {EXAMPLE}")
    return EXAMPLE


def ffmpeg_available() -> bool:
    return shutil.which("ffmpeg") is not None
