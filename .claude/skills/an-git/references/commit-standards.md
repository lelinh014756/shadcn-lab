# Commit Message Standards

## Format
`type(scope): mô tả tiếng Việt` — max 72 chars, no period, imperative mood

## Project Rules
- **Description MUST be in Vietnamese** (`mô tả tiếng Việt có dấu`) — always, no exception
- **`.claude/` files**: only `feat`, `fix`, `perf` (NOT `docs`)
- **No AI attribution**: no "Generated with Claude", no "Co-Authored-By"

## Examples
- `feat(investor): thêm validation cho mã số thuế`
- `fix(auth): sửa lỗi refresh token hết hạn`
- `refactor(propdict): đơn giản hóa cache layer`
- `chore(config): nâng cấp EF Core lên version 9`
- `perf(skill): cải thiện token efficiency`
- `feat(skill): thêm git auto-detection`
