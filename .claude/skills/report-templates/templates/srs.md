<!--
DOEL: Software Requirements Specification (SRS)

Mục đích:
- Tài liệu hóa yêu cầu phần mềm chi tiết cho development team
- Định nghĩa functional/non-functional requirements, interfaces, constraints
- Input trực tiếp cho technical design và implementation
- Lưu trữ tại docs/specs/srs-{feature}.md hoặc plans/specs/{YYMMDD}-srs-{slug}.md

Sử dụng khi:
- Thiết kế hệ thống/phần mềm mới
- Cần spec chi tiết cho development
- Contract requirements với vendors/outsourcing
- Baseline cho testing và validation
-->
---
# Mẫu Software Requirements Specification (SRS). Điền placeholder → xuất file .md.
report_type: srs
generated_at: ""
source: ""
agent_or_skill: ""
---

# Software Requirements Specification: {systemName}

**Status:** {status} | **Version:** {version} | **Author:** {author} | **Date:** {generated_at}

**Links:** [BRD](./analysis/business/brd-{slug}.md) · [PRD](./docs/product/prd-{slug}.md) · [Tech Spec](./docs/specs/tech-spec-{slug}.md) · [Architecture](./docs/system-architecture.md)

---

## 1. Introduction

### 1.1. Purpose

{purpose}

### 1.2. Document Scope

{documentScope}

### 1.3. Definitions, Acronyms, Abbreviations

| Term | Definition |
|------|------------|
{#glossary}
| {term} | {definition} |
{/glossary}

### 1.4. References

{#references}
- [{title}]({url}): {notes}
{/references}

### 1.5. Overview

{overview}

---

## 2. Overall Description

### 2.1. Product Perspective

{productPerspective}

**System boundaries:**
```mermaid
graph TD
{systemContextDiagram}
```

### 2.2. Product Functions

{#productFunctions}
- **{function}:** {description}
{/productFunctions}

### 2.3. User Characteristics

| User Type | Skill Level | Goals | Constraints |
|-----------|-------------|-------|-------------|
{#userCharacteristics}
| {userType} | {skillLevel} | {goals} | {constraints} |
{/userCharacteristics}

### 2.4. Constraints

{#constraints}
- **{constraintType}:** {description}
{/constraints}

### 2.5. Assumptions and Dependencies

{#assumptions}
- **{assumption}:** {description} · Risk if invalid: {risk}
{/assumptions}

---

## 3. Specific Requirements

### 3.1. Functional Requirements

{#functionalRequirements}
#### FR-{id}: {requirementName}
**Description:** {detailedDescription}

**Input:** {inputSpecification}

**Processing:** {processingLogic}

**Output:** {outputSpecification}

**Priority:** {priority} (Essential / Conditional / Optional)

**Verification method:** {verificationMethod}
{/functionalRequirements}

### 3.2. Non-Functional Requirements

#### 3.2.1. Performance Requirements

| Requirement | Metric | Target | Measurement |
|-------------|--------|--------|-------------|
{#performance}
| {requirement} | {metric} | {target} | {measurement} |
{/performance}

#### 3.2.2. Security Requirements

{#security}
- **{requirement}:** {specification}
{/security}

#### 3.2.3. Reliability & Availability

| Requirement | Target | Failure Definition |
|-------------|--------|--------------------|
{#reliability}
| {requirement} | {target} | {failureDefinition} |
{/reliability}

#### 3.2.4. Maintainability

{#maintainability}
- **{requirement}:** {specification}
{/maintainability}

#### 3.2.5. Scalability

{#scalability}
- **{requirement}:** {specification}
{/scalability}

#### 3.2.6. Usability

{#usability}
- **{requirement}:** {specification}
{/usability}

---

## 4. External Interface Requirements

### 4.1. User Interfaces

{#userInterfaces}
- **{interface}:** {description} · Platform: {platform}
{/userInterfaces}

### 4.2. Hardware Interfaces

{#hardwareInterfaces}
- **{interface}:** {description} · Protocol: {protocol}
{/hardwareInterfaces}

### 4.3. Software Interfaces

{#softwareInterfaces}
| System | Interface Type | Protocol | Data Format |
|--------|----------------|----------|-------------|
| {system} | {type} | {protocol} | {format} |
{/softwareInterfaces}

### 4.4. Communication Interfaces

{#communicationInterfaces}
- **{interface}:** {specification}
{/communicationInterfaces}

---

## 5. System Features

{#systemFeatures}
### Feature {id}: {featureName}

**Description:** {description}

**Stimulus/Response:**
{#stimulusResponse}
| Stimulus | Response |
|----------|----------|
| {stimulus} | {response} |
{/stimulusResponse}

**Functional requirements:**
- FR-{frRef1}, FR-{frRef2}

**Related use cases:** UC-{ucRef}
{/systemFeatures}

---

## 6. Data Requirements

### 6.1. Data Entities

{#dataEntities}
#### {entityName}

| Attribute | Type | Length | Constraints | Description |
|-----------|------|--------|-------------|-------------|
| {attribute} | {type} | {length} | {constraints} | {description} |

**Relationships:** {relationships}
{/dataEntities}

### 6.2. Data Dictionary

{#dataDictionary}
| Element | Type | Format | Range | Description |
|---------|------|--------|-------|-------------|
| {element} | {type} | {format} | {range} | {description} |
{/dataDictionary}

### 6.3. Data Persistence

{#dataPersistence}
- **{entity}:** Storage: {storage} · Retention: {retention} · Backup: {backup}
{/dataPersistence}

---

## 7. Logic & Computational Requirements

{#logicRequirements}
### {logicName}

**Algorithm/Logic:** {logicDescription}

**Input parameters:**
| Parameter | Type | Required | Validation |
|-----------|------|----------|------------|
| {parameter} | {type} | {required} | {validation} |

**Output:** {outputSpecification}

**Error conditions:** {errorConditions}
{/logicRequirements}

---

## 8. Compliance & Regulatory

{#compliance}
- **{standard/regulation}:** {requirements} · Verification: {verification}
{/compliance}

---

## 9. Quality Attributes

| Attribute | Importance | Measurement | Target |
|-----------|------------|-------------|--------|
{#qualityAttributes}
| {attribute} | {importance} | {measurement} | {target} |
{/qualityAttributes}

---

## 10. Design Constraints

### 10.1. Technology Constraints

{#techConstraints}
- **{constraint}:** {impact} · Rationale: {rationale}
{/techConstraints}

### 10.2. Architectural Constraints

{#archConstraints}
- **{constraint}:** {specification}
{/archConstraints}

---

## 11. Verification Requirements

| Requirement ID | Verification Method | Test Cases | Responsibility |
|----------------|---------------------|------------|----------------|
{#verification}
| FR-{id} | {method} (Inspection/Analysis/Demonstration/Test) | {testCases} | {responsible} |
{/verification}

---

## 12. Appendices

### Appendix A: Requirements Traceability

| Requirement | Source | Priority | Status | Assigned To |
|-------------|--------|----------|--------|-------------|
{#traceability}
| FR-{id} | {source} | {priority} | {status} | {assignee} |
{/traceability}

### Appendix B: Requirements prioritization

**MoSCoW Analysis:**
- **Must have:** {mustHaveList}
- **Should have:** {shouldHaveList}
- **Could have:** {couldHaveList}
- **Won't have:** {wontHaveList}

### Appendix C: Open Issues

{#openIssues}
- [ ] **{issue}:** {description} · Impact: {impact} · Owner: {owner}
{/openIssues}

### Appendix D: Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
{#revisionHistory}
| {version} | {date} | {author} | {changes} |
{/revisionHistory}
