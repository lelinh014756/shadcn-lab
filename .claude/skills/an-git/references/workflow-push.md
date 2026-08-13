# Push Workflow

## Tool 1: Verify State

```bash
rtk git status --short && \
UPSTREAM=$(rtk git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null) && \
if [[ -z "$UPSTREAM" ]]; then echo "NO_UPSTREAM"; else \
  rtk git log $UPSTREAM..HEAD --oneline; \
fi
```

- If uncommitted changes exist → warn + suggest running `cm` first
- If `NO_UPSTREAM` → use Tool 2 variant

## Tool 2: Push

```bash
# With upstream
rtk git push origin HEAD

# Without upstream
rtk git push -u origin HEAD
```

## Error Matrix

| Error                          | Cause             | Action                                              |
|--------------------------------|-------------------|-----------------------------------------------------|
| `rejected - non-fast-forward`  | Remote is ahead   | `rtk git pull --rebase` → resolve → push           |
| `no upstream branch`           | Branch not tracked| `rtk git push -u origin HEAD`                      |
| `Authentication failed`        | Bad credentials   | `rtk gh auth status` / verify SSH key              |
| `Repository not found`         | Wrong remote URL  | `rtk git remote -v`                                 |
| `Permission denied`            | No write access   | Check repo permissions                              |

## Force Push Guard

**NEVER** force push to: `main`, `master`, `production`, `prod`, `release/*`.

Feature branch with rebase / squash history:
```bash
rtk git push --force-with-lease origin HEAD
```

> `--force-with-lease` is safer than `-f`: fails if remote has newer commits you haven't seen.

## Output

```
✓ pushed: N commits → origin/{branch}
  - abc123 feat(scope): mô tả
  - def456 fix(scope): mô tả
```
