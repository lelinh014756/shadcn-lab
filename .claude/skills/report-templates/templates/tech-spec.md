<!--
DOEL: Technical Specification (SRS)

Mục đích:
- Chi tiết kỹ thuật cho feature/module implementation
- Định nghĩa business rules, flows, API contracts, DB changes, test strategy
- Lưu trữ tại docs/specs/tech-spec-{feature}.md hoặc plans/specs/{feature}.md

Sử dụng khi:
- Implement features phức tạp
- Code reviews cần spec reference
- Cross-team implementation coordination
- QA testing specification
-->
---
# Mẫu Technical Spec / SRS. Điền placeholder → xuất file .md.
report_type: tech-spec
generated_at: ""
source: ""
agent_or_skill: ""
---

# Technical Spec: {featureName}

**Status:** {status} | **Author:** {author} | **Date:** {generated_at}

**Links:** [PRD](./docs/project-overview-pdr.md) · [Architecture](./docs/system-architecture.md) · [API Contract](./docs/api-docs.md)

---

## 1. Mục tiêu & phạm vi

{objective}

**In scope:** {inScope}

**Out of scope:** {outOfScope}

## 2. Business Rules

{#businessRules}
### BR-{id}: {name}
**Rule:** {ruleDescription}

**Input:** {input}

**Output / Behavior:** {output}

**Edge cases:**
{#edgeCases}
- {edgeCase}
{/edgeCases}
{/businessRules}

## 3. Luồng xử lý

{#flows}
### {flowName}

```mermaid
flowchart TD
{flowCode}
```

{flowDescription}
{/flows}

## 4. API / Interface

{#apiChanges}
| Method | Path | Mô tả |
|--------|------|-------|
| {method} | {path} | {description} |
{/apiChanges}

*Chi tiết đầy đủ: xem API Contract.*

## 5. Data / DB Changes

{#dbChanges}
- **{tableName}:** {changeDescription}
{/dbChanges}

## 6. Non-functional

| Yêu cầu | Target |
|---------|--------|
| Performance | {performance} |
| Security / AuthZ | {security} |
| Backward compatibility | {backwardCompat} |
| Idempotency / Retry | {idempotency} |

## 7. Observability

- **Logs:** {logEvents}
- **Metrics:** {metrics}
- **Traces:** {traces}

## 8. Test Strategy

{#testCases}
- [ ] {testCase} — Type: {type} | Priority: {priority}
{/testCases}

## 9. Migration / Rollout

{migrationPlan}

**Feature flag:** {featureFlag}

**Rollback plan:** {rollbackPlan}

## 10. Open Questions

{#openQuestions}
- [ ] {question} — Owner: {owner}
{/openQuestions}
