# Init Workflow

## Phase 1: Parallel Codebase Scouting

1. Scan the codebase and calculate the number of files with LOC in each directory (skip credentials, cache or external modules directories, such as `.claude`, `.opencode`, `.git`, `tests`, `node_modules`, `__pycache__`, `secrets`, etc.)
2. Target directories **that actually exist** - adapt to project structure, don't hardcode paths
3. Activate `an:scout` skill to explore the code base and return detailed summary reports to the main agent
4. Merge scout reports into context summary

## Phase 2: Evidence Aggregation

For each of the 7 docs:init topics, extract evidence from scout reports.
Topic names below **must match** `ag:report-templates` §5 taxonomy (same values used in Phase 3):

| Topic (§5) | Slug | Evidence Sources |
|------------|------|-----------------|
| project-overview-pdr | {project-name} | README, package.json, project config |
| generic-doc | codebase-summary | Scout directory reports, file counts |
| generic-doc | code-standards | ESLint/Prettier config, tsconfig, patterns |
| system-architecture | system-architecture | src/ structure, modules, dependencies |
| roadmap | {project-name} | TODO/FIXME, issues, existing roadmap |
| deployment-guide | - | Dockerfile, CI config, scripts |
| design-guidelines | - | UI patterns, component structure [optional] |

Per topic, build evidence object:

```json
{
  "topic": "<topic-from-§5>",
  "slug": "<slug>",
  "evidence": {
    "files": [{"path": "...", "snippet": "5-10 lines", "confidence": "verified"}],
    "commands": ["bash commands run"],
    "observations": "summary of findings"
  }
}
```

Rules:
1. Only include evidence actually found in codebase
2. Missing evidence -> mark topic as `incomplete`, note what's missing
3. Optional topics (deployment-guide, design-guidelines) -> skip if zero evidence
4. Reuse scout report data, don't re-scan

## Phase 3: Manifest Build

Build manifest from evidence. Topic + Slug only — template and output path are resolved by
`ag:report-templates` §5 taxonomy at execution time (single source of truth).

| # | Topic (ag:report-templates §5) | Slug | Status |
|---|-------------------------------|------|--------|
| 1 | project-overview-pdr | {project-name} | ready |
| 2 | generic-doc | codebase-summary | ready |
| 3 | generic-doc | code-standards | ready |
| 4 | system-architecture | system-architecture | ready |
| 5 | roadmap | {project-name} | ready |
| 6 | deployment-guide | *(omit if no evidence)* | ready/skip |
| 7 | design-guidelines | *(omit if no evidence)* | ready/skip |

Replace `{project-name}` with the actual project slug (e.g. `landsoft-one`).
Note: `roadmap` and `project-overview-pdr` output paths in §5 do NOT use slug — slug is metadata only.

For each entry, check if output path already exists:
- Exists -> mark `overwrite?` column, will ask in Phase 4
- Not exists -> mark `new`

## Phase 4: Batch VERIFY [GATING]

**CRITICAL:** Do NOT proceed to Phase 5 without explicit confirmation.

Pre-resolve output paths by looking up each topic in `ag:report-templates` §5 taxonomy
(substitute `{slug}` with the value from Phase 3 manifest), then display:

```
docs:init Manifest (N files)
─────────────────────────────────
# | Topic                  | Output Path (resolved from §5) | Action
1 | project-overview-pdr   | docs/project-overview-pdr.md   | CREATE
2 | generic-doc            | docs/codebase-summary.md       | OVERWRITE (exists)
...

Options: [YES all] [SELECTIVE] [NO abort]
```

- **YES**: Execute all entries in Phase 5
- **SELECTIVE**: User picks which entries to execute (uncheck unwanted)
- **NO**: Abort, no files written

Incomplete topics (missing evidence) shown with warning icon and reason.

## Phase 5: Sequential Execute via ag:report-templates

For each approved manifest entry (in order):

1. Activate `ag:report-templates` skill with prompt:
   ```
   Topic: <topic>
   Slug: <slug>
   Evidence: <evidence object from Phase 2>
   Metadata: <metadata block below>
   ```
2. report-templates runs its own PRODUCE → VERIFY → EXECUTE cycle (see `.claude/skills/report-templates/SKILL.md §9`)
3. After write: verify file exists and has YAML frontmatter

Metadata for all files (schema: `.claude/skills/report-templates/SKILL.md §8`):
```yaml
---
report_type: "<topic>"          # e.g. project-overview-pdr, generic-doc, system-architecture
generated_at: "<YYYY-MM-DDTHH:mm:ss+07:00>"
period: ""
status: draft
source: "<project-root-path>"
generated_by: "report-templates"
triggered_by: "docs:init"
plan_ref: ""
---
```

### Post-Generation Size Check

After all files written:
1. Run (cross-platform):
   ```bash
   # bash/Unix
   wc -l docs/**/*.md 2>/dev/null | sort -rn
   # Windows fallback
   powershell -c "Get-ChildItem docs -Filter *.md -Recurse | ForEach-Object { \$c=(Get-Content \$_.FullName).Count; [PSCustomObject]@{Lines=\$c;File=\$_.FullName} } | Sort-Object Lines -Descending | Format-Table"
   ```
2. Use `docs.maxLoc` from session context (default: 800)
3. For files exceeding limit: report and suggest splitting

### README Update (separate)

After docs generation, update `README.md` with project overview.
This is the ONE file that does not go through report-templates (it's not a docs artifact).
