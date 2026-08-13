# Update Workflow

## Phase 1: Parallel Codebase Scouting

**Tool Selection (CRITICAL):**
- Windows → use `PowerShell` tool (NOT `Bash` — bash cannot parse PowerShell syntax)
- Linux/macOS → use `Bash` tool
- When in doubt: check `Platform` from session environment. `win32` = `PowerShell` tool.

**Run all 3 commands in one parallel batch** (same message, 3 tool calls):

1. **Directory LOC**: Count files + LOC per top-level dir (skip `.claude`, `.opencode`, `.git`, `node_modules`, `__pycache__`, `.next`, `secrets`, `.turbo`)
2. **src/ breakdown**: Count files + LOC per `src/` subdirectory
3. **Docs LOC**: Count LOC per `docs/*.md` file — use `Bash` with `find docs -maxdepth 1 -name "*.md" -exec wc -l {} + | sort -rn` (POSIX, works cross-platform)

Then:
4. Spawn `Explore` agent to scout codebase structure, modules, patterns
5. Merge all results into context summary

## Phase 1.5: Parallel Documentation Reading

**Merge with Phase 1** — if Phase 1 already produced docs LOC counts, reuse them. No separate counting step needed.

**Run docs reading in parallel with Phase 1 scouting** (same message):
- Spawn 1 `Explore` agent to read all docs files (10 files ≈ 2500 LOC fits in 1 agent)
- Agent prompt: "Read these docs files, extract for each: purpose, key sections, staleness indicators, broken cross-references. Files: {list from Phase 1 step 3}"
- Skip parallel reading if ≤3 files — docs-manager reads directly

**Anti-waste rules:**
- Do NOT count docs separately if Phase 1 step 3 already returned LOC
- Do NOT spawn >1 reader agent for ≤10 docs files
- Do NOT re-read files that Phase 1 scout already covered

## Phase 2: Documentation Update (docs-manager Agent)

**CRITICAL:** You MUST spawn `docs-manager` agent via Task tool with merged reports and doc readings.

Pass the gathered context to docs-manager agent to update documentation:
- `README.md`: Update README (keep it under 300 lines)
- `docs/project-overview-pdr.md`: Update project overview and PDR
- `docs/codebase-summary.md`: Update codebase summary
- `docs/code-standards.md`: Update codebase structure and code standards
- `docs/system-architecture.md`: Update system architecture
- `docs/project-roadmap.md`: Update project roadmap
- `docs/deployment-guide.md` [optional]: Update deployment guide
- `docs/design-guidelines.md` [optional]: Update design guidelines

## Additional requests
<additional_requests>
  $ARGUMENTS
</additional_requests>

Metadata for all files (must conform to SKILL.md §8 schema):
```yaml
---
report_type: "<topic>"          # e.g. project-overview-pdr, generic-doc, system-architecture
generated_at: "<YYYY-MM-DDTHH:mm:ss+07:00>"
period: ""
status: draft
source: "<project-root-path>"
generated_by: "report-templates"
triggered_by: "docs:update"
plan_ref: ""
---
```

## Phase 3: Size Check (Post-Update)

After docs-manager completes:
1. Run `wc -l docs/*.md 2>/dev/null | sort -rn` to check LOC
2. Use `docs.maxLoc` from session context (default: 800)
3. For files exceeding limit: report and ask user

## Phase 4: Documentation Validation (Post-Update)

Run validation to detect potential hallucinations:
1. Run: `node .claude/scripts/validate-docs.cjs docs/`
2. Display validation report (warnings only, non-blocking)
3. Checks: code references, internal links, config keys

## Important
- Use `docs/` directory as the source of truth.
- **Do not** start implementing.
- **Permission hygiene**: Use POSIX commands (`find`, `wc`, `sort`) via `Bash` for simple file counting — lower friction than PowerShell `Get-ChildItem` chains. Reserve `PowerShell` for operations needing Windows-specific features.
- **Batch parallel**: Maximize tool calls per message. Counting + scouting + reading can overlap. Never wait for a counting command to finish before launching the next independent step.
