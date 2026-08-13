# PR Body Fallback Template

Used when the repository has **no** `.github/PULL_REQUEST_TEMPLATE.md`. Auto-fill from git history per workflow-pr.md Tool 2.

## Template

```markdown
## Problem / Motivation
{inferred from issue link OR top fix/feat commits}

## Solution
{top 5 commits (no hash), fallback: git log --oneline | head -3}

## Changes
{git diff origin/{base}...HEAD --stat}

## Risk
- [ ] Low — no migration, no public API change
- [ ] Medium — migration OR response shape change
- [ ] High — breaking change, needs downstream coordination

## Test Plan
- [{x if tests exist else ' '}] Unit/Integration tests updated
- [ ] Manual smoke test on dev env
- [ ] Regression check on related flows

## Breaking Changes
{detect: migrations + Controller HTTP verb diff}
- [ ] None
- [ ] Yes — describe: ...

## Related Issues
{branch regex `-(\d+)-` → `Closes #N`; fallback: grep commits for `#\d+`}

## Checklist
- [ ] Code follows project conventions (`docs/code-standards.md`)
- [ ] No secrets / credentials committed
- [ ] Docs updated (if public API changed)
- [ ] Changelog entry added (if user-facing)
```

## Auto-fill Logic

| Section   | Source                                                                                                   |
|-----------|----------------------------------------------------------------------------------------------------------|
| Problem   | Issue body (if `Closes #N` exists) → fallback: fix/feat commit messages                                  |
| Solution  | `git log origin/{base}..HEAD --format="- %s" \| head -5`                                                 |
| Changes   | `git diff origin/{base}...HEAD --stat` (top-level summary)                                               |
| Risk      | Auto-detect: migration (`Migrations/*.cs`) → Medium+; no breaking → Low                                  |
| Test Plan | `git diff --name-only \| grep -E "(Test\|Spec)"` → `[x]` else `[ ]`                                      |
| Breaking  | Check Controller `[Http*]/[Route]` diff + Migrations files                                               |
| Related   | Branch regex `-(\d+)-` OR commit body grep `#\d+`                                                        |

## Rules

- Never show an empty template → ALWAYS pre-fill
- User can Edit per section before Create PR
- If repo has `.github/PULL_REQUEST_TEMPLATE.md` → prefer that template (fallback only when missing)
