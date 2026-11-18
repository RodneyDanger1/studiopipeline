import json

import pytest

from studio.llm import llm_json, spend_so_far


def test_retry_then_accept(monkeypatch, tmp_path):
    monkeypatch.setenv("STUDIO_ROOT", str(tmp_path))
    monkeypatch.setenv("DEEPSEEK_API_KEY", "sk-test-key-not-real-000000")
    calls = {"n": 0}

    def post(base, key, model, messages, max_tokens):
        calls["n"] += 1
        if calls["n"] == 1:
            content = "nope"
        else:
            content = json.dumps({"title": "Ok"})
        return {
            "choices": [{"message": {"content": content}}],
            "usage": {"prompt_tokens": 10, "completion_tokens": 4},
        }

    obj = llm_json("hi", {"type": "object", "required": ["title"]}, post=post)
    assert obj["title"] == "Ok"
    assert calls["n"] == 2


def test_invalid_raises(monkeypatch, tmp_path):
    monkeypatch.setenv("STUDIO_ROOT", str(tmp_path))
    monkeypatch.setenv("DEEPSEEK_API_KEY", "sk-test-key-not-real-000000")

    def post(base, key, model, messages, max_tokens):
        return {"choices": [{"message": {"content": "nope"}}], "usage": {}}

    with pytest.raises(RuntimeError):
        llm_json("hi", {"type": "object", "required": ["title"]}, post=post, retries=2)


def test_budget_blocks(monkeypatch, tmp_path):
    monkeypatch.setenv("STUDIO_ROOT", str(tmp_path))
    monkeypatch.setenv("EPISODE_BUDGET_USD", "1")
    monkeypatch.setenv("DEEPSEEK_API_KEY", "sk-test-key-not-real-000000")
    path = tmp_path / "vault" / "90_Logs"
    path.mkdir(parents=True)
    (path / "cost.csv").write_text("ts,model,prompt_tokens,completion_tokens,usd\n1,m,1,1,2.5\n", encoding="utf-8")
    assert spend_so_far() >= 1
    with pytest.raises(RuntimeError):
        llm_json("hi", {"type": "object", "required": ["title"]}, post=lambda *a, **k: {})
