# Pull Request Workflow

## Variables
- TO_BRANCH: target (default: `main`)
- FROM_BRANCH: source (default: current branch)

**CRITICAL:** PRs are based on remote branches — never use local diff.

---

## Tool 1: Sync + Analyze

**Always rebase from `main` first.**

```bash
rtk git fetch origin && \
rtk git rebase origin/main && \
rtk git push -u origin HEAD 2>/dev/null || true && \
BASE=${BASE_BRANCH:-main} && \
HEAD=$(rtk git rev-parse --abbrev-ref HEAD) && \
echo "=== PR: $HEAD → $BASE ===" && \
rtk git log origin/$BASE...origin/$HEAD --oneline && \
rtk git diff origin/$BASE...origin/$HEAD --stat
```

**If "Branch not on remote":** push first, then retry.

---

## Tool 2: Generate Content

### Template Resolution
1. Check `.github/PULL_REQUEST_TEMPLATE.md` → if present, treat as canonical
2. If missing → fallback to `references/pr-template-fallback.md`

### Title Format
```
[type(scope)] mô tả tiếng Việt ngắn gọn
```

### Body — MUST auto-fill ALL sections

| Section   | Auto-fill logic |
|-----------|-----------------|
| Problem   | From issue body (if `Closes #N` present) → fallback: top `fix`/`feat` commits |
| Solution  | Top 5 `feat`/`fix` commits (no hash); fallback: `rtk git log --oneline | head -3` |
| Risk      | `Low` if no breaking change; `Medium/High` if migrations present |
| Test Plan | `[x]` if diff contains `*Tests*.cs`/`*Spec*`, else `[ ]` |
| Breaking  | Detect migration files + `[Http*]/[Route]` changes in `*Controller*.cs` |
| Related   | `python scripts/detect_issue_link.py $BASE` → `Closes #N` tokens |
| Checklist | Keep `[ ]` unchecked — author/reviewer confirms |

### Issue Link Detection (script)
```bash
python .claude/skills/an-git/scripts/detect_issue_link.py $BASE
```
Output: `Closes #123 Closes #456` — empty when no match.

### Breaking Changes Flow
```
Breaking detected:
  Migrations: {files}  /  Endpoints: {HTTP verb + route}

Include? [Yes / Customize / Skip]
- Yes       → fill "If yes: ..." (description + migration note)
- Customize → user enters manually
- Skip      → "- [ ] None"
```

### PR Preview → [Accept / Edit / Cancel]
- **Accept** → run Tool 3
- **Edit** → prompt section by section
- **Cancel** → abort

---

## Tool 3: Create PR

```bash
rtk gh pr create --base $BASE --head $HEAD --title "..." --body "..."
```

Or web UI with `.github/PULL_REQUEST_TEMPLATE.md`.

## Dry-run Mode

When `--dry-run` is present:
- Run Tool 1 + 2 (sync + generate body)
- Print full Preview
- **Skip Tool 3** (no PR created)
- Trailer: `DRY-RUN: no PR created`

---

## Error Handling

| Error                | Action                                   |
|----------------------|------------------------------------------|
| Branch not on remote | `rtk git push -u origin HEAD`, then retry |
| Empty diff           | Warn: "No changes for PR"                |
| Push rejected        | `rtk git pull --rebase`, resolve, push   |
| Merge conflicts      | Resolve manually, rebase, push           |
| PR creation failed   | Show error, suggest web UI               |
| Template missing     | Fallback to `pr-template-fallback.md`    |
