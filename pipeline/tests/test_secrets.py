from studio.secrets_store import load_key, public_config, save_key


def test_round_trip_hides_key(tmp_path, monkeypatch):
    path = tmp_path / "secrets.json"
    monkeypatch.setenv("STUDIO_SECRETS", str(path))
    monkeypatch.delenv("DEEPSEEK_API_KEY", raising=False)
    monkeypatch.delenv("LLM_API_KEY", raising=False)
    save_key("sk-test-key-not-real-000000")
    assert load_key() == "sk-test-key-not-real-000000"
    shown = public_config()
    assert shown["model"] == "deepseek-flash"
    assert shown["version"] == "DeepSeek-V4.1-Flash-1017"
    assert shown["key_saved"] is True
    blob = str(shown)
    assert "sk-test" not in blob
