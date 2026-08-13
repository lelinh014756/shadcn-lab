# Report Markers

Use one marker at the top of verification summaries.

## Markers

- `VERIFY_GATE_PASS` — claim verified with fresh evidence
- `VERIFY_GATE_FAIL` — evidence disproves or fails to prove the claim
- `VERIFY_GATE_BYPASS` — gate intentionally bypassed with explicit limitation

## Required Fields

```text
VERIFY_GATE_PASS | VERIFY_GATE_FAIL | VERIFY_GATE_BYPASS
Claim: [statement being verified]
Command(s): [exact commands]
Evidence: [exit code, pass/fail counts, key output]
Decision: [pass/fail/bypass + concise reason]
```

## Usage Notes

- `PASS` requires sufficient evidence, not confidence.
- `FAIL` is the correct output when the evidence is negative or incomplete.
- `BYPASS` must state what proof is missing and why the workflow still proceeded.