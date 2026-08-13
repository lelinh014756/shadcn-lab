#!/usr/bin/env python3
"""Detect issue links for PR body — 2-way discovery.

Sources (priority order):
1. Branch name regex: `-(\\d+)-` or `^\\w+/\\d+-` or `issue-(\\d+)`
2. Commit message bodies grep: `#(\\d+)`, `Closes #N`, `Fixes #N`
3. PR body template keywords (if already drafted)

Output: space-separated `Closes #N` tokens, or empty.
"""

import re
import subprocess
import sys

BRANCH_PATTERNS = [
    re.compile(r"^\w+/(\d+)-"),
    re.compile(r"-(\d+)-"),
    re.compile(r"issue-(\d+)"),
    re.compile(r"^(\d+)-"),
]

COMMIT_PATTERNS = [
    re.compile(r"(?:closes?|fixes?|resolves?)\s+#(\d+)", re.IGNORECASE),
    re.compile(r"#(\d+)"),
]


def git(*args: str) -> str:
    result = subprocess.run(
        ["git", *args], capture_output=True, text=True, encoding="utf-8"
    )
    return result.stdout.strip()


def from_branch(branch: str) -> set[str]:
    for pat in BRANCH_PATTERNS:
        m = pat.search(branch)
        if m:
            return {m.group(1)}
    return set()


def from_commits(base: str, head: str) -> set[str]:
    log = git("log", f"origin/{base}..{head}", "--format=%B")
    found: set[str] = set()
    for pat in COMMIT_PATTERNS:
        for m in pat.finditer(log):
            found.add(m.group(1))
    return found


def main() -> None:
    base = sys.argv[1] if len(sys.argv) > 1 else "main"
    branch = git("rev-parse", "--abbrev-ref", "HEAD")
    if not branch:
        return

    issues = from_branch(branch) | from_commits(base, "HEAD")
    if not issues:
        return

    tokens = [f"Closes #{n}" for n in sorted(issues, key=int)]
    print(" ".join(tokens))


if __name__ == "__main__":
    main()
