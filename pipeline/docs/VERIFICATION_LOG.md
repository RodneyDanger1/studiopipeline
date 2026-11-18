# Verification log

| date | tool | what I checked | URL or command | result | action |
| --- | --- | --- | --- | --- | --- |
| 2026-11-11 | DeepSeek | Model id and version | https://api-docs.deepseek.com/quick_start/pricing/ | `deepseek-flash` serves DeepSeek-V4.1-Flash-1017. Peak $0.30 / $1.20 per 1M. Cache hit $0.006. Vision on. JSON output on. | Wired `deepseek-flash`. Did not invent a key. |
| 2026-11-11 | DeepSeek | Thinking switch | https://api-docs.deepseek.com/guides/thinking_mode | Disable with `thinking.type = disabled`. Temperature is not a supported knob. | JSON stages send thinking disabled and no temperature. |
| 2026-11-11 | DeepSeek | First call | https://api-docs.deepseek.com/ | Base URL `https://api.deepseek.com`, OpenAI-compatible chat completions. | Used that base URL. |
| 2026-11-11 | FFmpeg | Present in this environment | `ffmpeg -version` | ffmpeg 7.0.2-static | Used for the smoke encode. |
| 2026-11-11 | Blender | Present? | `which blender` | Not installed | Pillow multiplane is the proven fallback. |
| 2026-11-11 | OpenToonz | CLI names | Prompt plus published tool list `tcomposer`, `tcleanup`, `tconverter` | Not installed here, so `--help` was not run | Marked MISSING. Wrapper stays chunked at 12 frames. |
| 2026-11-11 | Synfig | Flags `-t -w -h --fps --begin-time --end-time` | Synfig CLI docs cited in the blueprint, addendum 15 | Binary not on PATH | Did not invent a local flag. Fallback is the 2.5D lane. |
| 2026-11-11 | Pencil2D | `--export` / `-o` | Blueprint addendum 15, man page 0.6.6 | Binary not on PATH | UNAVAILABLE until a Windows install. |
| 2026-11-11 | ArtCraft | effectcraft / filmcraft CLIs | getartcraft.com and github.com/storytold | Not installed | UNAVAILABLE. Composite falls back to multiplane + FFmpeg. |
| 2026-11-11 | YouTube | Delivery numbers | https://support.google.com/youtube/answer/1722171 and answer/6039858 and answer/15424877 | 1080p H.264, -14 LUFS, Shorts up to 180s vertical | Written into platform_specs.yaml with the URLs. |
