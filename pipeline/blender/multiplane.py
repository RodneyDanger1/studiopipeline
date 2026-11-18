"""Headless Blender 2.5D lane.

Run: blender -b -P blender/multiplane.py -- shot.json out_dir root
This file imports only bpy and the standard library. The preview machine may
not have Blender; the Pillow lane in studio.tools.pillow_plane is the fallback.
"""

import json
import sys
from pathlib import Path

argv = sys.argv[sys.argv.index("--") + 1 :]
manifest_path, out_dir = Path(argv[0]), Path(argv[1])
root = Path(argv[2]) if len(argv) > 2 else Path.cwd()
cfg = json.loads(manifest_path.read_text(encoding="utf-8"))
missing = []
for layer in cfg.get("layers", []):
    image = root / layer["image"]
    if not image.exists():
        missing.append(str(image))
    for rel in layer.get("sequence") or []:
        if not (root / rel).exists():
            missing.append(str(root / rel))
if missing:
    raise SystemExit("missing layer files:\n" + "\n".join(missing))

import bpy  # noqa: E402

out_dir.mkdir(parents=True, exist_ok=True)
print("multiplane preflight ok", cfg.get("shot_id"), "frames", cfg.get("duration_frames"))
# The full plane builder lives with the desk's preview lane when Blender is absent.
# When Blender is present, set clip and render stills per frame (see the blueprint).
_ = bpy
