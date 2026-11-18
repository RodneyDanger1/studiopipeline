"""Snap a frame to a hex palette. Nearest RGB, one frame at a time."""

from PIL import Image


def quantize_to_palette(image: Image.Image, hexes: list[str]) -> Image.Image:
    palette = []
    for hex_color in hexes:
        h = hex_color.lstrip("#")
        palette.append(tuple(int(h[i : i + 2], 16) for i in (0, 2, 4)))
    if not palette:
        return image
    out = image.convert("RGB").copy()
    pix = out.load()
    w, h = out.size
    for y in range(h):
        for x in range(w):
            r, g, b = pix[x, y]
            best = min(palette, key=lambda c: (c[0] - r) ** 2 + (c[1] - g) ** 2 + (c[2] - b) ** 2)
            pix[x, y] = best
    return out
