# Studio Pipeline

A desk for original short cartoons. You write a brief. The preview plays a painted multiplane of that shot: xerox cel, gouache ridge, valley lights going out, held on twos.

## Play it

Open the desk. Preview is EP01_S001 already. Press Play shot. The valley windows go dark, the lantern flickers, and the ridge moves more than the sky. Measure look reads the palette off the frame you are on.

Paste a DeepSeek key under Key, then Write with DeepSeek on Brief if you want a new episode. The key stays in this browser. The model is DeepSeek-V4.1-Flash-1017 (`deepseek-flash`).

Load house draft puts the original 8 second episode back.

## How drawing works

The preview and the Python painter share one layout.

Painted plates live in `public/media/cels/` (`sky.jpg`, `valley.png`, `pines.png`, `mira.png`, `ridge.png`, `meta.json`). The canvas composites them. An agent on the controller runs the same composite:

```text
cd pipeline
python -m pip install pillow pyyaml jsonschema numpy pytest
PYTHONPATH=src python -m studio draw examples/ep01_s001.json --out ./vault/EP01_S001 --mp4 ./deliverables/EP01_S001.mp4
```

That command checks the shot schema, runs stage S5 (paint) and S9 (encode) on the stage graph, and prints JSON. Details, the dependency table, and the Windows install sheet are in [pipeline/README.md](pipeline/README.md).

If the plates are missing, the painter still emits a flat frame instead of failing closed.
