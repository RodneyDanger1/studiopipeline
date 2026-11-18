# Assumptions

- DeepSeek-V4.1-Flash-1017 is called as `deepseek-flash`. "1017" is the model version from the 17 October 2026 update, not an API key. No key was supplied, so none is stored in the repo.
- The browser desk keeps the key in local storage on this device. The CLI keeps it in `vault/.secrets.json` or `DEEPSEEK_API_KEY`. There is no `.env` file, because this host must not carry one.
- JSON stages disable thinking so replies stay structured and cheaper. A thinking trace is not required for a shot list.
- The budget meter uses peak prices ($0.30 in, $1.20 out per million). Off-peak is cheaper; the meter is conservative. Cache-hit input is priced at $0.006 when the API reports it.
- This preview machine is Linux with FFmpeg and no Blender, OpenToonz, Synfig, or ArtCraft. The smoke path is Pillow multiplane plus FFmpeg. That is an intentional fallback, not a claim those apps ran.
- The Windows install sheet is documentation. It was not executed here. winget ids should be rechecked with `winget search` on the OptiPlex.
- The CLI uses argparse instead of Typer so the controller does not need another package.
- Style measurement in the Python package uses Pillow so it runs without OpenCV. The browser desk measures the live canvas the same way: original frames only.
- One heavy stage at a time, and at most two workers, with a 6000 MB combined budget.
- Characters are original. The house draft is Mira, a lantern keeper. It is not a model response and it is labeled as such.
