import json
from pathlib import Path

from PIL import Image, ImageDraw

from studio.style.cel import quantize_to_palette
from studio.style.fingerprint import fingerprint


def _frame(color, label):
    image = Image.new("RGB", (96, 54), color)
    draw = ImageDraw.Draw(image)
    draw.rectangle((4, 4, 91, 49), outline=(10, 10, 16), width=3)
    draw.rectangle((20, 16, 40, 36), fill=label)
    return image


def test_shoot_on_twos_and_palette(tmp_path):
    colors = [(240, 210, 170), (40, 90, 70), (49, 68, 92), (201, 132, 26)]
    folder = tmp_path / "frames"
    folder.mkdir()
    index = 1
    for color in colors:
        image = _frame(color, (255, 244, 220))
        image.save(folder / f"{index:04d}.png")
        image.save(folder / f"{index + 1:04d}.png")
        index += 2
    spec = fingerprint(folder, "Synthetic frames drawn for this test. Original, no third-party picture.")
    assert spec["shoot_on"] == 2
    assert len(spec["palette"]) == 8
    schema = json.loads(Path("schemas/style_spec.schema.json").read_text(encoding="utf-8"))
    for key in schema["required"]:
        assert key in spec
    locked = quantize_to_palette(_frame((10, 10, 10), (200, 200, 200)), ["#ff0000", "#00ff00", "#0000ff"])
    allowed = {(255, 0, 0), (0, 255, 0), (0, 0, 255)}
    reader = getattr(locked, "get_flattened_data", None) or locked.getdata
    assert set(reader()) <= allowed
