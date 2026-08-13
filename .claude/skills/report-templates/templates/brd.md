<!--
DOEL: Business Requirements Document (BRD)

Mục đích:
- Tài liệu hóa yêu cầu kinh doanh từ phía business stakeholders
- Định nghĩa business problems, objectives, KPIs, scope
- Cầu nối giữa business và technical teams
- Lưu trữ tại docs/business/brd-{slug}.md

Sử dụng khi:
- Bắt đầu project mới cần business context
- Business yêu cầu feature phức tạp cần phân tích
- Cần alignment giữa business và technical teams
- Định nghĩa success metrics cho project/feature
-->
---
# Mẫu Business Requirements Document (BRD). Điền placeholder → xuất file .md.
report_type: Business Requirements Document
generated_at: ""
source: ""
agent_or_skill: ""
---

# Business Requirements Document: {projectName}

**Trạng thái:** {status} | **Tác giả:** {author} | **Phiên bản:** {version} | **Ngày:** {generated_at}

**Liên kết:** [PRD](./docs/project-overview-pdr.md) · [SRS](./docs/specs/srs-{slug}.md) · [Kiến trúc](./docs/system-architecture.md)

---

## 1. Tóm tắt điều hành

{executiveSummary}

**Tác động kinh doanh:** {businessImpact}

---

## 2. Bối cảnh kinh doanh

### 2.1. Trạng thái hiện tại (As-Is)

{currentStateDescription}

{#currentPainPoints}
- **{painPoint}:** {description} · Tác động: {impactLevel}
{/currentPainPoints}

### 2.2. Trạng thái mong muốn (To-Be)

{desiredStateDescription}

**Giá trị đề xuất:** {valueProposition}

---

## 3. Mục tiêu kinh doanh

{#objectives}
### OBJ-{id}: {objectiveName}
**Mô tả:** {description}

**Tiêu chí thành công:** {successCriteria}

**Độ ưu tiên:** {priority} (P0 / P1 / P2)
{/objectives}

---

## 4. Đối tượng mục tiêu & Các bên liên quan

### 4.1. Người dùng chính

| Loại người dùng | Persona | Mục tiêu | Điểm đau |
|-----------------|---------|---------|----------|
{#primaryUsers}
| {userType} | {persona} | {goals} | {painPoints} |
{/primaryUsers}

### 4.2. Các bên liên quan

| Vai trò | Trách nhiệm | Mức độ quan tâm |
|---------|-------------|-----------------|
{#stakeholders}
| {role} | {responsibility} | {interestLevel} |
{/stakeholders}

---

## 5. Phạm vi

### 5.1. Trong phạm vi

{#inScope}
- **{feature}:** {description}
{/inScope}

### 5.2. Ngoài phạm vi (Được loại trừ rõ ràng)

{#outOfScope}
- **{excludedItem}:** {reason}
{/outOfScope}

### 5.3. Giai đoạn tương lai

{#futurePhases}
- **{phase}:** {description} · Mục tiêu: {targetTimeline}
{/futurePhases}

---

## 6. Quy tắc kinh doanh

{#businessRules}
### BR-{id}: {ruleName}
**Quy tắc:** {ruleDescription}

**Cơ sở:** {rationale}

**Tác động kinh doanh nếu vi phạm:** {impact}
{/businessRules}

---

## 7. Chỉ số hiệu quả chính (KPIs)

| KPI | Hiện tại | Mục tiêu | Phương pháp đo lường | Tần suất |
|-----|---------|--------|----------------------|----------|
{#kpis}
| {kpiName} | {currentValue} | {targetValue} | {measurementMethod} | {frequency} |
{/kpis}

**Kỳ vọng ROI:** {roiExpectations}

---

## 8. Ràng buộc & Giả định

### 8.1. Ràng buộc kinh doanh

{#businessConstraints}
- **{constraint}:** {description}
{/businessConstraints}

### 8.2. Giả định

{#assumptions}
- **{assumption}:** {description} · Rủi ro nếu sai: {riskLevel}
{/assumptions}

---

## 9. Rủi ro & Giảm thiểu

| Rủi ro | Xác suất | Tác động | Chiến lược giảm thiểu | Người phụ trách |
|--------|----------|----------|----------------------|----------------|
{#risks}
| {riskDescription} | {probability} (Cao/Trung bình/Thấp) | {impactLevel} | {mitigation} | {owner} |
{/risks}

---

## 10. Ngân sách & Lộ trình

### 10.1. Ước tính ngân sách

| Hạng mục | Ước tính | Ghi chú |
|----------|----------|---------|
{#budget}
| {category} | {amount} | {notes} |
{/budget}

### 10.2. Kỳ vọng lộ trình

**Ngày ra mắt mục tiêu:** {targetLaunchDate}

**Các cột mốc quan trọng:**
{#milestones}
- **{milestone}:** {date}
{/milestones}

---

## 11. Phụ thuộc

### 11.1. Phụ thuộc kinh doanh

{#businessDeps}
- **{dependency}:** {description} · Trạng thái: {status}
{/businessDeps}

### 11.2. Phụ thuộc kỹ thuật

{#technicalDeps}
- **{dependency}:** {description} · Trạng thái: {status}
{/technicalDeps}

---

## 12. Phê duyệt & Sign-off

| Bên liên quan | Vai trò | Phê duyệt | Ngày | Ghi chú |
|---------------|---------|-----------|------|---------|
{#approvals}
| {name} | {role} | [ ] Đã duyệt / [ ] Hoãn lại | {date} | {comments} |
{/approvals}

---

## 13. Câu hỏi mở

{#openQuestions}
- [ ] **{question}:** {details} — Người phụ trách: {owner} — Hạn: {dueDate}
{/openQuestions}

---

## Phụ lục

### A. Thuật ngữ

{#glossary}
- **{term}:** {definition}
{/glossary}

### B. Tham khảo

{#references}
- [{title}]({url}): {notes}
{/references}
