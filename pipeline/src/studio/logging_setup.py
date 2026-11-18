import logging
import sys
from pathlib import Path

from .config import root


def setup(level=logging.INFO) -> None:
    log_dir = root() / "vault" / "90_Logs"
    try:
        log_dir.mkdir(parents=True, exist_ok=True)
        log_path = log_dir / "studio.log"
    except OSError:
        log_path = None
    fmt = logging.Formatter("%(asctime)s %(levelname)s %(name)s %(message)s")
    logger = logging.getLogger()
    logger.setLevel(level)
    for handler in list(logger.handlers):
        logger.removeHandler(handler)
    stream = logging.StreamHandler(sys.stderr)
    stream.setFormatter(fmt)
    logger.addHandler(stream)
    if log_path is not None:
        handle = logging.FileHandler(log_path, encoding="utf-8")
        handle.setFormatter(fmt)
        logger.addHandler(handle)
