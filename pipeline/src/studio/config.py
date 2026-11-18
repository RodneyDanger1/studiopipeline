import os
import shutil
from pathlib import Path

import yaml

PACKAGE_ROOT = Path(__file__).resolve().parents[2]


def root() -> Path:
    return Path(os.environ.get("STUDIO_ROOT", "C:/Studio")).resolve()


def config_dir() -> Path:
    override = os.environ.get("STUDIO_CONFIG")
    if override:
        return Path(override)
    return PACKAGE_ROOT / "config"


def load_config(name: str = "tools.yaml") -> dict:
    path = config_dir() / name
    if not path.exists():
        raise FileNotFoundError(f"missing config file: {path}")
    return yaml.safe_load(path.read_text(encoding="utf-8")) or {}


def tool_entry(key: str) -> dict:
    tools = load_config().get("tools", {})
    if key not in tools:
        raise KeyError(f"tool '{key}' not in config/tools.yaml")
    return tools[key]


def tool_path(key: str) -> str:
    exe = tool_entry(key)["exe"]
    found = shutil.which(exe) or (exe if Path(exe).exists() else None)
    if not found:
        raise FileNotFoundError(f"{key}: '{exe}' not found. Run `python -m studio doctor`.")
    return found
