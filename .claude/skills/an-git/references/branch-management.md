# Branch Management

## Naming Convention

**Format:** `type/scope/slug`

```
feat/investor/mst-validation-flow
fix/auth/jwt-refresh-token-expiry
refactor/propdict/cache-optimization
hotfix/auth/refresh-token-expiry
```

## Scopes

| Scope | Module |
|-------|--------|
| `investor` | Investor management |
| `project` | Project management |
| `propdict` | Property dictionary |
| `auth` | Authentication, JWT |
| `api` | Controllers, middleware |
| `infra` | Infrastructure, DB |
| `domain` | Domain entities |
| `shared` | Shared utilities |
| `config` | Configuration |
| `ci` | CI/CD |

## Granularity: Feature-Level (Team Style)

1 branch = 1 feature (1-2 weeks, 20-50 commits)

✅ `feat/investor/mst-validation-flow` — feature scope
❌ `feat/investor/add-validation-function` — too granular
❌ `feat/investor/fix-typos` — too small

## Alternative: Issue-Based

`{type}-{issue-id}-{slug}` → `feat-123-investor-validation`
Use when working from GitHub Issues for auto-linking.

## Enforcement (Soft Warning)

```bash
PATTERN="^(feat|fix|refactor|docs|test|chore|hotfix|perf|style|ci)/(investor|project|propdict|auth|api|infra|domain|shared|config|build|ci)/[a-z0-9-]+$"
if [[ ! $BRANCH =~ $PATTERN ]]; then
  echo "⚠️  Branch does not follow convention: type/scope/slug"
  echo "Current: $BRANCH | Example: feat/investor/mst-validation"
  echo "Continue? [Y/n]"
fi
```
