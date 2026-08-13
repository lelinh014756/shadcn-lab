#!/usr/bin/env python3
"""Log user's scope overrides để skill tự cải thiện theo thời gian.

Usage:
  echo 'files...' | update_scope_cache.py <detected> <user_override>

Behavior:
- Read file paths từ stdin
- Record: {ts, files, detected, override} → scope-cache.jsonl
- Aggregate: nếu 1 pattern → same override ≥3 lần, đề xuất update scope-mappings.project.json
"""

import json
import sys
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

CACHE_FILE = Path(__file__).parent.parent / "scope-cache.jsonl"
SUGGEST_THRESHOLD = 3


def load_entries() -> list[dict]:
    if not CACHE_FILE.exists():
        return []
    with open(CACHE_FILE, encoding="utf-8") as f:
        return [json.loads(line) for line in f if line.strip()]


def append_entry(entry: dict) -> None:
    CACHE_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(CACHE_FILE, "a", encoding="utf-8") as f:
        f.write(json.dumps(entry, ensure_ascii=False) + "\n")


def aggregate_suggestions(entries: list[dict]) -> list[tuple[str, str, int]]:
    """Return [(path_fragment, override_scope, count)] reaching threshold."""
    pairs: Counter = Counter()
    for e in entries:
        for f in e.get("files", []):
            head = "/".join(f.split("/")[:3])
            pairs[(head, e["override"])] += 1
    return [
        (frag, scope, cnt)
        for (frag, scope), cnt in pairs.items()
        if cnt >= SUGGEST_THRESHOLD
    ]


def main() -> None:
    if len(sys.argv) < 3:
        sys.exit("Usage: update_scope_cache.py <detected> <override>")

    detected, override = sys.argv[1], sys.argv[2]
    files = [line.strip() for line in sys.stdin if line.strip()]
    if not files:
        sys.exit("No files from stdin")

    entry = {
        "ts": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "files": files,
        "detected": detected,
        "override": override,
    }
    append_entry(entry)

    suggestions = aggregate_suggestions(load_entries())
    if suggestions:
        print("=== Scope mapping suggestions ===")
        for frag, scope, cnt in suggestions:
            print(f'  "{frag}" → {scope} (seen {cnt}x) — consider adding to mappings')


if __name__ == "__main__":
    main()
