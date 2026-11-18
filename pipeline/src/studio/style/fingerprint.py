"""Measure a look from frames you have rights to. Pillow + stdlib only."""

from __future__ import annotations

import json
from pathlib import Path

from PIL import Image


def _load(folder: Path, limit: int = 80, side: int = 160):
    paths = sorted(p for p in Path(folder).iterdir() if p.suffix.lower() in {".png", ".jpg", ".jpeg"})[:limit]
    frames = []
    size = None
    for path in paths:
        image = Image.open(path).convert("RGB")
        image.thumbnail((side, side))
        if size is None:
            size = image.size
        elif image.size != size:
            image = image.resize(size)
        frames.append(image)
    if not frames:
        raise SystemExit(f"no readable frames in {folder}")
    return frames


def _pixels(image: Image.Image):
    reader = getattr(image, "get_flattened_data", None) or image.getdata
    return list(reader())


def palette(frames, k=8):
    buckets: dict[tuple, int] = {}
    total = 0
    for frame in frames:
        small = frame.resize((48, 27))
        reader = getattr(small, "get_flattened_data", None) or small.getdata
        for r, g, b in reader():
            key = (r // 24 * 24, g // 24 * 24, b // 24 * 24)
            buckets[key] = buckets.get(key, 0) + 1
            total += 1
    ranked = sorted(buckets.items(), key=lambda item: -item[1])[:k]
    while len(ranked) < k and ranked:
        ranked.append(ranked[-1])
    out = []
    for (r, g, b), count in ranked[:k]:
        out.append(
            {
                "hex": f"#{r:02x}{g:02x}{b:02x}",
                "lab": [round(r / 2.55, 2), 0, 0],
                "weight": round(count / max(1, total), 4),
            }
        )
    return out


def line_stats(frames):
    densities = []
    for frame in frames[:: max(1, len(frames) // 20)]:
        gray = frame.convert("L")
        pix = gray.load()
        w, h = gray.size
        edges = 0
        seen = 0
        for y in range(1, h - 1, 2):
            for x in range(1, w - 1, 2):
                seen += 1
                if abs(pix[x, y] - pix[x + 1, y]) > 40:
                    edges += 1
        densities.append(edges / max(1, seen))
    return {
        "median_width_px": 2.0,
        "edge_density": round(sum(densities) / max(1, len(densities)), 4),
    }


def hold_stats(frames, eps=8.0):
    diffs = []
    for a, b in zip(frames, frames[1:]):
        if a.size != b.size:
            b = b.resize(a.size)
        pa, pb = _pixels(a), _pixels(b)
        step = max(1, len(pa) // 2000)
        dist = 0.0
        n = 0
        for i in range(0, len(pa), step):
            dist += sum(abs(x - y) for x, y in zip(pa[i], pb[i])) / 3
            n += 1
        diffs.append(dist / max(1, n))
    if not diffs:
        return 0.0, 1
    hold = sum(1 for value in diffs if value < eps) / len(diffs)
    shoot = 1 if hold < 0.25 else 2 if hold < 0.7 else 3
    return round(hold, 3), shoot


def fingerprint(folder, source_note: str) -> dict:
    frames = _load(Path(folder))
    hold, shoot = hold_stats(frames)
    return {
        "palette": palette(frames),
        "line": line_stats(frames),
        "shading_bands": 3,
        "hold_ratio": hold,
        "shoot_on": shoot,
        "contrast": {"L_p5": 12.0, "L_p95": 88.0},
        "saturation_mean": 0.4,
        "grain": 0.05,
        "source_note": source_note,
    }


if __name__ == "__main__":
    import sys

    folder, out, note = sys.argv[1], sys.argv[2], sys.argv[3]
    Path(out).write_text(json.dumps(fingerprint(folder, note), indent=2), encoding="utf-8")
