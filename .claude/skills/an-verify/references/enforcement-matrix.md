# Enforcement Matrix

| Workflow | Level | Rule |
|---|---|---|
| `an-fix` | Hard gate | No Step 6 finalize without `an-verify` pass/fail decision and prevention evidence |
| `cook` | Hard gate | No phase complete / implementation done claim without `an-verify` gate after testing/review |
| `code-review` | Hard gate | No completion/approval-ready claim without fresh verification evidence |
| `ship` | Hard gate | No `ready to ship`, commit-ready, or PR-ready claim without `an-verify`; `--skip-tests` does not override |
| Other skills | Soft gate | Strong recommendation; do not block rollout v1 |

## Precedence

1. Verification gate beats convenience flags.
2. Workflow-specific shortcuts cannot override fresh evidence.
3. When evidence is missing, report `FAIL` or `BYPASS` honestly.

## Bypass Policy

`VERIFY_GATE_BYPASS` is allowed only when:
- user explicitly accepts a reduced assurance path
- the workflow itself allows bypass
- the report states exactly what evidence is missing

`ship` readiness is **not** eligible for bypass solely because of `--skip-tests`.