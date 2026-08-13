# Git Safety Protocols

## Secret Detection

```bash
PATCH=$(git diff --cached --unified=0 --no-color)
SECRET_REGEX='(AKIA[0-9A-Z]{16}|api[_-]?key|[A-Za-z0-9]+_secret([A-Za-z0-9_]+)?|secret_[A-Za-z0-9_]+|oauth_token|auth_token|access_token|refresh_token|jwt|password|passwd|credential|private[_-]?key|mongodb://|postgres://|mysql://|redis://|-----BEGIN( [A-Z]+)? PRIVATE KEY-----)'
printf "%s\n" "$PATCH" | while IFS= read -r line; do
  case "$line" in
    '+++ b/'*) current_file=${line#+++ b/} ;;
    '+'*)
      if [[ "$line" != '+++ '* ]] && printf "%s\n" "$line" | grep -qiE "$SECRET_REGEX"; then
        printf "%s:%s\n" "$current_file" "$line"
      fi
      ;;
  esac
done
```

| Category | Pattern |
|----------|---------|
| API Keys | `api[_-]?key`, `apiKey` |
| AWS | `AKIA[0-9A-Z]{16}` |
| Secret identifiers | `*_secret`, `secret_*` |
| Tokens | `auth_token`, `oauth_token`, `access_token`, `refresh_token`, `jwt` |
| Passwords | `password`, `passwd` |
| Private Keys | `-----BEGIN ... PRIVATE KEY-----` |
| DB URLs | `mongodb://`, `postgres://`, `mysql://`, `redis://` |

**Warn on files:** `.env`, `.env.*` (except `.env.example`), `*.key`, `*.pem`, `*.p12`, `credentials.json`, `secrets.json`

**Scope:** scan added lines only (`^+`, excluding `+++`) to prevent blocking commits that remove old secrets.

**Output:** prefix each matched line with the staged filename so the user can reset only the offending file.

**On detection:** BLOCK commit → show filenames + matched added lines only → suggest `.gitignore` or env vars → offer `git reset HEAD <file>`

## Branch Protection

Never force push to: `main`, `master`, `production`, `prod`, `release/*`

## Remote-First Operations

- ✅ `git diff origin/main...origin/feature`
- ❌ `git diff main...HEAD` (includes local uncommitted)
