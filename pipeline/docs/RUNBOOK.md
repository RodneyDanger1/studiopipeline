# Runbook

## Browser desk

Open the studio. Paste a DeepSeek API key in Key and choose Save and check key. Write with DeepSeek from Brief. Play a shot in Preview. The picture is the painted multiplane (gouache plates plus the xerox cel). Measure look writes a palette from that frame.

The packed sample under the preview is the same painter, encoded with FFmpeg.

## Draw from the controller

```text
cd pipeline
python -m pip install pillow pyyaml jsonschema numpy pytest
set PYTHONPATH=src
set STUDIO_ROOT=C:\Studio
python -m studio draw examples\ep01_s001.json --out C:\Studio\vault\EP01_S001 --mp4 C:\Studio\deliverables\EP01_S001.mp4
```

`draw` prints JSON and exits non-zero on a bad manifest or a failed encode. `python -m studio smoke` is the 5 second sample.

Plates are read from `public/media/cels`. Point `STUDIO_CELS` at another folder with the same filenames if you replace them. An empty override falls back to a flat drawing so a missing PNG cannot black the shot out.

## Dependencies

pillow, numpy, pyyaml, jsonschema, pytest. FFmpeg on PATH to encode. Blender and ArtCraft are optional; doctor lists them.

## If DeepSeek rejects the call

401 means the key is wrong. 402 means the account needs credit. 429 means wait. A schema failure is retried up to three times with the validator text, then reported. The call stops when the episode budget is spent.
