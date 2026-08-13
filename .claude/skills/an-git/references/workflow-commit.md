# Commit Workflow

Execute via `git-manager` subagent.

## Tool 1: Stage + Analyze

```bash
rtk git add -A && \
echo "=== STAGED ===" && rtk git diff --cached --stat && \
echo "=== FILES ===" && rtk git diff --cached --name-only && \
echo "=== SECURITY ===" && \
PATCH=$(rtk git diff --cached --unified=0 --no-color) && \
SECRET_REGEX='(AKIA[0-9A-Z]{16}|api[_-]?key|[A-Za-z0-9]+_secret([A-Za-z0-9_]+)?|secret_[A-Za-z0-9_]+|oauth_token|auth_token|access_token|refresh_token|jwt|password|passwd|credential|private[_-]?key|mongodb://|postgres://|mysql://|redis://|-----BEGIN( [A-Z]+)? PRIVATE KEY-----)' && \
MATCHES=$(printf "%s\n" "$PATCH" | while IFS= read -r line; do \
  case "$line" in \
    '+++ b/'*) current_file=${line#+++ b/} ;; \
    '+'*) if [[ "$line" != '+++ '* ]] && printf "%s\n" "$line" | grep -qiE "$SECRET_REGEX"; then printf "%s:%s\n" "$current_file" "$line"; fi ;; \
  esac; \
done) && \
FILES=$(rtk git diff --cached --name-only --diff-filter=ACMR | grep -Ei '(^|/)\.env($|\.)|\.pem$|\.key$|\.p12$|(^|/)(credentials|secrets)\.json$' | grep -Evi '(^|/)\.env\.example$' || true) && \
if [[ -n "$MATCHES" || -n "$FILES" ]]; then \
  echo "SECRETS_DETECTED"; \
  [[ -n "$FILES" ]] && printf "%s\n" "$FILES"; \
  [[ -n "$MATCHES" ]] && printf "%s\n" "$MATCHES" | head -40; \
  exit 1; \
fi && \
echo "SECRETS:0" && \
echo "=== SPLIT ANALYSIS ===" && \
python .claude/skills/an-git/scripts/detect_split.py
```

**If secrets are detected:** STOP, block commit, show filenames + matched added lines only. Suggest: "Add to .gitignore or use environment variables". Offer: `rtk git reset HEAD <file>`.

## Tool 1.5: Type + Scope Detection

Use inline table in `SKILL.md`. Scope via script:

```bash
rtk git diff --cached --name-only | python .claude/skills/an-git/scripts/detect_scope.py
```

- Script merges `scope-mappings.base.json` + `scope-mappings.project.json`
- Empty output → inspect targeted diff for extra signal or ask user for scope
- Full patch is fallback only; default flow should stay at `--stat` + `--name-only`

**Output to user:**
```
# High (≥90%): auto-apply
✓ detected: docs(readme) [High — 95%]
Suggested: docs(readme): cập nhật hướng dẫn cài đặt

# Medium (70–89%): confirm
⚠ detected: feat(investor) [Medium — 75%]
Suggested: feat(investor): thêm validation cho mã số thuế
Accept? [y/n] or type override:

# Low (<70%): manual
? unclear (60%) — Select: [feat] [fix] [refactor] [chore] [docs] [test] [perf] [style]
```

**Format validation (soft warn):**
```
if message doesn't match ^[a-z]+(\([a-z]+\))?: .+
  → ⚠ Warning: expected format type(scope): mô tả tiếng Việt
  → Continue anyway? [y/n]
```

**Override logging:** if user changes scope from the suggestion:
```bash
rtk git diff --cached --name-only | python .claude/skills/an-git/scripts/update_scope_cache.py <detected> <override>
```

## Tool 2: Split Decision (Smart)

Use output from `detect_split.py` to group:

| Category          | Commit pattern                     |
|-------------------|------------------------------------|
| `generated`       | `chore(config/deps): ...` (auto)   |
| `rename_only`     | `refactor(scope): rename ...`      |
| `whitespace_only` | `style(scope): format ...`         |
| `substantive`     | Normal — split further by scope    |

Substantive files split further:
- `skill:` → `feat|fix|perf(skill): ...`
- `test:` → `test(scope): ...`
- `docs:` → `docs(scope): ...`
- `code:` → `feat|fix|refactor(scope): ...`

**Single commit:** all files share type + scope + not generated → 1 commit
**Multi commit:** mixed → split by group

**Multi-commit procedure:**
```bash
rtk git reset HEAD  # unstage all
rtk git add <files-group-N> && rtk git commit -m "type(scope): desc"
# repeat per group
```

**Rollback on mid-sequence failure:**
```bash
rtk git reset --soft HEAD~N  # N = number of commits created; keeps staging intact
```

## Tool 3: Commit

```bash
rtk git commit -m "type(scope): description"
```

## Tool 4: Push (if requested)

Read `workflow-push.md`. TL;DR:
```bash
rtk git push && echo "✓ pushed: yes" || rtk git push -u origin HEAD
```

Only push when the user explicitly requests it ("push", "cp", "commit and push").

## Dry-run Mode

When `--dry-run` is present:
- Run Tool 1 + 1.5 + 2 (analyze + detect) but **skip Tool 3 + 4**
- Output the planned commits + suggested messages
- Trailer: `DRY-RUN: no changes made`
