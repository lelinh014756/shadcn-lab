<!--
DOEL: Generic Plan Template

Mục đích:
- Template tổng quát cho kế hoạch (implementation, migration, rollout)
- Có phases, tasks, success criteria, timeline, dependencies, risks
- Lưu trữ tại plans/{topic}-{name}.md

Sử dụng khi:
- Feature implementation plans
- Migration strategies
- Rollout plans
- Refactoring roadmaps
-->
---
report_type: "{topic}"
generated_at: ""
source: ""
agent_or_skill: ""
---

# {title}

## Objective
{objective}

## Scope
{scope}

## Phases

{#phases}

### Phase {phaseNumber}: {phaseName}
- **Status:** {status}
- **Priority:** {priority}
- **Description:** {description}

#### Tasks
{#tasks}
- [ ] {task}
{/tasks}

#### Success Criteria
{#criteria}
- {criterion}
{/criteria}

{/phases}

## Timeline
{timeline}

## Dependencies
{#dependencies}
- {dependency}
{/dependencies}

## Risks
{#risks}
- **{risk}**: {mitigation}
{/risks}

## Resources
{#resources}
- {resource}
{/resources}
