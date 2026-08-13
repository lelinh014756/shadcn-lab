<!--
DOEL: Architecture Blueprint

Mục đích:
- Tài liệu hóa kiến trúc tổng thể của hệ thống
- Mô tả components, data flows, non-functional requirements
- Link đến living docs và ADR records
- Lưu trữ tại docs/architecture/blueprint.md hoặc plans/architecture-{system}.md

Sử dụng khi:
- Thiết kế kiến trúc hệ thống mới
- Review kiến trúc hiện tại
- Technical discussions với stakeholders
- Onboarding kiến trúc cho team
-->
---
# Mẫu Blueprint / Architecture Overview. Điền placeholder → xuất file .md.
report_type: architecture-blueprint
generated_at: ""
source: ""
agent_or_skill: ""
---

# Architecture Blueprint: {systemName}

**Status:** {status} | **Version:** {version} | **Last Updated:** {generated_at}

**Links to living docs:** [System Architecture](./docs/system-architecture.md) · [ADR log](./docs/adr/) · [API Contract](./docs/api-docs.md)

---

## 1. Tổng quan hệ thống

{systemDescription}

**Quy mô:** {projectScale} (MVP / Scale / Enterprise)

**Scope:** {scope}

**Out of scope:** {outOfScope}

## 2. Kiến trúc tổng thể

{#architectureDiagram}
```mermaid
{diagramCode}
```
{/architectureDiagram}

### Các thành phần chính

| Thành phần | Trách nhiệm | Technology |
|-----------|-------------|-----------|
{#components}
| {name} | {responsibility} | {tech} |
{/components}

### Boundary & giao tiếp

{boundaryDescription}

## 3. Luồng dữ liệu chính

{#dataFlows}
### {flowName}
{flowDescription}

```mermaid
sequenceDiagram
{sequenceCode}
```
{/dataFlows}

## 4. Non-functional Requirements

| Yêu cầu | Target | Ghi chú |
|---------|--------|---------|
| Availability | {availability} | |
| Latency (P99) | {latencyP99} | |
| Throughput | {throughput} | |
| Security | {securityLevel} | |

## 5. Dependencies

### Internal
{#internalDeps}
- {name}: {usage}
{/internalDeps}

### External / 3rd-party
{#externalDeps}
- {name}: {usage} · Status: {status}
{/externalDeps}

## 6. Trade-offs & Decisions

| Quyết định | Lý do | ADR |
|-----------|-------|-----|
{#decisions}
| {decision} | {rationale} | [ADR-{adrId}](./docs/adr/ADR-{adrId}-{adrSlug}.md) |
{/decisions}

## 7. Phần deferred / chưa xử lý

{#deferred}
- **{topic}:** {description} — Target: {targetPhase}
{/deferred}

## 8. Open Questions

{#openQuestions}
- [ ] {question}
{/openQuestions}
