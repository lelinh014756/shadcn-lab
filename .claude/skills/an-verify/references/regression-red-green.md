# Regression Red-Green Policy

## Purpose

A passing test once is weak evidence. Regression verification proves the fix is actually caught by the test.

## Mandatory Cases

Red-green evidence is **mandatory** when any of these are true:
- Severity is **P0/P1**
- Production or staging incident
- Security issue
- Core business logic or financial/data integrity path
- Bug class likely to recur silently

## Strongly Recommended Cases

Red-green evidence is strongly recommended for all other bug fixes.

## If Severity Is Unclear

Do not guess. Ask the user or classify explicitly before deciding whether the mandatory rule applies.

## Red-Green Sequence

```text
1. Write or update regression test
2. Run with fix present -> PASS
3. Revert or neutralize the fix -> MUST FAIL
4. Restore the fix -> PASS again
```

If step 3 still passes, the test does not prove the bug.

## Exceptions

For trivial type/lint fixes or projects without a usable test harness:
- document why full red-green is not possible
- provide the strongest available equivalent evidence
- never claim the stronger proof if it was not run

## Reporting

Include:
- severity used
- whether red-green was mandatory or recommended
- exact test command(s)
- before/after/fail-again evidence summary