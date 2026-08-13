<!--
DOEL: Project Roadmap

Mục đích:
- Bản đồ roadmap cho toàn bộ dự án
- Tập trung vào phases, milestones, timeline, risk at milestones
- File đơn lẻ: docs/project-roadmap.md
-->
---
report_type: project-roadmap
generated_at: ""
source: ""
agent_or_skill: ""
---

# Project Roadmap: {projectName}

## 1. Overview
{overview}

## 2. Strategy & Themes
{#themes}
- **{theme}** — {description}
{/themes}

## 3. Timeline by Phase
{#phases}
### Phase {order}: {name}

- **Goal:** {goal}
- **Start:** {startDate} · **End:** {endDate}
- **Owner:** {owner}

#### Scope
{#scopeItems}
- {item}
{/scopeItems}

#### Dependencies
{#dependencies}
- {dependency}
{/dependencies}

#### Risks
{#risks}
- **{risk}** — Impact: {impact}, Likelihood: {likelihood}, Mitigation: {mitigation}
{/risks}

#### Success Criteria
{#successCriteria}
- {criterion}
{/successCriteria}

---
{/phases}

## 4. Release Plan
{#releases}
### Release {version}: {name}

- **Target Date:** {targetDate}
- **Type:** {type} (Major / Minor / Patch / Experiment)
- **Key Features:**
{#features}
  - {feature}
{/features}
{/releases}

## 5. Environment & Rollout Strategy
{rolloutStrategy}

## 6. Monitoring & Feedback Loops
{monitoringAndFeedback}

## 7. Change Log
{#changelog}
- {date}: {change} — {author}
{/changelog}

