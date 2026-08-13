# Verification Gate

## Iron Law

```text
NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE
```

If the proving command was not run in this session, the claim is not verified.

## Gate Function

```text
1. IDENTIFY: What exact command proves the claim?
2. RUN: Execute the full command fresh.
3. READ: Review full output, exit code, pass/fail counts.
4. VERIFY: Does the output prove the claim?
5. CLAIM: Only then state success, failure, or gap.
```

Skip any step = not verified.

## Claim → Evidence Matrix

| Claim | Required Evidence | Not Sufficient |
|------|-------------------|----------------|
| Tests pass | Test output shows 0 failures | Previous run, partial subset, "should pass" |
| Build passes | Build exits 0 | Linter passed |
| Bug fixed | Original symptom now passes | Code changed, assumed fixed |
| Requirements met | Checklist verified line-by-line | Tests passing only |
| Agent completed | Diff checked + verification rerun | Agent said success |
| Ready to ship | Minimum evidence from workflow + no blocked verify gate | `--skip-tests` alone |

## Red Flags

Stop immediately if you are about to:
- say `done`, `fixed`, `ready`, `great`, `perfect`
- use `should`, `probably`, `seems`, `looks good`
- trust an agent result without independent verification
- rely on partial verification
- move to commit/PR/task-complete without rerunning evidence

## Application Scope

Apply this gate before:
- completion claims
- fix claims
- build/test pass claims
- commit-ready / PR-ready / ship-ready claims
- task completion / workflow finalize

## Notes

- Evidence can prove failure as well as success.
- If no proving command exists, state that explicitly and ask how to validate.
- Workflow-specific policy comes from `enforcement-matrix.md`.