---
name: an-verify
description: "Verify completion claims with fresh evidence. Use before claiming done/fixed/passing/ready-to-ship, before commit/PR, or as final gate in an-fix, cook, code-review, and ship."
argument-hint: "[claim or context] [--quick|--strict]"
version: 1.0.0
---

# Verification

Canonical verification gate for completion claims.

## Default (No Arguments)

If invoked with a claim or workflow context, proceed with verification. If invoked WITHOUT arguments or with unclear intent, use `AskUserQuestion` to present available verification operations:

| Operation   | Description |
| ----------- | ----------- |
| `(default)` | Verify a completion/fix/build/test claim |
| `ship`      | Verify readiness-to-ship before commit/PR |
| `review`    | Verify review-complete or task-complete claims |

Present as options via `AskUserQuestion` with header "Verification Operation", question "What would you like to verify?".

## Core Principle

**Evidence before claims, always.**

If you have not run the proving command in this session, you cannot honestly claim the result.

## Hard Rules

- No completion claim without fresh verification evidence.
- No positive wording (`done`, `fixed`, `passes`, `ready`, `looks good`) before the gate passes.
- `--skip-tests` never overrides the verification gate for `ready to ship` claims.
- If severity is unclear and regression policy may matter, ask before applying the critical-path rule.

## Workflow

1. Load `references/verification-gate.md`
2. Identify the exact claim and proving command(s)
3. Run commands fresh, read full output, check exit codes
4. Apply severity-aware regression policy from `references/regression-red-green.md`
5. Apply workflow-specific enforcement from `references/enforcement-matrix.md`
6. Report result with marker from `references/report-markers.md`

## Severity Rule

- **P0/P1 / critical / prod-staging incident / core business logic bug** → red-green regression evidence is **mandatory**
- **Other bug fixes** → red-green regression is **strongly recommended**
- **If unclear** → ask first, do not guess severity

## Integration

`an-verify` is the canonical source for:
- `an-fix` Step 5
- `cook` finalize gate
- `code-review` completion gate
- `ship` readiness gate

Compatibility references may remain in older skills, but the rule source is `an-verify`.

## Runtime State Write-Back

After reaching a final verification decision, persist runtime state for the `TaskCompleted` hook:

- `VERIFY_GATE_PASS` → run `rtk node .claude/scripts/write-verify-state.cjs --decision pass --workflow <an-fix|cook|code-review|ship> --claim "<claim>" --evidence "<short evidence>" [--evidence-type <static|runtime-ui|mixed>] [--runtime-health <pass|fail|unknown>] [--target-url <url>]`
- `VERIFY_GATE_BYPASS` → run `rtk node .claude/scripts/write-verify-state.cjs --decision bypass --workflow <an-fix|cook|code-review|ship> --claim "<claim>" --evidence "<why bypassed>" [--evidence-type <static|runtime-ui|mixed>] [--runtime-health <pass|fail|unknown>] [--target-url <url>]`
- `VERIFY_GATE_FAIL` → run `rtk node .claude/scripts/write-verify-state.cjs --decision fail --workflow <workflow-if-known> --claim "<claim>" --evidence "<failure summary>" [--evidence-type <static|runtime-ui|mixed>] [--runtime-health <pass|fail|unknown>] [--target-url <url>]`

Rules:
- Write state only after reading fresh verification output.
- Workflow is mandatory for runtime enforcement. Always pass one of `an-fix`, `cook`, `code-review`, or `ship` when recording state.
- Runtime hook prefers explicit workflow metadata or workflow-bearing task subjects; avoid relying on incidental description text.
- UI/browser completion claims should record `--evidence-type` and `--runtime-health`; a `VERIFY_GATE_PASS` without runtime evidence can be blocked by policy.
- Token TTL defaults to 15 minutes and is capped at 30 minutes by the runtime writer; shorten only if the workflow context is unusually sensitive.
- `ship` readiness requires `VERIFY_GATE_PASS`; `VERIFY_GATE_BYPASS` is insufficient for ship-ready completion.

## Output Format

```text
VERIFY_GATE_PASS | VERIFY_GATE_FAIL | VERIFY_GATE_BYPASS
Claim: [what was being verified]
Command(s): [exact command list]
Evidence: [exit code + key output]
Decision: [pass/fail/bypass with reason]
```

## References

- `references/verification-gate.md`
- `references/regression-red-green.md`
- `references/enforcement-matrix.md`
- `references/report-markers.md`

## Bottom Line

Run the command. Read the output. Then make the claim.