# Git Skill Auto-Detection — Test Cases

Used to validate accuracy of scope + type detection. Re-run when mappings/rules change.

## Success Criteria

- Scope detection: >80% correct
- Type detection: >70% correct
- User flow: fallback works when confidence is low

---

## Scope Detection

| Changed Files | Expected Scope | Rule |
|---------------|----------------|------|
| `src/Application/Features/Investors/Commands/CreateInvestorCommand.cs` | `investor` | Path contains `Features/Investors` |
| `src/Application/Features/Projects/Queries/GetProjectListQuery.cs` | `project` | Path contains `Features/Projects` |
| `src/Application/Features/PropDict/PropDictService.cs` | `propdict` | Path contains `Features/PropDict` |
| `src/ApiHost/Controllers/AuthController.cs` | `auth` | Path contains `Auth` (auth > api priority) |
| `src/ApiHost/Controllers/InvestorController.cs` | `investor` | Path contains `Investor` (investor > api) |
| `src/ApiHost/Program.cs` | `api` | Path contains `src/ApiHost` |
| `src/Infrastructure/Repositories/InvestorRepository.cs` | `investor` | Path contains `Investor` (investor > infra) |
| `src/Infrastructure/Persistence/AppDbContext.cs` | `infra` | Path contains `src/Infrastructure` |
| `src/Domain/Entities/InvestorEntity.cs` | `investor` | Path contains `Investor` (investor > domain) |
| `src/Shared/Extensions/ResultExtensions.cs` | `shared` | Path contains `src/Shared` |
| `README.md` | `docs` | Path contains `.md` |
| `docs/system-architecture.md` | `docs` | Path contains `docs/` |
| `appsettings.json` | `config` | Path contains `appsettings` |
| `LansoftOneBE.csproj` | `config` | Path contains `.csproj` |
| `.github/workflows/ci.yml` | `ci` | Path contains `.github/workflows` |
| `.claude/skills/git/SKILL.md` | `skill` | Path contains `.claude/skills` |
| `tests/InvestorServiceTests.cs` | `test` | Path contains `tests/` |

### Multi-file (Most Frequent Scope Wins)

| Changed Files | Expected Scope | Reason |
|---------------|----------------|--------|
| `Investors/CreateCommand.cs` + `Investors/CreateCommandHandler.cs` | `investor` | 2/2 investor |
| `AuthController.cs` + `InvestorController.cs` | mixed → prompt user | Equal match |
| `Investors/X.cs` + `Projects/Y.cs` | mixed → prompt user | Different business features |
| `InvestorService.cs` + `InvestorRepository.cs` + `AppDbContext.cs` | `investor` | 2/3 investor wins |

---

## Type Detection

### Factor 1: File Patterns (50% weight)

| Scenario | Expected Type | Confidence |
|----------|---------------|------------|
| All files: `README.md`, `docs/guide.md` | `docs` | 95% |
| All files: `InvestorServiceTests.cs`, `ProjectTests.cs` | `test` | 90% |
| All files: `appsettings.json`, `appsettings.prod.json` | `chore` | 85% |
| All files: `LansoftOneBE.csproj`, `.slnx` | `chore` | 85% |
| Mixed: `.cs` + `.md` | no high-confidence match → continue | - |

### Factor 2: Diff Keywords VN+EN (30% weight)

| Diff Contains | Expected Type | Confidence |
|---------------|---------------|------------|
| "sửa lỗi validation" | `fix` | 80% |
| "fix bug in pagination" | `fix` | 80% |
| "thêm validation cho mã số thuế" | `feat` | 75% |
| "add new investor endpoint" | `feat` | 75% |
| "tối ưu query, thêm index" | `perf` | 75% |
| "cấu trúc lại service layer" | `refactor` | 70% |
| Mixed: "sửa" + "thêm" | priority: fix > feat, confidence drop | 70% |

### Factor 3: Git Status (20% weight)

| Scenario | Expected Type | Confidence |
|----------|---------------|------------|
| All files NEW (A) | `feat` | 65% |
| All files MODIFIED (M), no keywords | `refactor` | 60% |
| Mixed NEW + MODIFIED | unclear → ask user | <60% |

### Combined Scenarios

| Files | Diff Keywords | Git Status | Expected | Confidence |
|-------|---------------|------------|----------|------------|
| `InvestorService.cs` (M) | "thêm validation cho MST" | MODIFIED | `feat(investor)` | 80% Medium |
| `README.md` (M) | generic update | MODIFIED | `docs(readme)` | 95% High |
| All files new `.cs` | "add pagination" | NEW | `feat(?)` | 75% Medium |
| `appsettings.json` (M) | "config update" | MODIFIED | `chore(config)` | 85% High |
| Mixed `.cs` | no keywords | MODIFIED | `refactor` | 60% Low → ask |

---

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| "fix" in "prefix" variable name | Skip (word boundary match) |
| "add" in "padding" | Skip (word boundary) |
| VN + EN mixed: "sửa lỗi, add unit test" | Conflict → fix priority, lower confidence |
| Diff too long (>100 lines) | Sample first 100 lines |
| No staged files | Exit cleanly, no detection |
| `.claude/` files only | `skill` scope, `feat/fix/perf` only (not docs) |

---

## User Flow Tests

| Scenario | Expected Prompt |
|----------|----------------|
| High confidence ≥90% | Show suggestion, accept by default |
| Medium 70-89% | Show suggestion, ask Accept/Edit/Skip |
| Low <70% | Show options list, user selects |
| User edits suggestion | Accept edited message |
| User skips detection | Manual input prompt |
| Format invalid after input | Soft warning, continue if user confirms |

---

## Notes

- Test manually by staging the corresponding files
- Measure accuracy: `correct / total × 100%`
- Document findings in `test-summary.md` after each run
- Adjust `scope-mappings.base.json` / `scope-mappings.project.json` when accuracy drops
