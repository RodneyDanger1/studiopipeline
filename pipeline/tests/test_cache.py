from studio.cache import is_fresh, mark, stage_key


def test_key_changes_with_input(tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)
    target = tmp_path / "a.txt"
    target.write_text("one")
    first = stage_key(["x"], [target])
    target.write_text("two!")
    assert stage_key(["x"], [target]) != first


def test_fresh_after_mark(tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)
    target = tmp_path / "a.txt"
    target.write_text("one")
    output = tmp_path / "out.txt"
    output.write_text("o")
    key = stage_key(["x"], [target])
    assert not is_fresh("s", key, [output])
    mark("s", key)
    assert is_fresh("s", key, [output])


def test_tool_version_busts_cache(tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)
    target = tmp_path / "a.txt"
    target.write_text("one")
    assert stage_key(["x"], [target], "1") != stage_key(["x"], [target], "2")
