<!--
DOEL: Product Requirements Document (PRD)

Mục đích:
- Định nghĩa product requirements từ góc độ product manager
- Mô tả user stories, use cases, acceptance criteria
- Bridge giữa business requirements và technical implementation
- Lưu trữ tại docs/product/prd-{feature}.md hoặc analysis/product/prd-{slug}.md

Sử dụng khi:
- Thiết kế feature/product mới
- Product planning và prioritization
- Alignment giữa product, design, engineering
- Định nghĩa acceptance criteria cho development
-->
---
# Mẫu Product Requirements Document (PRD). Điền placeholder → xuất file .md.
report_type: prd
generated_at: ""
source: ""
agent_or_skill: ""
---

# Product Requirements Document: {featureName}

**Status:** {status} | **Author:** {author} | **Priority:** {priority} | **Date:** {generated_at}

**Links:** [BRD](./analysis/business/brd-{slug}.md) · [SRS](./docs/specs/srs-{slug}.md) · [Design Spec](./docs/design/ui-spec-{slug}.md)

---

## 1. Background & Rationale

{backgroundRationale}

**Problem statement:** {problemStatement}

**Why now:** {whyNow}

**Strategic fit:** {strategicFit}

---

## 2. User Stories

{#userStories}
### US-{id}: {storyTitle}
**As a** {userType}, **I want** {action}, **so that** {benefit}.

**Acceptance Criteria:**
{#acceptanceCriteria}
- [ ] {criteria}
{/acceptanceCriteria}

**Priority:** {priority} (P0 / P1 / P2)

**Story points:** {points} · **Sprint:** {sprint}

**Dependencies:** {dependencies}
{/userStories}

---

## 3. Use Cases

{#useCases}
### UC-{id}: {useCaseName}

**Actors:** {actors}

**Preconditions:**
{#preconditions}
- {condition}
{/preconditions}

**Main flow:**
1. {step}
2. {step}

**Alternative flows:**
{#alternativeFlows}
- **{flowName}:** {description}
{/alternativeFlows}

**Postconditions:**
{#postconditions}
- {condition}
{/postconditions}
{/useCases}

---

## 4. Functional Requirements

{#functionalRequirements}
### FR-{id}: {requirementName}
**Description:** {description}

**Priority:** {priority}

**Dependencies:** {dependencies}

**Notes:** {notes}
{/functionalRequirements}

---

## 5. User Experience Requirements

### 5.1. User Interface

{#uiRequirements}
- **{screen/flow}:** {description}
{/uiRequirements}

**Design mocks:** [Figma link]({figmaLink})

### 5.2. User Flows

```mermaid
flowchart TD
{userFlowDiagram}
```

### 5.3. Accessibility

{accessibilityRequirements}

---

## 6. Non-Functional Requirements

| Category | Requirement | Measurement |
|----------|-------------|-------------|
{#nonFunctional}
| {category} | {requirement} | {measurement} |
{/nonFunctional}

---

## 7. Data & Content

### 7.1. Data Requirements

{#dataRequirements}
- **{entity}:** {fields} · Validation: {validation}
{/dataRequirements}

### 7.2. Content Requirements

{#contentRequirements}
- **{content}:** {source} · Update frequency: {frequency}
{/contentRequirements}

---

## 8. Integration Requirements

{#integrations}
| System | Purpose | Type | Priority |
|---------|---------|------|----------|
| {system} | {purpose} | {sync/async} | {priority} |
{/integrations}

---

## 9. Edge Cases & Error Handling

{#edgeCases}
### {caseName}
**Scenario:** {scenario}

**Expected behavior:** {expectedBehavior}

**Error message:** {errorMessage}
{/edgeCases}

---

## 10. Localization & Internationalization

{#l10nRequirements}
- **{aspect}:** {requirement}
{/l10nRequirements}

**Supported languages:** {supportedLanguages}

---

## 11. Success Metrics

| Metric | Baseline | Target | How to Measure |
|--------|----------|--------|----------------|
{#successMetrics}
| {metric} | {baseline} | {target} | {measurement} |
{/successMetrics}

**Post-launch evaluation:** {postLaunchEvaluation}

---

## 12. Phasing & Rollout

### Phase 1: MVP (Release {date})

{#phase1}
- {feature}
{/phase1}

### Phase 2: Enhancements (Release {date})

{#phase2}
- {feature}
{/phase2}

### Phase 3: Future (Release {date})

{#phase3}
- {feature}
{/phase3}

**Feature flags:** {featureFlags}

---

## 13. Out of Scope (Explicitly)

{#outOfScope}
- **{excludedItem}:** {reason} · Planned: {plannedPhase}
{/outOfScope}

---

## 14. Open Questions

{#openQuestions}
- [ ] **{question}:** {impact} — Owner: {owner} — Due: {dueDate}
{/openQuestions}

---

## 15. Change Log

| Version | Date | Changes | Author |
|---------|------|---------|--------|
{#changeLog}
| {version} | {date} | {changes} | {author} |
{/changeLog}
