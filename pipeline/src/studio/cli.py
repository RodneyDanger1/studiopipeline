import argparse
import json
import sys

from . import logging_setup
from .secrets_store import public_config, save_key


def app(argv=None) -> None:
    logging_setup.setup()
    parser = argparse.ArgumentParser(prog="studio", description="Studio Pipeline")
    sub = parser.add_subparsers(dest="cmd", required=True)

    sub.add_parser("doctor", help="Check tool availability")
    sub.add_parser("model", help="Show the wired DeepSeek model without printing the key")
    key = sub.add_parser("save-key", help="Store a DeepSeek API key in the vault secrets file")
    key.add_argument("key")
    smoke = sub.add_parser("smoke", help="Render the 5-second fallback sample")
    smoke.add_argument("--seconds", type=int, default=5)
    draw = sub.add_parser("draw", help="Paint a shot manifest to frames (and an mp4 if asked)")
    draw.add_argument("shot", nargs="?", help="Shot JSON. Defaults to examples/ep01_s001.json")
    draw.add_argument("--out", help="Frame directory. Default: <STUDIO_ROOT>/vault/DRAW/frames")
    draw.add_argument("--mp4", help="Also encode this mp4 path")

    args = parser.parse_args(argv)
    if args.cmd == "doctor":
        from .doctor import doctor

        raise SystemExit(doctor())
    if args.cmd == "model":
        print(json.dumps(public_config(), indent=2))
        return
    if args.cmd == "save-key":
        path = save_key(args.key)
        print(f"saved key to {path} (not printed)")
        return
    if args.cmd == "smoke":
        from .smoke import run_smoke

        run_smoke(seconds=args.seconds)
        return
    if args.cmd == "draw":
        from pathlib import Path

        from .config import root
        from .paint import default_example, draw_shot

        shot = Path(args.shot) if args.shot else default_example()
        out = Path(args.out) if args.out else root() / "vault" / "DRAW" / "frames"
        mp4 = Path(args.mp4) if args.mp4 else None
        report = draw_shot(shot, out, mp4)
        print(json.dumps(report, indent=2))
        return
    parser.error(args.cmd)


if __name__ == "__main__":
    app(sys.argv[1:])
