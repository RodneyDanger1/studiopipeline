import threading
import time

import pytest

from studio.stages import Stage, run_graph


def test_diamond_order():
    order = []

    def make(name, deps):
        return Stage(name, lambda force, name=name: order.append(name) or "ran", deps, ram_mb=100)

    run_graph(
        {
            "a": make("a", ()),
            "b": make("b", ("a",)),
            "c": make("c", ("a",)),
            "d": make("d", ("b", "c")),
        }
    )
    assert order[0] == "a"
    assert order[-1] == "d"
    assert set(order) == {"a", "b", "c", "d"}


def test_ram_budget_blocks_overlap():
    active = set()
    overlap = []
    lock = threading.Lock()

    def heavy(name):
        def fn(force):
            with lock:
                active.add(name)
                if len(active) > 1:
                    overlap.append(set(active))
            time.sleep(0.15)
            with lock:
                active.remove(name)
            return "ran"

        return Stage(name, fn, (), ram_mb=4000)

    run_graph({"a": heavy("a"), "b": heavy("b")})
    assert overlap == []


def test_failure_stops_downstream():
    started = []

    def bad(force):
        started.append("bad")
        raise RuntimeError("boom")

    def later(force):
        started.append("later")
        return "ran"

    with pytest.raises(RuntimeError):
        run_graph(
            {
                "bad": Stage("bad", bad, (), 100),
                "later": Stage("later", later, ("bad",), 100),
            }
        )
    assert started == ["bad"]
