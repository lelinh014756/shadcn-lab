# Project Context

Documentation, plans, team coordination artifacts.

## Canonical Docs

Current in `./docs`:
- `project-overview-pdr.md`
- `codebase-summary.md`
- `code-standards.md`
- `system-architecture.md`
- `project-roadmap.md` (active roadmap; older refs to `development-roadmap.md` redirect here)
- `deployment-guide.md`
- `design-guidelines.md`

Additional:
- `.claude/repomix-instructions.md` — update when add/remove bounded context, change architecture pattern, or naming convention

## Docs Update Protocol

**Triggers:**
- Development phase status changes
- Major features implemented/released
- Significant bugs resolved
- Security-relevant changes shipped
- Architecture, module boundaries, workflow, i18n rollout, external dependencies change
- Project timeline/scope adjustments

**Protocol:**
1. Read affected canonical docs before editing
2. Update only docs impacted by change
3. Keep links, dates, naming, cross-references consistent
4. Verify document matches current codebase/workflow state
5. Default owner: lead controller in normal flow, or `docs-manager` when docs work substantial/explicitly delegated

## Task Report Storage

**Task Report (actual):**
- Location: `plans/reports/task-{date}-{time}-{slug}.md`
- Naming: `{type}-{YYMMDD}-{HHMM}-{slug}.md`

**Task Report Template:**
- Location: `docs/design-patterns/task-report/task-report-template.md`

**Format per template:**
- Ngắn gọn, checklist-based
- Mỗi module = 1 task với deadline, checklist, kết luận
- Kết luận nêu: cần gì, phụ thuộc gì, có thể làm độc lập khi nào
- Tổng hợp dependencies và thứ tự ưu tiên

## Storage Contract

**Locations:**
- Plans: `./plans/`
- Cross-task reports: `./plans/reports/`
- Plan-scoped research/artifacts: inside owning plan directory

**Naming:**
- Use pattern injected by hooks in `## Naming` block at session start
- Plan directory: `plans/{date}-{issue}-{slug}/`
- Reports: `plans/reports/{type}-{date}-{slug}.md`

**Example (after hook injection):**
```
## Naming
- Plan dir:  plans/260428-2305-rules-cleanup/
- Phase:     plans/260428-2305-rules-cleanup/phase-01-split-tooling-policy.md
- Report:    plans/reports/research-260428-rules-audit.md
```

If no `## Naming` block (hook disabled), construct from patterns above using today's date in `YYMMDD` format + kebab-case slug.

**Plan directory layout:**
```
plans/
├── {date}-{issue}-{slug}/
│   ├── plan.md
│   ├── phase-01-*.md
│   ├── phase-02-*.md
│   ├── research/
│   │   └── *.md
│   └── reports/
│       └── *.md
└── reports/
    └── *.md
```

**Plan file structure:**

`plan.md` (~100 LOC max):
- List phases with status/progress
- Link to detailed phase files
- Key dependencies + blockers

`phase-XX-*.md`:
- Overview
- Requirements
- Architecture
- Implementation Steps
- Todo List
- Risk & Security

## Team Coordination (Agent Team Mode Only)

> Rules below apply only when operating as teammate within Agent Team (activated via `team` skill). No effect on standard sessions or default subagent workflows. Tools `SendMessage`, `TaskUpdate`, `ExitPlanMode`, `TaskList`, `shutdown_response` provided by team skill runtime, not default toolset.

### File Ownership (CRITICAL)

- Each teammate MUST own distinct files — no overlapping edits
- Define ownership via glob patterns in task descriptions
- Lead resolves conflicts by restructuring tasks or handling shared files directly
- Tester owns test files only; reads implementation but never edits
- Ownership violation detected: stop, report to lead immediately

### Git Safety

- Prefer git worktrees for implementation teams
- Never force-push from teammate session
- Commit frequently with descriptive messages
- Pull before push to catch merge conflicts early
- If in worktree, commit/push to worktree branch, not `main`/`dev`

### Communication

- `SendMessage(type: "message")` for peer DMs; always address by name
- `SendMessage(type: "broadcast")` only for critical blocking issues affecting whole team
- Mark tasks completed via `TaskUpdate` before sending completion messages to lead
- Include actionable findings, not just completion notices
- Never send structured JSON status messages

### Reporting

- Save reports using canonical contract above (§Storage Contract)
- Hook-injected paths take precedence; else fall back to `plans/reports/` under active work context
- Concise completion messages, list unresolved questions when relevant
- After implementation, lead states `Docs impact: [none|minor|major]`
- If docs impact exists, update affected docs or call out explicitly in lead handoff

### Task Claiming

- Claim lowest-ID unblocked task first unless lead assigned otherwise
- Check `TaskList` after completing each task for newly unblocked work
- Set task to `in_progress` before starting
- If all blocked, notify lead and offer to help unblock

### Plan Approval Flow

When `plan_mode_required` set:
1. Research and plan approach without editing files
2. Send plan via `ExitPlanMode`
3. Wait for lead's `plan_approval_response`
4. If rejected, revise and resubmit
5. If approved, proceed with implementation

### Conflict Resolution

- Two teammates need same file: escalate to lead immediately
- Teammate's plan rejected twice: lead takes over that task
- Findings conflict between reviewers: lead synthesizes and decides
- Blocked by teammate's incomplete work: message them directly first, then escalate

### Shutdown Protocol

- Approve shutdown unless mid-critical-operation
- Always mark current task completed before approving shutdown
- If rejecting, explain concisely
- Extract `requestId` from shutdown request JSON, pass to `shutdown_response`

### Idle State

- Idle after sending message = normal (waiting for input, not disconnected)
- Sending message to idle teammate wakes them
- Don't treat idle notifications as completion signals

### Discovery

- Read team config at `~/.claude/teams/{team-name}/config.json` to discover teammates
- Always refer by name, not agent ID
- Use names in `SendMessage` recipients and task ownership
