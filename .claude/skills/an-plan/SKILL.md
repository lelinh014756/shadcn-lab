---
name: an-plan
description: "Plan implementations, design architectures, create technical roadmaps with detailed phases. Use for feature planning, system design, solution architecture, implementation strategy, phase documentation."
argument-hint: "[task] OR archive|red-team|validate"
license: MIT
---

# Planning

Create detailed technical implementation plans through research, codebase analysis, solution design, and comprehensive documentation.

## Default (No Arguments)

If invoked with a task description, proceed with planning workflow. If invoked WITHOUT arguments or with unclear intent, use `AskUserQuestion` to present available operations:

| Operation   | Description                           |
| ----------- | ------------------------------------- |
| `(default)` | Create implementation plan for a task |
| `archive`   | Write journal entry & archive plans   |
| `red-team`  | Adversarial plan review               |
| `validate`  | Critical questions interview          |

Present as options via `AskUserQuestion` with header "Planning Operation", question "What would you like to do?".

## Workflow Modes

Default: `--auto` (analyze task complexity and auto-pick mode).

| Flag         | Mode           | Research       | Red Team        | Validation      | Cook Flag    |
| ------------ | -------------- | -------------- | --------------- | --------------- | ------------ |
| `--auto`     | Auto-detect    | Follows mode   | Follows mode    | Follows mode    | Follows mode |
| `--fast`     | Fast           | Skip           | Skip            | Skip            | `--auto`     |
| `--hard`     | Hard           | 2 researchers  | Yes             | Optional        | (none)       |
| `--parallel` | Parallel       | 2 researchers  | Yes             | Optional        | `--parallel` |
| `--two`      | Two approaches | 2+ researchers | After selection | After selection | (none)       |

Add `--no-tasks` to skip task hydration in any mode.

Load: `references/workflow-modes.md` for auto-detection logic, per-mode workflows, context reminders.

## When to Use

- Planning new feature implementations
- Architecting system designs
- Evaluating technical approaches
- Creating implementation roadmaps
- Breaking down complex requirements

## Core Responsibilities & Rules

Always honoring **YAGNI**, **KISS**, and **DRY** principles.
**Be honest, be brutal, straight to the point, and be concise.**

### 1. Research & Analysis

Load: `references/research-phase.md`
**Skip if:** Fast mode or provided with researcher reports

### 2. Codebase Understanding

Load: `references/codebase-understanding.md`
**Skip if:** Provided with scout reports

**Codebase navigation (repomix-first):**

- `grep_repomix_output("pattern")` → `read_repomix_output(lineRange)` to explore code
- Only use `Read(file)` if exact file path is already known
- Only `pack_codebase` if repomix output is stale or major refactor occurred
- ❌ Do NOT Read multiple files for discovery — 1 grep replaces 5-10 Reads
- **File Read Policy:** Đã đọc trong session → reuse context. Delegate subagent → pass content trong prompt.

### 3. Solution Design

Load: `references/solution-design.md`

### 4. Plan Creation & Organization

Load: `references/plan-organization.md`

### 5. Task Breakdown & Output Standards

Load: `references/output-standards.md`

## Workflow Process

1. **Pre-Creation Check** → Check Plan Context for active/suggested/none
2. **Mode Detection** → Auto-detect or use explicit flag (see `workflow-modes.md`)
3. **Research Phase** → Spawn researchers (skip in fast mode)
4. **Codebase Analysis** → Read docs, scout if needed
5. **Plan Documentation** → Write comprehensive plan via planner subagent
6. **Red Team Review** → Use `Skill` tool: `an-plan red-team {plan-path}` (hard/parallel/two modes)
7. **Post-Plan Validation** → Use `Skill` tool: `an-plan validate {plan-path}` (hard/parallel/two modes)
8. **Hydrate Tasks** → Create Claude Tasks from phases (default on, `--no-tasks` to skip)
9. **Context Reminder** → Output cook command with absolute path (MANDATORY)

## Output Requirements

- DO NOT implement code - only create plans
- DO NOT create files in `plans/reports/` — plan.md đã là overview, không cần report summary thêm
- Respond with plan file path and summary
- Ensure self-contained plans with necessary context
- Include code snippets/pseudocode when clarifying
- Fully respect the `./.claude/rules/development-rules.md` file

### CLI Handoff

After creating the plan, print in CLI:

Plan created: {absolute-plan-path}

Next steps:

1. /clear
2. /cook {absolute-plan-path}

## Task Management

Plan files = persistent. Tasks = session-scoped. Hydration bridges the gap.

**Default:** Auto-hydrate tasks after plan files are written. Skip with `--no-tasks`.
**3-Task Rule:** <3 phases → skip task creation.

Load: `references/task-management.md` for hydration pattern, TaskCreate patterns, cook handoff protocol.

### Hydration Workflow

1. Write plan.md + phase files (persistent layer)
2. TaskCreate per phase with `addBlockedBy` chain
3. TaskCreate for critical/high-risk steps within phases
4. Metadata: phase, priority, effort, planDir, phaseFile
5. Cook picks up via TaskList (same session) or re-hydrates (new session)

## Active Plan State

Check `## Plan Context` injected by hooks:

- **"Plan: {path}"** → Active plan. Ask "Continue? [Y/n]"
- **"Suggested: {path}"** → Branch hint only. Ask if activate or create new.
- **"Plan: none"** → Create new using `Plan dir:` from `## Naming`

After creating plan: `node .claude/scripts/set-active-plan.cjs {plan-dir}`
Reports: Active plans → plan-specific path. Suggested → default path.

### Next Steps

After the plan is created and set as active:

1. `/clean`
2. `/cook {plan-dir}`

`{plan-dir}` must be the absolute plan directory.

Write this section at the end of `plan.md`.

### Important

DO NOT create plans or reports in USER directory.
ALWAYS create plans or reports in CURRENT WORKING PROJECT DIRECTORY.

## Subcommands

| Subcommand          | Reference                         | Purpose                                         |
| ------------------- | --------------------------------- | ----------------------------------------------- |
| `/an-plan archive`  | `references/archive-workflow.md`  | Archive plans + write journal entries           |
| `/an-plan red-team` | `references/red-team-workflow.md` | Adversarial plan review with hostile reviewers  |
| `/an-plan validate` | `references/validate-workflow.md` | Validate plan with critical questions interview |

## Quality Standards

- Thorough and specific, consider long-term maintainability
- Research thoroughly when uncertain
- Address security and performance concerns
- Detailed enough for junior developers
- Validate against existing codebase patterns

### Terminal Handoff Hint

After completing the plan and printing the Context Reminder, output a terminal hint:

Next steps:

1. /clear
2. /cook {absolute-plan-path}

Important:

- This hint is ONLY printed in terminal output.
- DO NOT write this section into any plan.md or phase files.

**Remember:** Plan quality determines implementation success. Be comprehensive and consider all solution aspects.
