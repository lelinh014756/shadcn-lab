---
name: an-git
description: "Git operations with conventional commits. ALWAYS activate when user requests: (1) commit ('commit đi', 'tạo commit', 'stage and commit', 'lưu thay đổi'); (2) PR/pull request ('tạo PR', 'push request', 'mở PR', 'create PR'); (3) push ('push lên', 'đẩy code'); (4) merge. Use for staging, committing, pushing, PRs, merges. Auto-splits commits by type/scope. Security scans for secrets. Supports dry-run."
argument-hint: "cm|cp|pr|merge [args] [--dry-run]"
version: 3.2.0
---

# Git Operations

## Shell Requirement

**Git Bash** (Windows) or bash (Linux/macOS). Scripts rely on bash syntax (`[[...]]`, `=~`, heredoc).

## PRE-READ by Command

| Command    | Files to read                                                                                                   |
| ---------- | --------------------------------------------------------------------------------------------------------------- |
| `cm`, `cp` | `references/commit-standards.md` · `references/workflow-commit.md`                                              |
| `pr`       | `references/workflow-pr.md` · `.github/PULL_REQUEST_TEMPLATE.md` (canonical) · `references/pr-template-fallback.md` (fallback when missing) |
| push (sub) | `references/workflow-push.md`                                                                                   |
| `merge`    | `references/workflow-merge.md`                                                                                  |
| gh cmds    | `references/gh-cli-guide.md`                                                                                    |

## RTK Setup

**RTK (Rust Token Killer)** - CLI proxy giảm 60-90% token cho git operations.

```bash
rtk --version  # Kiểm tra đã cài chưa
```

**Nếu chưa cài:** Cài theo hướng dẫn trong `~/.claude/RTK.md` (global config), hoặc chạy:
```bash
cargo install rtk  # Linux/macOS
# Windows: winget install reachingforthejack.rtk hoặc build from source
```

Shell hook tự động rewrite `git` → `rtk git` khi RTK đã cài. Không cần check trước mỗi command.

## MANDATORY RULES

- **Commit description MUST be in Vietnamese** — project convention
- Format: `type(scope): mô tả` (max 72 chars, no period, imperative mood)
- Only `feat`, `fix`, `perf` for `.claude/` files (NOT `docs`)
- No AI attribution in commits
- **NEVER** force push `main`/`master`/`production`/`prod`/`release/*`
- Generated files (`*.g.cs`, `*.Designer.cs`, `Migrations/`, lockfiles) → force `chore(config)`
- **URL output**: When displaying URLs from `gh` (run, pr, issue...), trust actual tool output. Never self-generate URL from repo name — always parse from `gh` response or use `gh run view --json url`.

## Type Auto-Detection (Inline)

Keyword column keeps both VN + EN because commit messages are written in Vietnamese but diff comments often mix languages.

| Type       | File patterns (50%)                          | Keywords VN+EN (30%)                   | Git status (20%)              |
| ---------- | -------------------------------------------- | -------------------------------------- | ----------------------------- |
| `docs`     | `*.md`, `*.txt`                              | —                                      | —                             |
| `test`     | `*Test*.cs`, `*Spec*`                        | —                                      | —                             |
| `chore`    | `*.csproj`, config `*.json`, generated files | config, deps, upgrade                  | —                             |
| `fix`      | —                                            | sửa, lỗi, bug, fix, issue, resolve     | —                             |
| `feat`     | —                                            | thêm, tạo, mới, add, create, implement | all NEW files (65%)           |
| `perf`     | —                                            | tối ưu, hiệu năng, optimize            | —                             |
| `refactor` | —                                            | cấu trúc lại, refactor, đơn giản hóa   | EDIT-only + no keywords (60%) |
| `style`    | whitespace-only diff                         | format, format lại                     | —                             |

Confidence thresholds: **≥90% → auto-apply** | **70–89% → suggest + confirm** | **<70% → ask user**

## Scope Detection

- Merge `scope-mappings.base.json` (portable) + `scope-mappings.project.json` (project-specific)
- Priority: project > base (business before technical)
- Script: `python scripts/detect_scope.py` (stdin = file paths)
- User override → logged via `scripts/update_scope_cache.py` (writes to `scope-cache.jsonl`)
- After ≥3 overrides on the same pattern → suggest updating mappings

## Dry-run Mode

Append `--dry-run` to any command:
- Print preview (staged files, suggested type/scope/message, commit plan, PR body) — **no git state mutation**
- Output ends with `DRY-RUN: no changes made`

## Default (No Arguments)

If invoked with no args, prompt via `AskUserQuestion`:

| Operation | Description                  |
| --------- | ---------------------------- |
| `cm`      | Stage files & create commits |
| `cp`      | Stage files, commit & push   |
| `pr`      | Create Pull Request          |
| `merge`   | Merge branches               |

Header: "Git Operation" | Question: "What would you like to do?"

---

## Command: `cm` (Commit)

1. **RTK check + Stage all**: `rtk git add -A`
2. **Security scan**: patterns in `references/safety-protocols.md` — scan added lines only; on match: STOP, show filenames + matched added lines, block commit
3. **Smart split analyze**: `python scripts/detect_split.py` → groups `generated`/`rename_only`/`whitespace_only`/`substantive`
   - Generated files → auto-group `chore(config)` / `chore(deps)`
   - Rename-only → separate commit `refactor(scope): rename ...`
   - Whitespace-only → `style(scope): format ...`
4. **Analyze**: default to `rtk git diff --cached --stat` + `--name-only`
5. **Detect type/scope**:
   - Type: ưu tiên file patterns + git status; only inspect targeted diff when confidence < 90%
   - Scope: `rtk git diff --cached --name-only | python scripts/detect_scope.py`
   - Empty or conflicting → inspect targeted diff or ask user for scope
   - Render full patch only when split analysis yields multiple substantive groups or user explicitly asks
6. **Auto-commit** (confidence ≥ 90% from step 5):
   - If confidence ≥ 90%: directly execute `rtk git commit -m "type(scope): mô tả tiếng Việt"`
   - If confidence < 90%: show proposed commit in output for manual review
   - Log scope override if any via `update_scope_cache.py` for learning
7. **Output**:
   ```
   ✓ staged: N files (+X/-Y lines)
   ✓ security: passed
   ✓ commit: HASH type(scope): mô tả
   ```

> Issue linking: use `/an-issue` skill.

---

## Command: `cp` (Commit & Push)

Same as `cm`, then:

9. **Push**: read `references/workflow-push.md`
10. **Prompt PR via `AskUserQuestion`**: "Create PR now?"
    - Options: `Create PR` · `No`
    - `Create PR` → run `pr` command flow
11. **Output**: append `✓ pushed: yes` (+ PR URL if created)

---

## Command: `pr` [to-branch] [from-branch]

1. Read `references/workflow-pr.md`. Prefer `.github/PULL_REQUEST_TEMPLATE.md`; fallback to `references/pr-template-fallback.md`.
2. `to-branch` default: `main` | `from-branch` default: current branch
3. Sync + diff: see workflow-pr.md Tool 1 — dùng `rtk git` prefix
4. Detect issue links: `python scripts/detect_issue_link.py {to-branch}` → `Closes #N Closes #M`
5. Draft PR body: **auto-fill ALL sections** from git history + issue detection — never show empty template
6. Detect breaking changes (migrations + Controller HTTP verb diff)
7. PR Preview → `[Accept / Edit / Cancel]`
8. Create: `rtk gh pr create --base ${to-branch} --head ${from-branch} --title "..." --body "..."`
9. Output: PR URL

---

## Command: `merge` [to-branch] [from-branch]

1. Read `references/workflow-merge.md`
2. `to-branch` default: `main` | `from-branch` default: current branch
3. Fetch + checkout target + pull + squash merge + push + delete branch — dùng `rtk git fetch`, `rtk git push`

---

## Error Handling

| Error              | Action                                            |
| ------------------ | ------------------------------------------------- |
| Secrets detected   | Block commit, show matching files                 |
| No changes staged  | Exit cleanly with message                         |
| Push rejected      | `rtk git pull --rebase`                            |
| No upstream branch | `rtk git push -u origin HEAD`                      |
| Merge conflicts    | Suggest manual resolution                         |
| PR creation failed | Show error, suggest web UI                        |
| Multi-commit fail  | Suggest `rtk git reset --soft HEAD~N` to rollback  |
