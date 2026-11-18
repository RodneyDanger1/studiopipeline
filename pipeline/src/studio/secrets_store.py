"""Persistent DeepSeek key for the local controller.

The key lives in the process environment or in vault/.secrets.json (mode 0600).
It is never printed. The web desk stores its own copy in the browser and does
not write this file.
"""

from __future__ import annotations

import json
import os
import stat
from pathlib import Path

from .config import root

MODEL_ID = "deepseek-flash"
MODEL_VERSION = "DeepSeek-V4.1-Flash-1017"
BASE_URL = "https://api.deepseek.com"


def secrets_path() -> Path:
    override = os.environ.get("STUDIO_SECRETS")
    if override:
        return Path(override)
    return root() / "vault" / ".secrets.json"


def load_key() -> str:
    for name in ("DEEPSEEK_API_KEY", "LLM_API_KEY"):
        value = os.environ.get(name, "").strip()
        if value:
            return value
    path = secrets_path()
    if not path.exists():
        return ""
    data = json.loads(path.read_text(encoding="utf-8"))
    return str(data.get("deepseek_api_key", "")).strip()


def save_key(key: str) -> Path:
    cleaned = key.strip()
    if len(cleaned) < 20 or any(ch.isspace() for ch in cleaned):
        raise ValueError("refusing to store a key that does not look real")
    path = secrets_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "deepseek_api_key": cleaned,
        "llm_base_url": BASE_URL,
        "llm_model": MODEL_ID,
        "llm_model_version": MODEL_VERSION,
    }
    path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    try:
        path.chmod(stat.S_IRUSR | stat.S_IWUSR)
    except OSError:
        pass
    return path


def public_config() -> dict:
    return {
        "base_url": os.environ.get("LLM_BASE_URL", BASE_URL),
        "model": os.environ.get("LLM_MODEL", MODEL_ID),
        "version": MODEL_VERSION,
        "key_saved": bool(load_key()),
        "thinking": "disabled for JSON stages",
        "price_in_per_m_peak": 0.30,
        "price_out_per_m_peak": 1.20,
        "price_cache_hit_per_m": 0.006,
    }
