#!/usr/bin/env python3
"""Smart diff-aware split detection.

Classifies staged files để group commit intelligently:
- generated: auto-generated files → force `chore`
- rename_only: pure renames → group riêng
- whitespace_only: formatting-only changes → `style`/`chore`
- substantive: real code changes → follow normal split logic
"""

import re
import subprocess
import sys
from pathlib import Path

GENERATED_PATTERNS = [
    r"\.g\.cs$",
    r"\.Designer\.cs$",
    r"/Migrations/",
    r"/obj/",
    r"/bin/",
    r"package-lock\.json$",
    r"yarn\.lock$",
    r"pnpm-lock\.yaml$",
    r"\.lock$",
    r"/node_modules/",
]

GENERATED_RE = re.compile("|".join(GENERATED_PATTERNS))


def git(*args: str) -> str:
    """Run git command, return stdout stripped."""
    result = subprocess.run(
        ["git", *args], capture_output=True, text=True, encoding="utf-8"
    )
    return result.stdout.strip()


def is_generated(path: str) -> bool:
    return bool(GENERATED_RE.search(path))


def is_rename_only(path: str) -> bool:
    """Check if file is staged as rename with no content change."""
    status = git("diff", "--cached", "--name-status", "--", path)
    if not status:
        return False
    parts = status.split("\t")
    if len(parts) >= 3 and parts[0].startswith("R"):
        similarity = int(re.sub(r"\D", "", parts[0]) or "0")
        return similarity == 100
    return False


def is_whitespace_only(path: str) -> bool:
    """File has diff but only whitespace changes."""
    full_diff = git("diff", "--cached", "--", path)
    if not full_diff:
        return False
    ignore_ws = git("diff", "--cached", "--ignore-all-space", "--", path)
    return bool(full_diff) and not bool(ignore_ws)


def classify(path: str) -> str:
    if is_generated(path):
        return "generated"
    if is_rename_only(path):
        return "rename_only"
    if is_whitespace_only(path):
        return "whitespace_only"
    return "substantive"


def main() -> None:
    files = git("diff", "--cached", "--name-only").splitlines()
    if not files:
        return

    groups: dict[str, list[str]] = {
        "generated": [],
        "rename_only": [],
        "whitespace_only": [],
        "substantive": [],
    }
    for path in files:
        groups[classify(path)].append(path)

    for category, paths in groups.items():
        if paths:
            print(f"[{category}]")
            for p in paths:
                print(f"  {p}")


if __name__ == "__main__":
    main()
