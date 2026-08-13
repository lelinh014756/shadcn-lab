#!/usr/bin/env python3
"""Auto-detect commit scope from changed file paths.

Merge logic:
1. Load scope-mappings.base.json (portable core scopes)
2. Load scope-mappings.project.json nếu tồn tại (project-specific)
3. Fallback: scope-mappings.json (legacy, backward-compat)
4. Project mappings ưu tiên khi tie (business > technical)
"""

import json
import sys
from collections import Counter
from pathlib import Path

SKILL_ROOT = Path(__file__).parent.parent


def load_json(path: Path) -> dict:
    if not path.exists():
        return {"mappings": [], "_detection_rules": {}}
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def load_mappings() -> tuple[list[dict], list[str]]:
    """Return (merged_mappings, priority_order).

    Project mappings prepended → scanned first → priority khi tie.
    """
    base = load_json(SKILL_ROOT / "scope-mappings.base.json")
    project = load_json(SKILL_ROOT / "scope-mappings.project.json")
    legacy = load_json(SKILL_ROOT / "scope-mappings.json")

    merged = list(project.get("mappings", []))
    merged += list(base.get("mappings", []))
    if not merged:
        merged = list(legacy.get("mappings", []))

    priority = (
        base.get("_detection_rules", {}).get("priority_override", "")
        or legacy.get("_detection_rules", {}).get("priority_override", "")
    )
    order = [s.strip() for s in priority.split(">") if s.strip()]

    project_scopes = [m["scope"] for m in project.get("mappings", [])]
    for s in reversed(project_scopes):
        if s not in order:
            order.insert(0, s)

    return merged, order


def detect_scope(file_paths: list[str]) -> str:
    mappings, priority_order = load_mappings()
    counter: Counter = Counter()

    for file_path in file_paths:
        for mapping in mappings:
            scope = mapping.get("scope", "")
            patterns = mapping.get("patterns", [])
            if any(pattern in file_path for pattern in patterns):
                counter[scope] += 1
                break

    if not counter:
        return ""

    max_count = max(counter.values())
    candidates = [s for s, c in counter.items() if c == max_count]

    for p in priority_order:
        if p in candidates:
            return p

    return candidates[0]


def main() -> None:
    if len(sys.argv) > 1:
        files = sys.argv[1:]
    else:
        files = [line.strip() for line in sys.stdin if line.strip()]

    scope = detect_scope(files)
    if scope:
        print(scope)


if __name__ == "__main__":
    main()
