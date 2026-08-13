<!--
DOEL: Feature Specification / Functional Spec

Mục đích:
- Tài liệu hóa chi tiết một feature cụ thể cho implementation
- Bridge giữa high-level requirements và code implementation
- Định nghĩa scope, acceptance criteria, technical considerations
- Lưu trữ tại docs/specs/feature-{slug}.md hoặc plans/specs/{YYMMDD}-feature-{slug}.md

Sử dụng khi:
- Implement một feature mới
- Giao tiếp requirements cho dev team
- Review và approval feature trước development
- Baseline cho QA testing
-->
---
# Mẫu Feature Specification / Functional Spec. Điền placeholder → xuất file .md.
report_type: feature-spec
generated_at: ""
source: ""
agent_or_skill: ""
---

# Feature Specification: {featureName}

**Status:** {status} | **Author:** {author} | **Sprint:** {sprint} | **Date:** {generated_at}

**Links:** [PRD](./docs/product/prd-{slug}.md) · [Tech Spec](./docs/specs/tech-spec-{slug}.md) · [Tickets](JIRA/Backlog link)

---

## 1. Feature Overview

### 1.1. Summary

{featureSummary}

**One-line description:** {oneLiner}

**Value proposition:** {valueProposition}

### 1.2. Goals

{#goals}
- **{goal}:** {description}
{/goals}

### 1.3. Non-goals (Explicitly Out of Scope)

{#nonGoals}
- **{excludedItem}:** {reason}
{/nonGoals}

---

## 2. User Stories

{#userStories}
### US-{id}: {storyTitle}
**As a** {userType}, **I want** {action}, **so that** {benefit}.

**Size:** {storyPoints} SP · **Priority:** {priority}

**Acceptance Criteria:**
{#acceptanceCriteria}
- [ ] {criteria}
{/acceptanceCriteria}

**Dependencies:** {dependencies}
{/userStories}

---

## 3. Functional Requirements

### 3.1. Core Functionality

{#coreRequirements}
#### FR-{id}: {requirement}
**Description:** {description}

**Behavior:** {behaviorSpecification}

**Priority:** {priority} (Must / Should / Could)
{/coreRequirements}

### 3.2. Edge Cases

{#edgeCases}
#### {caseName}
**Scenario:** {scenario}

**Expected behavior:** {expectedBehavior}

**Rationale:** {rationale}
{/edgeCases}

### 3.3. Error Handling

{#errorHandling}
| Error Scenario | User Message | System Action |
|----------------|--------------|---------------|
| {scenario} | {message} | {action} |
{/errorHandling}

---

## 4. User Experience

### 4.1. User Flow

```mermaid
flowchart TD
{userFlowCode}
```

### 4.2. Screen/Component Specifications

{#screens}
#### {screenName}

**Purpose:** {purpose}

**Elements:**
| Element | Type | Behavior | Validation |
|---------|------|----------|------------|
| {element} | {type} | {behavior} | {validation} |

**States:**
| State | Condition | UI Behavior |
|-------|-----------|-------------|
| {state} | {condition} | {uiBehavior} |

**Design specs:** [Figma/Sketch link]({designLink})
{/screens}

### 4.3. Responsive Behavior

{#responsiveBehavior}
- **{breakpoint}:** {adaptation}
{/responsiveBehavior}

---

## 5. Technical Considerations

### 5.1. API Requirements

{#apiRequirements}
| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| {endpoint} | {method} | {purpose} | {authRequired} |

**Request/Response examples:**
```json
{apiExample}
```
{/apiRequirements}

### 5.2. Data Model Changes

{#dataModelChanges}
#### {entityName}

**New fields:**
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| {field} | {type} | {required} | {default} | {description} |

**Migration required:** {migrationRequired}
{/dataModelChanges}

### 5.3. Technical Dependencies

{#techDeps}
- **{dependency}:** {version} · Purpose: {purpose}
{/techDeps}

### 5.4. Performance Considerations

{#performance}
- **{concern}:** {mitigation} · Target: {target}
{/performance}

---

## 6. Business Rules

{#businessRules}
### BR-{id}: {ruleName}
**Rule:** {ruleStatement}

**Conditions:**
- IF {condition} THEN {action}

**Exceptions:**
- {exception}: {handling}
{/businessRules}

---

## 7. Configuration & Settings

{#configuration}
| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| {setting} | {type} | {default} | {description} |

**Feature flag:** {featureFlagName} · Default: {defaultValue}
{/configuration}

---

## 8. Localization

{#localization}
- **{text}:** {key} · Max length: {maxLength} · Context: {context}
{/localization}

**Languages supported:** {supportedLanguages}

---

## 9. Accessibility

{#accessibility}
- **{requirement}:** {conformanceLevel} (WCAG 2.1 A/AA/AAA)
{/accessibility}

**Screen reader support:** {screenReaderSupport}

---

## 10. Analytics & Tracking

{#analytics}
| Event | Properties | When to Fire |
|-------|------------|--------------|
| {eventName} | {properties} | {trigger} |
{/analytics}

**Privacy considerations:** {privacyConsiderations}

---

## 11. Testing Requirements

### 11.1. Test Scenarios

{#testScenarios}
#### {scenarioName}
**Type:** {type} (Unit / Integration / E2E / Performance)

**Steps:**
1. {step}
2. {step}

**Expected result:** {expectedResult}
{/testScenarios}

### 11.2. Test Data

{#testData}
| Scenario | Data Set | Expected Outcome |
|----------|----------|------------------|
| {scenario} | {dataSet} | {outcome} |
{/testData}

---

## 12. Launch & Rollout

### 12.1. Rollout Plan

{#rolloutPlan}
**Phase {phaseNumber}:** {description} · Date: {date} · Users: {userSegment}
{/rolloutPlan}

**Feature flag strategy:** {featureFlagStrategy}

### 12.2. Rollback Plan

{#rollbackPlan}
**Trigger conditions:**
{#rollbackTriggers}
- {trigger}: {threshold}
{/rollbackTriggers}

**Rollback steps:**
1. {step}
2. {step}
{/rollbackPlan}

---

## 13. Success Metrics

| Metric | Baseline | Target | Measurement |
|--------|----------|--------|-------------|
{#successMetrics}
| {metric} | {baseline} | {target} | {measurement} |
{/successMetrics}

**Post-launch review date:** {reviewDate}

---

## 14. Dependencies & Blocking

### 14.1. Blocked By

{#blockedBy}
- **{dependency}:** {status} · ETA: {eta}
{/blockedBy}

### 14.2. Blocking

{#blocking}
- **{blockedItem}:** {impact}
{/blocking}

---

## 15. Open Questions

{#openQuestions}
- [ ] **{question}:** {details} — Owner: {owner} — Due: {dueDate}
{/openQuestions}

---

## 16. Approval

| Role | Name | Approval | Date | Comments |
|------|------|----------|------|----------|
{#approval}
| {role} | {name} | [ ] Approved | {date} | {comments} |
{/approval}

---

## 17. Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
{#changeLog}
| {version} | {date} | {author} | {changes} |
{/changeLog}
