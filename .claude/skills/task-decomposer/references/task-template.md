## TASK: {{TITLE}}

### Metadata

- ID : TASK-{{NNN}}
- Role : {{ROLE}}
- Assignee : UNASSIGNED
- Reviewer : UNASSIGNED
- Ước lượng : {{ESTIMATE_SP}} SP — {{DIFFICULTY}}
- Manday : {{MANDAY}} MD
- Ưu tiên : {{PRIORITY}}
- Blocks : {{BLOCKS}}
- Blocked by : {{BLOCKED_BY}}

---

### Context

<!-- Tại sao task này tồn tại? Business driver? -->

{{CONTEXT}}

---

### Description

{{DESCRIPTION}}

---

### Technical Context

<!-- BẮT BUỘC nếu Estimate ≥ 3 SP | Chỉ điền các field thực sự liên quan, bỏ qua field không áp dụng -->

{{TECHNICAL_CONTEXT}} - Kỹ thuật

<!--
Các field gợi ý (dùng những cái phù hợp, bỏ những cái không áp dụng):
- **Files to modify:** `src/...`
- **Pattern/Convention:** theo `<pattern>` như ở `<reference-file>`
- **API contract:** `<METHOD> <path>` → response schema
- **DB entities:** `<EntityName>` trong `Domain/Entities/`
-->

---

### Implementation Hints - Gợi ý thực hiện

<!-- Key decisions — không phải step-by-step guide -->

{{IMPLEMENTATION_HINTS}}

---

### Acceptance Criteria

- [ ] {{AC_1}}
- [ ] {{AC_2}}
- [ ] Compile thành công, không có warning mới

---

### Test Requirements

- [ ] Unit test Service layer (coverage ≥ 80%)
- [ ] {{TEST_CASES}}
- [ ] Integration test nếu có DB/external call

---

### Output Artifacts

- Endpoint: `{{ENDPOINT}}` trả đúng schema (nếu có)
- Files created/modified: `{{ARTIFACT_FILES}}`
- Migration: {{MIGRATION}}

---

### Notes

{{NOTES}}
