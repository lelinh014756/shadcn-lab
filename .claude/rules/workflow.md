# Workflow

Execution lifecycle và delegation protocol. Activate skills chỉ khi materially change outcome.

## Task Lifecycle

### 1. Planning
- Delegate `planner` khi: uncertainty, multi-file, architectural decisions, unclear ownership, high blast radius
- Skip khi: scope explicit, files known, blast radius low
- Research chỉ khi changes plan quality

### 2. Implementation
- Follow architectural patterns
- Handle edge cases, error scenarios
- No parallel "enhanced"/"v2" files — update existing
- Run compile/typecheck after code changes

### 3. Testing
- Delegate `tester` khi: behavior changed non-trivially, multiple files/flows touched, runtime validation needed
- Skip: analysis-only, no-code audits
- Validate real behavior, not fake success
- Fix failures before proceeding

### 4. Code Review
- Delegate `code-reviewer` khi: code shape changed materially, shared patterns touched, moderate-high maintenance risk
- Skip: no-code analysis, tiny scoped edits where review overhead > change risk
- Prefer clarity over abstraction
- Comments only for non-obvious intent

### 5. Integration & Docs
- Follow approved plan
- Maintain API contracts, backward compatibility
- Document breaking changes
- Update canonical docs per `project-context.md` → §Docs Update Protocol
- Delegate `docs-manager` if docs work substantial

### 6. Debugging
- Delegate `debugger` for bugs, server issues, CI/CD failures
- Read findings before fixing
- Rerun validation through `tester`
- Continue review/fix loop until passes

### 7. Visual Explanations
Activate `an-preview` skill:
- `mode=explain`: ASCII + Mermaid
- `mode=diagram`: architecture/data-flow
- `mode=slides`: step-by-step
- `mode=ascii`: terminal-only
- HTML variants: browser-direct

Storage: `{plan_dir}/visuals/` if plan exists, else `plans/visuals/`

## Decision Gates

**Choose intensity by blast radius + change size, not by "create" vs "edit" label.**

- **Direct answer**: narrow request, no substantial code/runtime inspection needed
- **Small scoped** (1-2 files, class/copy/layout tweaks, no shared behavior): batch edits → one compile check → one verification pass
- **Full workflow**: scope unclear, high blast radius, multiple ownership boundaries, materially higher validation/review needs

**Escalate from small-change path when:** behavior, shared components, validation, i18n, multi-file flow, runtime uncertainty increases blast radius.

**Use one capability-expanding toolchain at a time:** browser/runtime OR implementation OR focused subagent.

## Source Of Truth

Establish one primary source before expanding context:
- Code question → source code
- Runtime/frontend bug → console/network or DOM state
- UI audit → source code + DOM/text probe; screenshot only if visual confirmation matters
- Architecture/process → canonical docs + code anchors

**Browser verification:** Don't trust interaction evidence until runtime preflight coherent (target URL matches, not `about:blank`, no blocking console/network failures).

**Contradiction rule:** If tool output contradicts expected source of truth, stop that branch and switch strategy.

## User Interaction Gate

**Don't ask user when decision can be made from:**
- Current scope + blast radius
- Existing repo rules
- Established source of truth
- Standard low-risk local investigation

**Ask user only for:**
- Missing requirements
- Business/product choices
- Risky/irreversible actions
- Explicit approval points required by workflow

## Delegation Protocol

### When To Delegate

Use subagent only when at least one true:
- Main agent needs >3 additional open-ended lookups
- ≥2 independent workstreams, non-overlapping ownership
- Scope/ownership/source of truth unclear after initial probes
- Specialized capability materially changes quality (debugger, tester, code-reviewer, docs-manager)

**Don't delegate when:**
- Exact files + change region known
- Answerable with ≤3 direct tool lookups
- Subagent would repeat discovery already done
- Benefit is only "following process" vs reducing risk/context

### Delegation Context (MANDATORY)

Always include in subagent prompt:
1. **Work Context Path**: git root of PRIMARY files
2. **Reports Path**: per `project-context.md` → §Storage Contract
3. **Plans Path**: per `project-context.md` → §Storage Contract
4. **Locale**: `IMPORTANT: Viết tất cả output (file, report, response) bằng tiếng Việt CÓ DẤU.`

**Example:**
```
Task: Fix parser bug.
Work context: /path/to/project-b
Reports: /path/to/project-b/plans/reports/
Plans: /path/to/project-b/plans/
```

### Delegation Strategy

**Sequential (dependency-ordered):**
- planner → implementation → tester → code-reviewer → docs-manager
- Each completes fully before next
- Pass forward only needed context

**Parallel (independent work):**
- Separate, non-conflicting file ownership
- Independent code/test/docs tracks
- No shared mutable artifact needing ordering

Before parallel: define ownership boundaries, identify merge points, avoid overlapping edits.

### Subagent Status Protocol

Subagents MUST report:

| Status | Meaning | Controller Action |
|--------|---------|-------------------|
| DONE | Completed successfully | Proceed |
| DONE_WITH_CONCERNS | Completed but flagged doubts | Address concerns before proceeding |
| BLOCKED | Cannot complete | Change context, simplify, or escalate |
| NEEDS_CONTEXT | Missing information | Provide context and re-dispatch |

**Handling:**
- Never ignore BLOCKED/NEEDS_CONTEXT
- Never retry same blocked approach without material change
- Treat correctness concerns as blocking for review-quality work
- Escalate if same subtask fails repeatedly

**Format:**
```
Status: DONE | DONE_WITH_CONCERNS | BLOCKED | NEEDS_CONTEXT
Summary: [1-2 sentences]
Concerns/Blockers: [if applicable]
```

### Context Isolation

Subagents receive only needed context. Never pass full session history.

**Rules:**
1. Craft prompts with task, files, constraints, acceptance criteria
2. Summarize decisions, don't replay conversation
3. Scope file references tightly
4. Pass specific phase/excerpt if working from plan
5. Keep controller-only coordination out of prompts
6. Pass minimum code slices to avoid rediscovery
7. If controller knows exact symbol/file/line, include directly vs broad search

**Prompt template:**
```
Task: [specific description]
Files to modify: [list]
Files to read for context: [list]
Acceptance criteria: [list]
Constraints: [any relevant]
Plan reference: [phase file if applicable]

Work context: [project path]
Reports: [reports path]
Plans: [plans path]
```

**Anti-patterns:**

| Bad | Good |
|-----|------|
| Continue from where we left off | Implement X per spec in phase-02.md |
| Fix the issues we discussed | Fix null check in auth.ts:45, root cause: missing validation |
| Look at codebase and figure out | Read src/api/routes.ts, add POST /users |
| Passing long conversation dumps | Short summary with exact file paths |
| Search repo, review everything around projects | Review src/app/(dashboard)/projects/page.tsx:581-930 for maintainability only |
| Spawn tester/reviewer for no-code analysis | Keep in main agent, answer directly |

### Controller Preflight

Before spawning subagent, silently verify:
- Direct tools insufficient or less efficient
- Subagent adds isolation, parallelism, or specialized capability
- Prompt contains exact scope, avoids rediscovery

Internal only — don't ask user to validate preflight.

## Agent Teams (Optional)

For multi-session parallel collaboration, activate `team` skill. Team-specific behavior in `project-context.md` → §Team Coordination. Tools `SendMessage`, `TaskUpdate`, `ExitPlanMode`, `shutdown_response` provided by team skill runtime, not default toolset.
