import json
from pathlib import Path

import jsonschema
import pytest


def test_shot_schema_rejects_bad_id():
    schema = json.loads(Path("schemas/shot.schema.json").read_text(encoding="utf-8"))
    good = {
        "shot_id": "EP01_S001",
        "episode": 1,
        "lane": "blender_2p5d",
        "fps": 24,
        "resolution": [960, 540],
        "duration_frames": 48,
        "layers": [{"name": "sky", "image": "assets/sky.png", "depth": 40}],
    }
    jsonschema.validate(good, schema)
    bad = dict(good)
    bad["shot_id"] = "shot-1"
    with pytest.raises(jsonschema.ValidationError):
        jsonschema.validate(bad, schema)
