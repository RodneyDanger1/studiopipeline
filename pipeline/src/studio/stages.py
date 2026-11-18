from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass
from graphlib import TopologicalSorter
from typing import Callable

BUDGET_MB = 6000
MAX_WORKERS = 2


@dataclass
class Stage:
    name: str
    fn: Callable[[bool], str]
    deps: tuple = ()
    ram_mb: int = 500


def run_graph(stages: dict, only=None, force=False):
    if only:
        need, todo = set(), [only]
        while todo:
            name = todo.pop()
            if name not in need:
                need.add(name)
                todo += list(stages[name].deps)
        stages = {name: stage for name, stage in stages.items() if name in need}
    sorter = TopologicalSorter({name: set(stage.deps) for name, stage in stages.items()})
    sorter.prepare()
    pending, futures, used = [], {}, 0
    with ThreadPoolExecutor(MAX_WORKERS) as pool:
        while sorter.is_active():
            pending += list(sorter.get_ready())
            for name in list(pending):
                stage = stages[name]
                if len(futures) < MAX_WORKERS and (used + stage.ram_mb <= BUDGET_MB or not futures):
                    pending.remove(name)
                    used += stage.ram_mb
                    futures[pool.submit(stage.fn, force)] = name
            if not futures:
                break
            done = next(as_completed(list(futures)))
            name = futures.pop(done)
            used -= stages[name].ram_mb
            done.result()
            sorter.done(name)
