"""Painted multiplane. Uses the gouache plates in public/media/cels when they
are on disk, and a flat fallback when they are not.

Layout numbers match src/lib/studio/draw.ts. Change both together.
"""

from __future__ import annotations

import json
import os
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

GAIN = 2.2
_CACHE: dict[tuple, Image.Image] = {}


def cel_dir() -> Path | None:
    override = os.environ.get("STUDIO_CELS")
    if override:
        path = Path(override)
        return path if (path / "mira.png").is_file() and (path / "sky.jpg").is_file() else None
    here = Path(__file__).resolve()
    candidates = [
        here.parents[4] / "public" / "media" / "cels",
        here.parents[3] / "public" / "media" / "cels",
        Path("/workspace/public/media/cels"),
    ]
    for path in candidates:
        if (path / "mira.png").is_file() and (path / "sky.jpg").is_file():
            return path
    return None


def _ease(t: float, kind: str) -> float:
    x = min(1.0, max(0.0, t))
    if kind == "ease_in_out":
        return x * x * (3 - 2 * x)
    if kind == "ease_in":
        return x * x
    if kind == "ease_out":
        return 1 - (1 - x) ** 2
    return x


def _held(frame: int, shoot: int) -> int:
    shoot = max(1, shoot)
    return ((frame - 1) // shoot) * shoot + 1


def push_amount(frame: int, manifest: dict) -> float:
    cam = manifest.get("camera") or {}
    n = max(1, int(manifest.get("duration_frames") or 1))
    shoot = int(manifest.get("shoot_on") or 2)
    held = _held(frame, shoot)
    t = (held - 1) / max(1, n - 1)
    z0 = float(cam.get("start_z", 10))
    z1 = float(cam.get("end_z", z0))
    z = z0 + (z1 - z0) * _ease(t, str(cam.get("ease") or "ease_in_out"))
    travel = (z0 - z) / max(0.5, abs(z0))
    return travel * GAIN


def hero_frac(manifest: dict) -> float:
    depth = 12.0
    for layer in manifest.get("layers") or []:
        name = str(layer.get("name", "")).lower()
        if any(token in name for token in ("hero", "mira", "character")):
            try:
                depth = float(layer.get("depth", depth))
            except (TypeError, ValueError):
                pass
    return max(0.42, min(0.82, 0.50 + (12.0 - depth) * 0.045))


def _resized(img: Image.Image, dw: int, dh: int, key: str) -> Image.Image:
    dw, dh = max(1, dw), max(1, dh)
    slot = (key, dw, dh)
    hit = _CACHE.get(slot)
    if hit is None:
        hit = img.resize((dw, dh), Image.Resampling.LANCZOS)
        _CACHE[slot] = hit
    return hit


def _paste(base: Image.Image, img: Image.Image, scale: float, ox: float, oy: float, anchor: str, key: str):
    w, h = base.size
    dw, dh = int(w * scale), int(h * scale)
    sprite = _resized(img, dw, dh, key)
    if anchor == "bottom":
        x = int((w - dw) / 2 + ox)
        y = int(h - dh + oy)
    else:
        x = int((w - dw) / 2 + ox)
        y = int((h - dh) / 2 + oy)
    base.alpha_composite(sprite, (x, y))
    return x, y, dw, dh


def _screen(base: Image.Image, overlay: Image.Image) -> Image.Image:
    b = np.asarray(base).astype(np.float32)
    o = np.asarray(overlay).astype(np.float32)
    alpha = o[:, :, 3:4] / 255.0
    br = b[:, :, :3] / 255.0
    og = o[:, :, :3] / 255.0
    mixed = 1.0 - (1.0 - br) * (1.0 - og)
    b[:, :, :3] = (br * (1.0 - alpha) + mixed * alpha) * 255.0
    return Image.fromarray(np.clip(b, 0, 255).astype(np.uint8), "RGBA")


def _load_pack(folder: Path):
    meta_path = folder / "meta.json"
    meta = json.loads(meta_path.read_text(encoding="utf-8")) if meta_path.is_file() else {}
    lantern = meta.get("lantern") or {"x": 0.16, "y": 0.58}
    lights = meta.get("lights") or []
    return {
        "sky": Image.open(folder / "sky.jpg").convert("RGBA"),
        "valley": Image.open(folder / "valley.png").convert("RGBA"),
        "pines": Image.open(folder / "pines.png").convert("RGBA"),
        "ridge": Image.open(folder / "ridge.png").convert("RGBA"),
        "mira": Image.open(folder / "mira.png").convert("RGBA"),
        "lantern": lantern,
        "lights": lights,
    }


def _paint_cel(manifest: dict, frame: int, pack: dict) -> Image.Image:
    res = manifest.get("resolution") or [1280, 720]
    w, h = int(res[0]), int(res[1])
    push = push_amount(frame, manifest)
    held = _held(frame, int(manifest.get("shoot_on") or 2))
    fx = set(manifest.get("fx") or [])
    base = Image.new("RGBA", (w, h), (20, 24, 38, 255))
    _paste(base, pack["sky"], 1.16 + push * 0.08, -push * w * 0.02, -h * 0.02, "center", "sky")
    vx, vy, vdw, vdh = _paste(
        base, pack["valley"], 1.32 + push * 0.18, -push * w * 0.05, h * 0.06, "center", "valley"
    )
    if pack["lights"]:
        arr = np.asarray(base).astype(np.float32)
        for light in pack["lights"]:
            die = int(light.get("die", 999))
            if held < die:
                continue
            sx = vx + float(light["x"]) * vdw
            sy = vy + float(light["y"]) * vdh
            if sx < -20 or sy < -20 or sx > w + 20 or sy > h + 20:
                continue
            rad = max(3, int(vdw * 0.008))
            x0, x1 = max(0, int(sx) - rad), min(w, int(sx) + rad + 1)
            y0, y1 = max(0, int(sy) - rad), min(h, int(sy) + rad + 1)
            arr[y0:y1, x0:x1, :3] *= 0.35
        base = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), "RGBA")
    _paste(base, pack["pines"], 1.50 + push * 0.28, -push * w * 0.08, h * 0.10, "center", "pines")
    mira = pack["mira"]
    hh = max(8, int(h * (hero_frac(manifest) + push * 0.08)))
    hw = max(4, int(hh * mira.width / max(1, mira.height)))
    sprite = _resized(mira, hw, hh, "mira")
    bob = -2 if (held // 8) % 2 == 0 else 0
    fx_pos = int(w * 0.58 - hw * 0.42)
    fy = int(h * 0.80 - hh + bob)
    shadow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(shadow)
    draw.ellipse((fx_pos + hw * 0.18, fy + hh - 16, fx_pos + hw * 0.78, fy + hh + 10), fill=(24, 16, 12, 100))
    base.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(5)))
    base.alpha_composite(sprite, (fx_pos, fy))
    _paste(base, pack["ridge"], 1.24 + push * 0.20, -push * w * 0.03, h * 0.015, "bottom", "ridge")
    lantern = pack["lantern"]
    lx = fx_pos + hw * float(lantern.get("x", 0.16))
    ly = fy + hh * float(lantern.get("y", 0.58))
    flicker = 0.85 + 0.15 * np.sin(held * 0.7)
    glow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    for rad, col in (
        (int(78 * flicker), (255, 176, 70, int(40 * flicker))),
        (int(34 * flicker), (255, 200, 120, int(80 * flicker))),
        (max(4, int(12 * flicker)), (255, 236, 190, int(160 * flicker))),
    ):
        gd.ellipse((lx - rad, ly - rad, lx + rad, ly + rad), fill=col)
    base = _screen(base, glow.filter(ImageFilter.GaussianBlur(6)))
    rgb = np.asarray(base.convert("RGB")).astype(np.float32)
    if "vignette" in fx or not fx:
        yy, xx = np.mgrid[0:h, 0:w]
        nx = (xx - w / 2) / (w * 0.72)
        ny = (yy - h / 2) / (h * 0.72)
        shade = 1.0 - np.clip((nx * nx + ny * ny - 0.35) / 1.3, 0, 1) * 0.42
        rgb *= shade[:, :, None]
    if "film_grain" in fx:
        rng = np.random.default_rng(held)
        tile = rng.integers(-12, 13, size=(48, 48, 1), dtype=np.int16)
        grain = np.tile(tile, (h // 48 + 1, w // 48 + 1, 1))[:h, :w]
        rgb = np.clip(rgb + grain, 0, 255)
    return Image.fromarray(rgb.astype(np.uint8), "RGB")


def _paint_fallback(manifest: dict, frame: int) -> Image.Image:
    res = manifest.get("resolution") or [960, 540]
    w, h = int(res[0]), int(res[1])
    push = push_amount(frame, manifest)
    image = Image.new("RGB", (w, h), (49, 58, 92))
    draw = ImageDraw.Draw(image)
    for y in range(h):
        mix = y / max(1, h)
        draw.line([(0, y), (w, y)], fill=(int(49 + 190 * mix), int(58 + 140 * mix), int(92 + 60 * mix)))
    ridge = int(h * (0.62 - push * 0.04))
    draw.polygon(
        [(0, h), (0, ridge), (int(w * 0.3), ridge - 30), (int(w * 0.6), ridge + 10), (w, ridge - 20), (w, h)],
        fill=(46, 78, 68),
    )
    cx = int(w * 0.58 + push * 20)
    ground = int(h * 0.78)
    draw.polygon([(cx, ground - 90), (cx + 36, ground), (cx - 36, ground)], fill=(28, 58, 48))
    draw.ellipse((cx - 16, ground - 120, cx + 16, ground - 88), fill=(232, 196, 160))
    return image


def render_shot(manifest: dict, out_dir: Path) -> int:
    """Write 1-based PNG frames. Held frames are byte copies. Returns the count."""
    out_dir.mkdir(parents=True, exist_ok=True)
    n = int(manifest["duration_frames"])
    shoot = max(1, int(manifest.get("shoot_on") or 1))
    folder = cel_dir()
    pack = _load_pack(folder) if folder else None
    prev_held = None
    prev_file = None
    for frame in range(1, n + 1):
        target = out_dir / f"{frame:04d}.png"
        held = _held(frame, shoot)
        if held == prev_held and prev_file is not None:
            target.write_bytes(prev_file.read_bytes())
            continue
        image = _paint_cel(manifest, frame, pack) if pack else _paint_fallback(manifest, frame)
        image.save(target)
        prev_held, prev_file = held, target
    return n
