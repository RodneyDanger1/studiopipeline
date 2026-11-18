# Architecture

Stages are a directed graph. Each stage is skipped when the hash of its command, tool version, and inputs still matches and the outputs exist.

```text
brief
  S0 story          DeepSeek V4.1 Flash 1017, JSON, thinking off
  S1 shot manifest  schema plus frame-sum check
  S2 assets         painted cels in public/media/cels (flat fallback if missing)
  S3 style spec     measure frames you have rights to
  S4 prep           palette lock
  S5 animation      studio draw, Pillow multiplane, same layout as the preview
  S6 ink            palette quantize
  S7 comp           EffectCraft, else the preview lane
  S8 voice          Rhubarb when installed, else timed lines
  S9 edit           FilmCraft, else FFmpeg concat
  S10 mix           SoundCraft, else loudnorm
  S11 QC            ffprobe against platform_specs.yaml
  S12 deliver       files only, a person uploads
```

The browser desk runs S0, S1, the preview lane, and a live style measure. The Python package runs the cache, the doctor, and the fallback smoke encode.

External commands are argument lists. The runner refuses a shell string and refuses a working directory outside `STUDIO_ROOT` (default `C:/Studio`).
