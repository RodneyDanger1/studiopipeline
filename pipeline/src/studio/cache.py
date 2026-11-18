import hashlib
import json
import os
from pathlib import Path

STATE = Path(".studio_state/state.json")


def _fast_hash(path: Path) -> str:
    digest = hashlib.sha256()
    stat = path.stat()
    digest.update(f"{stat.st_size}:{stat.st_mtime_ns}".encode())
    with path.open("rb") as handle:
        if stat.st_size <= 2_097_152:
            digest.update(handle.read())
        else:
            digest.update(handle.read(1_048_576))
            handle.seek(-1_048_576, os.SEEK_END)
            digest.update(handle.read(1_048_576))
    return digest.hexdigest()


def stage_key(cmd, inputs, tool_version: str = "") -> str:
    digest = hashlib.sha256(" ".join(map(str, cmd)).encode())
    digest.update(tool_version.encode())
    files: list[Path] = []
    for raw in map(Path, inputs):
        if not raw.exists():
            raise FileNotFoundError(f"stage input missing: {raw}")
        files += [item for item in raw.rglob("*") if item.is_file()] if raw.is_dir() else [raw]
    for item in sorted(files):
        digest.update(str(item).encode())
        digest.update(_fast_hash(item).encode())
    return digest.hexdigest()


def _load() -> dict:
    return json.loads(STATE.read_text(encoding="utf-8")) if STATE.exists() else {}


def is_fresh(name: str, key: str, outputs) -> bool:
    stored = _load().get(name, {})
    return stored.get("key") == key and all(Path(item).exists() for item in outputs)


def mark(name: str, key: str) -> None:
    state = _load()
    state[name] = {"key": key}
    STATE.parent.mkdir(parents=True, exist_ok=True)
    STATE.write_text(json.dumps(state, indent=2), encoding="utf-8")
