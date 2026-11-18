import json
from pathlib import Path

import pytest

from studio.paint import draw_shot
from studio.tools.pillow_plane import cel_dir, render_shot


def _shot(frames=4, w=160, h=90):
    return {
        "shot_id": "EP01_S001",
        "episode": 1,
        "lane": "blender_2p5d",
        "fps": 24,
        "resolution": [w, h],
        "duration_frames": frames,
        "shoot_on": 2,
        "camera": {"move": "dolly_in", "start_z": 10.5, "end_z": 7.0, "ease": "ease_in"},
        "layers": [
            {"name": "sky", "image": "assets/sky.png", "depth": 40},
            {"name": "hero", "image": "assets/hero.png", "depth": 12},
        ],
        "fx": ["vignette"],
        "dialogue": [],
        "notes": "test",
    }


def test_painted_cels_are_on_disk():
    folder = cel_dir()
    assert folder is not None
    for name in ("sky.jpg", "valley.png", "pines.png", "ridge.png", "mira.png", "meta.json"):
        assert (folder / name).is_file(), name


def test_render_holds_on_twos(tmp_path: Path):
    out = tmp_path / "frames"
    count = render_shot(_shot(), out)
    assert count == 4
    first = (out / "0001.png").read_bytes()
    assert first == (out / "0002.png").read_bytes()
    assert first != (out / "0003.png").read_bytes()
    assert (out / "0003.png").stat().st_size > 500


def test_draw_runs_the_stage_graph(tmp_path: Path):
    shot = tmp_path / "shot.json"
    shot.write_text(json.dumps(_shot()), encoding="utf-8")
    report = draw_shot(shot, tmp_path / "out")
    assert report["ok"] is True
    assert report["frames"] == 4
    assert report["lane"] == "painted"
    assert (tmp_path / "out" / "0004.png").is_file()


def test_missing_cel_override_falls_back(tmp_path: Path, monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setenv("STUDIO_CELS", str(tmp_path / "missing"))
    assert cel_dir() is None
    count = render_shot(_shot(), tmp_path / "frames")
    assert count == 4
    assert (tmp_path / "frames" / "0001.png").stat().st_size > 200
