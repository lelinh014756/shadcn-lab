# Merge Workflow

## Variables
- `TO_BRANCH`: target (default: `main`)
- `FROM_BRANCH`: source (default: current branch)

## Steps

```bash
# 1. Sync
rtk git fetch origin
rtk git checkout {TO_BRANCH}
rtk git pull origin {TO_BRANCH}

# 2. Squash merge (recommended: clean history, 1 commit/PR)
rtk git merge --squash origin/{FROM_BRANCH}
rtk git commit -m "type(scope): mô tả tiếng Việt dựa trên branch name"

# 3. Push + cleanup
rtk git push origin {TO_BRANCH}
rtk git branch -d {FROM_BRANCH}
rtk git push origin --delete {FROM_BRANCH}
```

## Conflict Resolution
1. Resolve manually → `rtk git add .` → `rtk git commit` (continues squash)

## Pre-Merge Checklist
- [ ] FROM_BRANCH rebased from main (no conflicts)
- [ ] All tests pass
- [ ] PR approved (1 reviewer)

## Error Handling

| Error | Action |
|-------|--------|
| Merge conflicts | Resolve, `rtk git add .`, `rtk git commit` |
| Branch not found | Verify name, ensure pushed to remote |
| Push rejected | `rtk git pull --rebase`, retry |
