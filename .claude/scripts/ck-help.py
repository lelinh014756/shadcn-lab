#!/usr/bin/env python3
"""
Backward-compatible wrapper for an-help.

Canonical implementation lives at:
  .claude/skills/an-help/scripts/ck-help.py
"""

import runpy
import sys
from pathlib import Path


def main() -> int:
    scripts_dir = (
        Path(__file__).resolve().parent.parent
        / "skills"
        / "an-help"
        / "scripts"
    )
    candidates = [
        scripts_dir / "ck-help.py",
        scripts_dir / "an-help.py",
    ]

    target = next((candidate for candidate in candidates if candidate.exists()), None)
    if target is None:
        print(
            "Error: canonical an-help script not found in expected locations: "
            f"{', '.join(str(candidate) for candidate in candidates)}",
            file=sys.stderr,
        )
        return 1

    runpy.run_path(str(target), run_name="__main__")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
