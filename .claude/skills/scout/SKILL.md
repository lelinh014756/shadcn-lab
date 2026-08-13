---
name: scout
description: "Fast codebase scouting using parallel agents. Use for file discovery, task context gathering, quick searches across directories. Supports internal (Explore) and external (Gemini/OpenCode) agents."
version: 1.1.0
argument-hint: "[search-target] [ext]"
---

# Scout

Fast, token-efficient codebase scouting using parallel agents to find files needed for tasks.

## Arguments

- Default: Scout using built-in Explore subagents in parallel (`./references/internal-scouting.md`)
- `ext`: Scout using external Gemini/OpenCode CLI tools in parallel (`./references/external-scouting.md`)

## When to Use

- Beginning work on feature spanning multiple directories
- User mentions needing to "find", "locate", or "search for" files
- Starting debugging session requiring file relationships understanding
- User asks about project structure or where functionality lives
- Before changes that might affect multiple codebase parts

## Codebase Reading Strategy (MANDATORY)

**File Read Policy:** Không đọc lại file chưa thay đổi. Đã đọc trong session → reuse context. Cần 1 section → Grep/Read offset. Delegate subagent → pass content trong prompt, không bắt tự đọc lại.

When scouting for analysis/understanding (not just file discovery), follow this priority to minimize token waste:

1. **Directory tree first**: `ls -R` or `Bash("find . -type f -name '*.cs' | head -60")` → understand layout without reading content
2. **Repomix MCP preferred**: If available, use `grep_repomix_output("pattern")` → `read_repomix_output(lineRange)` to search and read specific code sections. Only `pack_codebase` if repomix output is stale.
3. **1 representative flow**: Pick 1 feature, trace Controller → Handler/Service → Repository → Entity end-to-end (~5 files). This gives 80% architecture understanding at 20% cost.
4. **DI/wiring files**: `Program.cs`, `*DependencyInjection*.cs` → understand how layers connect.
5. **Existing docs**: Read `docs/` directory — architecture/standards may already be documented.
6. **Max ~10-15 files** for analysis tasks. DO NOT read every file in every folder.

**Why:** Reading 50+ files wastes tokens and time. 1 full flow + tree structure is sufficient for most analysis tasks.

### Mandatory Ignore Patterns (CRITICAL)

**NEVER scan these directories** — they contain build artifacts, not source code:

| Tech Stack | Ignore Patterns |
|------------|-----------------|
| **.NET** | `bin/`, `obj/`, `.vs/`, `.vscode/`, `TestResults/`, `Coverage/`, `*.g.cs` |
| **Node/JS** | `node_modules/`, `dist/`, `build/`, `.next/`, `.nuxt/`, `*.min.js` |
| **Python** | `__pycache__/`, `.venv/`, `venv/`, `.pytest_cache/`, `*.pyc` |
| **Rust** | `target/`, `Cargo.lock` |
| **Java** | `target/`, `*.class`, `.gradle/`, `.mvn/` |
| **Go** | `vendor/`, `*.sum` |
| **Git** | `.git/`, `.github/` (unless explicitly scouting workflows) |
| **IDE** | `.idea/`, `.DS_Store`, `*.swp`, `*.swo` |

**Implementation:**
- Glob: Use `glob` parameter's built-in ignore
- Grep: Add `--glob='!bin/**' --glob='!obj/**'`
- Bash: `find -type f -not -path "*/bin/*" -not -path "*/obj/*"`
- Subagent prompts: Explicitly list ignore patterns in instructions

## Quick Start

1. Analyze user prompt to identify search targets
2. Use a wide range of Grep and Glob patterns to find relevant files and estimate scale of the codebase
3. Prefer Repomix MCP over individual file reads when analyzing code content
4. Spawn parallel agents with divided directories (only when file discovery at scale is needed)
5. Collect results into concise report

## Configuration

Read from `.claude/.ck.json`:

- `gemini.model` - Gemini model (default: `gemini-3-flash-preview`)

## Workflow

### 1. Analyze Task

- Parse user prompt for search targets
- Identify key directories, patterns, file types, lines of code
- Determine optimal SCALE value of subagents to spawn

### 2. Divide and Conquer

- Split codebase into logical segments per agent
- Assign each agent specific directories or patterns
- Ensure no overlap, maximize coverage

### 3. Register Scout Tasks

- **Skip if:** Agent count ≤ 2 (overhead exceeds benefit)
- `TaskList` first — check for existing scout tasks in session
- If not found, `TaskCreate` per agent with scope metadata
- See `references/task-management-scouting.md` for patterns and examples

### 4. Spawn Parallel Agents

Load appropriate reference based on decision tree:

- **Internal (Default):** `references/internal-scouting.md` (Explore subagents)
- **External:** `references/external-scouting.md` (Gemini/OpenCode)

**Notes:**

- `TaskUpdate` each task to `in_progress` before spawning its agent
- Prompt detailed instructions for each subagent with exact directories or files it should read
- Remember that each subagent has less than 200K tokens of context window
- Amount of subagents to-be-spawned depends on the current system resources available and amount of files to be scanned
- Each subagent must return a detailed summary report to a main agent

### 5. Collect Results

- Timeout: 3 minutes per agent (skip non-responders)
- `TaskUpdate` completed tasks; log timed-out agents in report
- Aggregate findings into single report
- List unresolved questions at end

## Report Format

```markdown
# Scout Report

## Relevant Files

- `path/to/file.ts` - Brief description
- ...

## Unresolved Questions

- Any gaps in findings
```

## References

- `references/internal-scouting.md` - Using Explore subagents
- `references/external-scouting.md` - Using Gemini/OpenCode CLI
- `references/task-management-scouting.md` - Claude Task patterns for scout coordination
