# Studio Pipeline

Original short cartoons, from a brief to a picture. The browser desk writes the episode. The Python package paints it.

The look is a xerox cel (flat color, one hard shadow, ink line) over gouache plates, shot on twos. It is original artwork for this project, not a frame from an existing film.

## How a frame is drawn

1. A shot manifest says how long the shot is, how the camera moves, and which layers exist.
2. `studio draw` checks that manifest against `schemas/shot.schema.json`.
3. Stage **S5** paints every frame. Stage **S9** encodes an mp4 when you ask for one. Both run on the RAM-capped stage graph (`stages.py`, two workers, 6000 MB).
4. If `public/media/cels/` is present, the painter composites five plates:

   | Plate | Role |
   | --- | --- |
   | `sky.jpg` | Far dusk sky |
   | `valley.png` | Mountains and village, feathered into the sky |
   | `pines.png` | Midground pines |
   | `mira.png` | Lantern keeper, keyed off green |
   | `ridge.png` | Foreground grass and stone, overlaps her feet |

5. Valley window-lights go dark on twos (`meta.json` has each light's frame). The lantern glow flickers. Nearer plates travel farther than the sky. Holds on twos are byte copies of the previous drawing.
6. If those files are missing, or `STUDIO_CELS` points somewhere without them, S5 still draws a flat fallback so the shot is never black.

The live Preview tab uses the same placement numbers (`src/lib/studio/draw.ts`). Play is the interactive draw. The player under it is a packed encode of the same lane.

Hero size comes from the `hero` layer depth. Depth 12 is the wide shot. Depth 7 is close.

## Draw a shot (what an agent calls)

From the `pipeline` directory, with `PYTHONPATH=src` (pytest sets this; a shell must too):

```text
python -m studio draw
python -m studio draw examples/ep01_s001.json --out ./vault/EP01_S001
python -m studio draw examples/ep01_s001.json --out ./vault/EP01_S001 --mp4 ./deliverables/EP01_S001.mp4
```

No path uses the bundled establishing shot. The command prints JSON:

```json
{ "ok": true, "lane": "painted", "frames": 96, "mp4": "..." }
```

Frames are `0001.png` … and are 1-based. Exit is non-zero if the schema, the paint, or ffmpeg fails.

`python -m studio smoke` paints a 5 second sample and encodes `deliverables/SMOKE/smoke.mp4` under `STUDIO_ROOT`.

## Dependencies

Install once:

```text
python -m pip install pillow pyyaml jsonschema numpy pytest
```

| Package | Why |
| --- | --- |
| pillow | Paint and composite the plates |
| numpy | Light extinction, lantern screen, grain |
| pyyaml | `config/tools.yaml` |
| jsonschema | Shot manifest check before a draw |
| pytest | `python -m pytest` from `pipeline/` |

FFmpeg is the encoder (`ffmpeg` on PATH). Blender, OpenToonz, Synfig, and ArtCraft are optional. `python -m studio doctor` prints what is missing. The draw does not need them.

Windows setup, including the study clones, is `scripts/install_windows.ps1`. Confirm each installer before you run it.

## DeepSeek

The desk writes beats and the shot list with **DeepSeek-V4.1-Flash-1017**. The API id is `deepseek-flash` at `https://api.deepseek.com`. Thinking is off so the reply stays JSON.

The key stays in the browser (this device only). The controller can store one with:

```text
python -m studio save-key <paste-from-platform.deepseek.com>
python -m studio model
```

`model` prints the id and whether a key exists. It does not print the key. Do not commit `vault/.secrets.json`.

## Browser desk

Brief writes the episode. Board checks the frame sum (shots must land within 3% of the target length). Preview plays the painted multiplane and can measure a palette off the frame you are looking at. Key stores the API key. Setup lists tools.

The house draft is an 8 second original episode (192 frames at 24 fps). Loading it again replaces a previous house draft so the painted shot is the one on screen.
