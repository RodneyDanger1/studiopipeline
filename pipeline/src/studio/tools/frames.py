import re
import shutil
from pathlib import Path


def normalize_frames(src_dir: Path, dst_dir: Path, first: int = 1) -> int:
    dst_dir.mkdir(parents=True, exist_ok=True)
    items = []
    for path in Path(src_dir).glob("*.png"):
        match = re.search(r"(\d+)\.png$", path.name)
        if match:
            items.append((int(match.group(1)), path))
    items.sort()
    for index, (_, path) in enumerate(items, start=first):
        shutil.copyfile(path, dst_dir / f"{index:04d}.png")
    return len(items)
