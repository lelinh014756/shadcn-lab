# GitHub CLI Reference

## Auth
```bash
gh auth status         # check
gh auth login          # interactive
gh auth refresh -s write:packages  # expand scopes
```

## PR — Create

```bash
# Standard
gh pr create --base main --head feature/x --title "feat(scope): mô tả" --body "..."

# Draft
gh pr create --draft --title "WIP: ..."

# With reviewers + labels
gh pr create --reviewer user1,user2 --label "feat,priority:high"

# Auto-fill from commits (use only when commits are clean)
gh pr create --fill
```

## PR — View / Manage

| Task | Command |
|------|---------|
| List PRs | `gh pr list` |
| PR details | `gh pr view {num}` |
| Open in web | `gh pr view {num} --web` |
| Checkout PR | `gh pr checkout {num}` |
| View diff | `gh pr diff {num}` |
| My PR status | `gh pr status` |
| Comment | `gh pr comment {num} --body "..."` |
| Request review | `gh pr edit {num} --add-reviewer user1` |

## PR — Merge

```bash
gh pr merge {num} --squash           # default: squash
gh pr merge {num} --squash --auto    # auto when checks pass
gh pr merge {num} --squash --delete-branch
gh pr merge {num} --rebase           # preserve history
```

## Issues

```bash
gh issue list                              # list
gh issue view {num}                        # view
gh issue create --title "..." --body "..." # create
gh issue develop {num} -c                  # create branch from issue
gh issue close {num} --reason "completed"
```

## Workflow Runs (CI)

```bash
gh run list --limit 5              # recent runs
gh run view {id} --log-failed      # log task fail
gh run watch {id}                  # stream log
gh run rerun {id} --failed         # rerun fail jobs
```

## Repo

```bash
gh repo view                       # current repo
gh repo clone owner/repo
gh browse                          # open in web
gh browse path/file:42             # open file at line
```

## JSON / Scripting

```bash
# List PR JSON
gh pr list --json number,title,author,headRefName

# Extract field
gh pr view {num} --json title,body,labels --jq '.title'

# Batch close stale PRs
gh pr list --state open --json number -q '.[].number' | xargs -I {} gh pr close {}
```

## Common Combos

```bash
# Create PR + auto-merge
gh pr create --fill && gh pr merge --auto --squash --delete-branch

# Rerun failed CI on current PR
gh pr view --json number -q '.number' | xargs gh run list --limit 1 --branch $(git branch --show-current)
```
