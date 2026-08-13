---
name: issue
description: "Create GitHub issues from natural language or TASK-NNN.md files. Auto-detects type (bug/feature/task/tech-debt), fills structured template, auto-creates missing labels, always confirms before submitting via gh CLI. Used by task-decomposer Phase 7 for batch publishing."
argument-hint: "[description | path/to/TASK-NNN.md] [--parent <issue_number>] [--dry-run]"
version: 2.4.0
---

# GitHub Issue Creator

## Trigger

Activated when user wants to create a GitHub issue.

Two input modes:
- **Natural language**: `"tìm thấy lỗi login timeout"` → detect type → fill template → confirm → create
- **TASK file path**: `"plans/task/260323-slug/task-001-xxx.md"` → parse fields → idempotency check → create (no confirm)

If no arguments provided, use `AskUserQuestion` to ask for description.

---

## Step 1 — Pre-flight Checks

Run FIRST. Fail fast with clear error message if any fails.

```bash
gh auth status
gh repo view --json nameWithOwner -q ".nameWithOwner"
```

If `gh auth status` fails → "Chưa đăng nhập GitHub CLI. Chạy: `gh auth login`"

**Parse flags (strip from argument before processing):**

- `--dry-run` → set `DRY_RUN=true` — preview only, không tạo issue, không tạo labels, không gọi API
- `--parent <number>` → set `PARENT_ISSUE=<number>`

**Parse `--parent` flag:**
- If argument contains `--parent <number>` → extract parent issue number, strip flag from argument before processing
- Store as `PARENT_ISSUE` (used in Step 8.5)
- Validate parent exists: `gh issue view {PARENT_ISSUE} --json number` → error if not found

**Detect input mode:**
- Argument ends with `.md` or looks like a file path → **TASK File Mode** → jump to Step 2B
- Otherwise → **Natural Language Mode** → continue Step 2A

---

## NATURAL LANGUAGE MODE FLOW: Step 2A → 3 → 4 → 5 → 6 → 7 → 8 → 9

## Step 2A — Detect Issue Type

Analyze the user's description and classify into one of:

| Type | Keywords / Signals |
|------|--------------------|
| `bug` | lỗi, bug, crash, không hoạt động, broken, fail, error, exception, sai, wrong, incorrect |
| `feature` | tính năng, feature, thêm, add, implement, cần, cần có, want, support, enable |
| `tech-debt` | nợ kỹ thuật, tech debt, refactor, tái cấu trúc, performance, slow, bottleneck, optimize, cải thiện kiến trúc |
| `task` | task, việc, chore, setup, configure, migrate, update dependency, cleanup |

> Note: `refactor` → `tech-debt` (not `task`). `setup/configure/migrate` → `task`.

If ambiguous between 2 types → use `AskUserQuestion` to confirm.

---

## Step 3 — Extract Context Info

From the user's description, extract:

- **title**: Concise 1-line summary (max 72 chars)
- **body**: Fill the matching template in Step 4 with details from description
- **labels**: Determine priority + status from description signals (schema reference: Step 5)
- **assignee**: Only if user explicitly mentioned someone

---

## Step 4 — Fill Template (Natural Language Mode only)

Fill title with type prefix (`bug:`, `feat:`, `task:`, `td:`). Body from template file:

| Type | Template |
|------|----------|
| `bug` | `.claude/skills/issue/templates/bug-template.md` |
| `feature` | `.claude/skills/issue/templates/feat-template.md` |
| `task` | `.claude/skills/issue/templates/task-template.md` |
| `tech-debt` | `.claude/skills/issue/templates/td-template.md` |

Read the template file, fill in placeholders with extracted context from Step 3.

---

## Step 5 — Label Mapping

### Unified label schema (11 labels)

**Type labels** — always assign one:
| Label | Color | Description |
|-------|-------|-------------|
| `type:bug` | `#d73a4a` | Bug report |
| `type:feat` | `#a2eeef` | New feature |
| `type:task` | `#e4e669` | Task / chore |
| `type:tech-debt` | `#f9d0c4` | Technical debt / refactor |

**Priority labels** — always assign one:
| Label | Color | Description |
|-------|-------|-------------|
| `p0-blocking` | `#b60205` | Blocking — must fix now |
| `p1-high` | `#d93f0b` | High priority |
| `p2-medium` | `#0052cc` | Medium priority |
| `p3-nice` | `#0e8a16` | Nice to have |

**Status labels**:
| Label | Color | Description |
|-------|-------|-------------|
| `ready` | `#2cbe4e` | Ready to pick up |
| `in-progress` | `#1d76db` | Currently being worked on |
| `blocked` | `#fbca04` | Blocked by dependency |

**Scope labels** — always assign one:
| Label | Color | Description |
|-------|-------|-------------|
| `issue:main` | `#8250df` | Main / parent issue |
| `issue:sub` | `#cae8ff` | Sub-issue linked to a parent |

> Note: "done" is not a label — close the issue instead (`gh issue close`).

### Label assignment — Natural Language Mode

- **Type**: `type:bug` / `type:feat` / `type:task` / `type:tech-debt` + encode in title prefix (`bug:`, `feat:`, `task:`, `td:`)
- **Priority**: infer from description signals:
  - critical/blocking/không dùng được → `p0-blocking`
  - high/quan trọng/cần sớm → `p1-high`
  - (default) → `p2-medium`
  - nice/thấp/nhỏ → `p3-nice`
- **Status**: `ready` (default for new issues)
- **Scope**: `issue:sub` nếu có `--parent`, ngược lại `issue:main`

### Label assignment — TASK File Mode

- **Type**: `type:{type}` label + encode in title prefix (`bug:`, `feat:`, `task:`, `td:`)
- **Priority**: from TASK file metadata
- **Status**: from TASK file metadata (`ready`, `in-progress`, `blocked`)
- **Scope**: `issue:sub` nếu có `--parent`, ngược lại `issue:main`

---

## Step 6 — Preview and Confirm (Natural Language Mode only)

Display preview then ask:

```
📋 PREVIEW
─────────────────────────────────
Repository: {owner/repo}
Title: {title}
Type: {type}
Labels: {labels}
Parent Issue: #{PARENT_ISSUE} (nếu có)

{body}
─────────────────────────────────
```

```
Question: "Issue này trông ổn chưa?"
Header: "Xác nhận Issue"
Options:
  - "Tạo issue" — Tạo ngay với nội dung này
  - "Chỉnh sửa" — Tôi sẽ mô tả thêm để điều chỉnh
  - "Hủy" — Không tạo
```

"Chỉnh sửa" → ask what to change → update → re-preview.
"Hủy" → exit gracefully.

---

## TASK FILE MODE FLOW: Step 2B → 7 → 8 → 9

## Step 2B — Parse TASK File

**1. Read file:**
```bash
cat {file_path}
```

**2. Parse fields:**
- `id` → extract `TASK-NNN` from ID field or filename
- `title` → from Title field, strip `[ROLE]` prefix if present
- `role` → `BE | FE | FS | DevOps | QA` → lowercase (`be | fe | fs | devops | qa`)
- `priority` → map:
  - `P0-Blocking` → `p0-blocking`
  - `P1-High` → `p1-high`
  - `P2-Medium` → `p2-medium`
  - `P3-Nice-to-have` → `p3-nice`

**3. Idempotency check — MANDATORY:**
```bash
gh issue list --search "[{id}] in:title" --state all --json number,title --jq '.[0].number'
```
Returns number → **SKIP**, log `skipped: #{number} already exists` → done.
Empty → proceed.

**4. Detect type** — scan title + description using keyword table from Step 2A:
- `bug` signals: lỗi, bug, fix, crash, broken, fail, error, sai, wrong
- `feature` signals: thêm, add, implement, feature, cần có, support, enable
- `tech-debt` signals: refactor, optimize, tái cấu trúc, performance, nợ, bottleneck
- default → `task`

**5. Set labels:** `type:{type},{priority_label},ready`

**6. Set title format:** `[{id}] {title}`

**7. Body source:** use the TASK file directly via `--body-file` (Step 8)

> Skip confirm — tasks already approved in task-decomposer Phase 3/4. Continue to Step 7.

---

## Step 7 — Ensure Labels Exist

Create **only the labels that will be assigned to this issue** using `--force` (idempotent — safe to re-run).

### Type label for this issue:
```bash
# Only run the one matching this issue's type:
gh label create "type:bug"       --color "#d73a4a" --description "Bug report"              --force
gh label create "type:feat"      --color "#a2eeef" --description "New feature"             --force
gh label create "type:task"      --color "#e4e669" --description "Task / chore"            --force
gh label create "type:tech-debt" --color "#f9d0c4" --description "Technical debt / refactor" --force
```

### Priority label for this issue:
```bash
# Only run the one matching this issue's priority:
gh label create "p0-blocking" --color "#b60205" --description "Blocking — must fix now" --force
gh label create "p1-high"     --color "#d93f0b" --description "High priority"           --force
gh label create "p2-medium"   --color "#0052cc" --description "Medium priority"         --force
gh label create "p3-nice"     --color "#0e8a16" --description "Nice to have"            --force
```

### Status label (always `ready` for new issues):
```bash
gh label create "ready"       --color "#2cbe4e" --description "Ready to pick up"            --force
gh label create "in-progress" --color "#1d76db" --description "Currently being worked on"   --force
gh label create "blocked"     --color "#fbca04" --description "Blocked by dependency"       --force
```

### Scope label (based on --parent flag):
```bash
# Only run the one matching this issue's scope:
gh label create "issue:main" --color "#8250df" --description "Main / parent issue" --force
gh label create "issue:sub"  --color "#cae8ff" --description "Sub-issue linked to a parent" --force
```

> **Note:** Type is encoded in both title prefix (`bug:`, `feat:`, `task:`, `td:`) AND as a `type:*` label for GitHub search/filter.

---

## Step 8 — Create Issue

> **Nếu `DRY_RUN=true`:** skip toàn bộ step này và Step 8.5. Hiển thị commands sẽ chạy dưới dạng log, rồi nhảy thẳng đến Step 9.
>
> ```
> [DRY-RUN] gh label create "type:bug" --color "#d73a4a" ...
> [DRY-RUN] gh issue create --title "bug: ..." --body-file /tmp/... --label "type:bug,p2-medium,ready"
> [DRY-RUN] gh api repos/.../issues/{parent}/sub_issues ... (nếu có --parent)
> ```

**Natural Language Mode** — write body to temp file to avoid shell escaping issues:
```bash
# Write body to temp file
BODY_FILE=$(mktemp /tmp/gh-issue-body-XXXXXX.md)
cat > "$BODY_FILE" << 'BODY_EOF'
{filled_template_content}
BODY_EOF

gh issue create \
  --title "{title}" \
  --body-file "$BODY_FILE" \
  --label "{label1},{label2},{scope_label}"

rm -f "$BODY_FILE"
```

> `{scope_label}` = `issue:sub` nếu có `--parent`, ngược lại `issue:main`.

**TASK File Mode** — strip agent metadata, use cleaned body:
```bash
# Strip YAML frontmatter and agent-internal sections (Role, ID, metadata lines)
# Keep only human-readable content: Description, Checklist, Notes sections
BODY_FILE=$(mktemp /tmp/gh-issue-body-XXXXXX.md)
sed '/^---$/,/^---$/d' "{task_file_path}" | \
  grep -v "^## Role\|^## ID\|^## Status\|^## Assignee" \
  > "$BODY_FILE"

gh issue create \
  --title "[{id}] {title}" \
  --body-file "$BODY_FILE" \
  --label "type:{type},{priority_label},ready,{scope_label}"

rm -f "$BODY_FILE"
```

> `{scope_label}` = `issue:sub` nếu có `--parent`, ngược lại `issue:main`.

If assignee specified (Natural Language Mode only):
```bash
gh issue create ... --assignee "{username}"
```

---

## Step 8.5 — Link Sub-issue (chỉ khi có `--parent`)

Sau khi issue được tạo, link nó vào parent bằng GitHub REST API:

```bash
OWNER_REPO=$(gh repo view --json nameWithOwner -q ".nameWithOwner")

# Lấy database ID của issue vừa tạo (khác với issue number)
NEW_ISSUE_ID=$(gh issue view {issue_number} --json id -q '.id')

# Link sub-issue vào parent
gh api "repos/${OWNER_REPO}/issues/{PARENT_ISSUE}/sub_issues" \
  --method POST \
  -f sub_issue_id="$NEW_ISSUE_ID"
```

Nếu API trả lỗi `404` → parent issue không tồn tại hoặc repo chưa bật sub-issues.
Nếu API trả lỗi `422` → issue đã là sub-issue của issue khác.

---

## Step 9 — Output

**Nếu `DRY_RUN=false` (default):**
```
✅ Issue tạo thành công!
🔗 {issue_url}
📌 #{issue_number}: {title}
🔗 Sub-issue của: #{PARENT_ISSUE} (nếu có)
```

**Nếu `DRY_RUN=true`:**
```
🔍 [DRY-RUN] Không có issue nào được tạo.
📋 Commands sẽ chạy:
  gh label create ...
  gh issue create --title "{title}" --label "{labels}" ...
  gh api repos/.../sub_issues ... (nếu có --parent)
```

---

## Error Handling

| Error | Response |
|-------|----------|
| `gh auth` fail | "Chưa auth. Chạy: `gh auth login`" |
| Not in git repo | "Không tìm thấy git repo. Chạy trong thư mục dự án." |
| Network timeout | "Không kết nối được GitHub. Kiểm tra mạng và thử lại." |
| Label create fail | Log warning, tiếp tục tạo issue không có label |
| TASK file not found | "File không tồn tại: {path}" |
| Issue already exists (idempotency) | Log `skipped: #{number}`, exit with success |
| Parent issue not found (404) | "Issue #{PARENT_ISSUE} không tồn tại hoặc không có quyền truy cập" |
| Already a sub-issue (422) | "Issue này đã là sub-issue của issue khác" |
