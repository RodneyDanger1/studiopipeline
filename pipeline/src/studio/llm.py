"""DeepSeek V4.1 Flash 1017 client. JSON stages disable thinking.

Verified 2026-11-11:
- base https://api.deepseek.com
- model id deepseek-flash
- served version DeepSeek-V4.1-Flash-1017
- thinking off: {"thinking": {"type": "disabled"}}
- peak price $0.30 / $1.20 per 1M input / output tokens
Docs: https://api-docs.deepseek.com/
"""

from __future__ import annotations

import csv
import json
import os
import time
import urllib.request
from pathlib import Path

from .config import root
from .secrets_store import BASE_URL, MODEL_ID, load_key

PRICE_IN = float(os.environ.get("LLM_PRICE_IN_PER_M", "0.30"))
PRICE_OUT = float(os.environ.get("LLM_PRICE_OUT_PER_M", "1.20"))
PRICE_HIT = float(os.environ.get("LLM_PRICE_CACHE_HIT_PER_M", "0.006"))


def _cost_csv() -> Path:
    return root() / "vault" / "90_Logs" / "cost.csv"


def usd_for(usage: dict) -> float:
    hit = int(usage.get("prompt_cache_hit_tokens") or 0)
    prompt = int(usage.get("prompt_tokens") or 0)
    miss = int(usage.get("prompt_cache_miss_tokens") or max(0, prompt - hit))
    out = int(usage.get("completion_tokens") or 0)
    return miss * PRICE_IN / 1e6 + hit * PRICE_HIT / 1e6 + out * PRICE_OUT / 1e6


def spend_so_far() -> float:
    path = _cost_csv()
    if not path.exists():
        return 0.0
    with path.open(encoding="utf-8") as handle:
        return sum(float(row["usd"]) for row in csv.DictReader(handle))


def _log(model: str, usage: dict) -> None:
    path = _cost_csv()
    path.parent.mkdir(parents=True, exist_ok=True)
    new = not path.exists()
    with path.open("a", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        if new:
            writer.writerow(["ts", "model", "prompt_tokens", "completion_tokens", "usd"])
        writer.writerow(
            [
                int(time.time()),
                model,
                usage.get("prompt_tokens", 0),
                usage.get("completion_tokens", 0),
                round(usd_for(usage), 6),
            ]
        )


def llm_json(prompt: str, schema: dict, system: str = "Return only valid JSON, no prose.", retries: int = 3, max_tokens: int = 4000, post=None):
    budget = float(os.environ.get("EPISODE_BUDGET_USD", "0") or 0)
    if budget and spend_so_far() >= budget:
        raise RuntimeError("episode budget exhausted; stop and report")
    key = load_key()
    if not key:
        raise RuntimeError("no DeepSeek API key saved. Set DEEPSEEK_API_KEY or run studio save-key")
    model = os.environ.get("LLM_MODEL", MODEL_ID)
    base = os.environ.get("LLM_BASE_URL", BASE_URL).rstrip("/")
    messages = [
        {"role": "system", "content": system + " The JSON must satisfy this schema: " + json.dumps(schema)},
        {"role": "user", "content": prompt},
    ]
    last = "no response"
    sender = post or _post
    for _ in range(retries):
        payload = sender(base, key, model, messages, max_tokens)
        text = payload["choices"][0]["message"].get("content") or ""
        usage = payload.get("usage") or {}
        _log(model, usage)
        try:
            obj = json.loads(text)
            _require_schema(obj, schema)
            return obj
        except (json.JSONDecodeError, ValueError) as exc:
            last = str(exc)[:500]
            messages += [
                {"role": "assistant", "content": text},
                {"role": "user", "content": f"That failed validation: {last}. Return corrected JSON only."},
            ]
    raise RuntimeError(f"model output failed the schema after {retries} tries: {last}")


def _post(base: str, key: str, model: str, messages, max_tokens: int) -> dict:
    body = json.dumps(
        {
            "model": model,
            "messages": messages,
            "max_tokens": max_tokens,
            "thinking": {"type": "disabled"},
            "response_format": {"type": "json_object"},
            "stream": False,
        }
    ).encode()
    request = urllib.request.Request(
        f"{base}/chat/completions",
        data=body,
        headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=120) as response:
        return json.loads(response.read().decode())


def _require_schema(obj, schema: dict) -> None:
    if schema.get("type") == "object":
        if not isinstance(obj, dict):
            raise ValueError("expected an object")
        for name in schema.get("required", []):
            if name not in obj:
                raise ValueError(f"missing {name}")
    try:
        import jsonschema

        jsonschema.validate(obj, schema)
    except ImportError:
        return
    except Exception as exc:
        raise ValueError(str(exc)[:500]) from exc
