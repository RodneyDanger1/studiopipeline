import logging
import subprocess
import time
from pathlib import Path

from .cache import is_fresh, mark, stage_key
from .config import root

log = logging.getLogger("studio")


def inside(path) -> bool:
    return Path(path).resolve().is_relative_to(root())


def redact(text: str) -> str:
    out = []
    for token in str(text).split():
        if token.startswith("sk-") or "API_KEY=" in token or token.startswith("Bearer"):
            out.append("••••")
        else:
            out.append(token)
    return " ".join(out)


def run(cmd, cwd=None, timeout=600, env=None):
    if not isinstance(cmd, (list, tuple)):
        raise TypeError("cmd must be a list, never a shell string")
    if cwd is not None and not inside(cwd):
        raise PermissionError(f"cwd outside {root()}: {cwd}")
    for part in cmd:
        text = str(part)
        if any(ord(ch) < 32 for ch in text):
            raise ValueError("refusing a command argument with control characters")
    started = time.time()
    log.info("RUN %s", redact(cmd))
    result = subprocess.run(
        [str(part) for part in cmd],
        cwd=cwd,
        env=env,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        timeout=timeout,
    )
    log.info("EXIT %s in %.1fs", result.returncode, time.time() - started)
    if result.returncode != 0:
        raise RuntimeError(f"{cmd[0]} failed ({result.returncode}): {redact(result.stderr[-2000:])}")
    return result


def run_stage(name, cmd, inputs, outputs, fallback=None, force=False, tool_version="", **kwargs):
    key = stage_key(cmd, inputs, tool_version=tool_version)
    if not force and is_fresh(name, key, outputs):
        log.info("SKIP %s (unchanged)", name)
        return "skipped"
    try:
        run(cmd, **kwargs)
    except Exception as exc:
        if not fallback:
            raise
        log.warning("PRIMARY failed for %s: %s; running fallback", name, exc)
        run(fallback, **kwargs)
    missing = [item for item in outputs if not Path(item).exists()]
    if missing:
        raise RuntimeError(f"{name}: missing outputs {missing}")
    mark(name, key)
    return "ran"
