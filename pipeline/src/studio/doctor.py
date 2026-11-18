import json
import subprocess
from pathlib import Path

from .config import load_config, tool_path

CORE = {"ffmpeg"}


def doctor() -> int:
    tools = load_config().get("tools", {})
    versions = {}
    core_missing = 0
    for key, entry in tools.items():
        try:
            exe = tool_path(key)
            args = entry.get("version_args", ["--version"])
            result = subprocess.run(
                [exe, *args],
                capture_output=True,
                text=True,
                encoding="utf-8",
                errors="replace",
                timeout=30,
                cwd=entry.get("cwd") or None,
            )
            lines = (result.stdout or result.stderr or "").strip().splitlines()
            line = lines[0][:90] if lines else "(no output)"
            status = "OK" if result.returncode == 0 else "FALLBACK"
            print(f"{status:9} {key:12} {line}")
            versions[key] = line
            if result.returncode != 0 and key in CORE:
                core_missing += 1
        except Exception as exc:
            status = "FALLBACK" if entry.get("fallback") else "MISSING"
            print(f"{status:9} {key:12} {exc}")
            versions[key] = f"{status}: {exc}"
            if key in CORE and status == "MISSING":
                core_missing += 1
    state = Path(".studio_state")
    state.mkdir(parents=True, exist_ok=True)
    (state / "tool_versions.json").write_text(json.dumps(versions, indent=2), encoding="utf-8")
    return 1 if core_missing else 0
