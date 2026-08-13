# {{feature_name}}

**Giai đoạn:** {{phase}} | **STT:** {{order}}
**Chế độ:** {{mode}}
**File đích:** {{target_file}}
**Thời điểm tạo:** {{date}}

---

## 1. Bối cảnh nghiệp vụ

{{business_context}}

---

## 2. Mục tiêu nghiệp vụ

- {{objective_1}}
- {{objective_2}}
- {{objective_3}}

---

## 3. Ảnh hưởng tới các bên liên quan

| Actor | Ảnh hưởng |
|-------|-----------|
| {{actor_1}} | {{impact_1}} |
| {{actor_2}} | {{impact_2}} |

---

## 4. User Stories

| ID | Actor | User Story | Độ ưu tiên |
|----|-------|------------|------------|
| US-001 | {{actor}} | Là {{actor}}, Tôi muốn {{action}} để {{benefit}} | P0 |
| US-002 | {{actor}} | Là {{actor}}, Tôi muốn {{action}} để {{benefit}} | P1 |
| US-003 | {{actor}} | Là {{actor}}, Tôi muốn {{action}} để {{benefit}} | P2 |

> Quick: không cần priority tag (mặc định P0). Standard/Formal: bắt buộc gán [P0-P3].

---

## 5. Tiêu chí chấp nhận

### US-001 — {{tên ngắn}}

- [ ] **AC1:** Given {{context}}, When {{action}}, Then {{expected_result}}
- [ ] **AC2:** Given {{context}}, When {{action}}, Then {{expected_result}}
- [ ] **AC3 (edge case):** Given {{context}}, When {{action}}, Then {{expected_result}}

### US-002 — {{tên ngắn}}

- [ ] **AC1:** Given {{context}}, When {{action}}, Then {{expected_result}}
- [ ] **AC2 (validation):** Given {{context}}, When {{action}}, Then {{expected_result}}

> Dùng Gherkin format (Given/When/Then) nhất quán. Gắn tag `(edge case)`, `(validation)`, `(confirmation)` khi cần.

---

## 6. Luồng nghiệp vụ

### Quy trình hiện tại (AS-IS)

- {{current_step_1}}
- {{current_step_2}}

### Quy trình đề xuất (TO-BE)

1. **Step 1:** {{step_1}}
2. **Step 2:** {{step_2}}
3. **Step 3:** {{step_3}}

### Thay đổi chính (AS-IS → TO-BE)

- **Thêm mới:** {{additions}}
- **Thay đổi:** {{changes}}
- **Loại bỏ:** {{removals}}

### Mapping User Story → Flow

| User Story | Liên quan TO-BE Flow |
|------------|---------------------|
| US-001     | Step X              |
| US-002     | Step Y              |

<!-- Tùy chọn: nếu domain có state transitions -->
<!--
### Trạng thái {{entity}} (State Machine)

| Transition | Trigger | Cascade |
|-----------|---------|---------|
| State A → State B | {{trigger}} | {{cascade_effect}} |
-->

---

## 7. Ràng buộc nghiệp vụ

- {{constraint_1}}
- {{constraint_2}}
- {{constraint_3}}

---

## 8. Giả định

- [ASSUMPTION:{{LOW|MED|HIGH}}] {{assumption_1}}
  → Nếu sai: {{impact}}
  → Cách xác minh: {{validation_method}}

- [ASSUMPTION:{{LOW|MED|HIGH}}] {{assumption_2}}
  → Nếu sai: {{impact}}
  → Cách xác minh: {{validation_method}}

> Bắt buộc gán risk level cho mọi assumption.

---

## 9. Phụ thuộc

- [Dependency] {{dependency_1}}
  → Ảnh hưởng: {{effect_if_missing}}

- [Dependency] {{dependency_2}}
  → Ảnh hưởng: {{effect_if_missing}}

---

## 10. Điểm cần làm rõ

- [Open item] {{open_item_1}}
- [Open item] {{open_item_2}}

---

## Phần tùy chọn

### Stakeholder Map

| Actor | Vai trò | RACI |
|-------|---------|------|
| {{actor}} | {{role_description}} | R/A/C/I |

### Yêu cầu phi chức năng ở mức nghiệp vụ

- **Kỳ vọng hiệu năng:** {{performance_expectation}}
- **Quy mô sử dụng:** {{usage_scale}}
- **Tuân thủ / Audit:** {{compliance_requirement}}

### Ghi chú rủi ro

- [Risk] {{risk_1}}
  → Ảnh hưởng: {{impact}}
  → Khuyến nghị: {{recommendation}}

### Quy trình chi tiết

<!-- Dùng khi có nhiều sub-process cần tách rõ trigger/steps/entry-exit -->

1) **Quy trình {{name}}**
   - Trigger: {{trigger}}
   - Steps: (a) ...; (b) ...; (c) ...
   - Entry/Exit: {{conditions}}
   - US liên quan: {{user_stories}}

---

## Checklist

- [ ] Business context đã phân tích
- [ ] User stories đã định nghĩa
- [ ] Acceptance criteria đã chi tiết
- [ ] Flow AS-IS/TO-BE đã so sánh
- [ ] Ràng buộc nghiệp vụ đã liệt kê
- [ ] Gap analysis hoàn tất
- [ ] Conflict scan với module liên quan
- [ ] Stakeholder Map, Risk Notes, Dependencies đã bổ sung

---

## Danh sách task dự kiến (cho /task-decomposer)

1. {{task_1}}
2. {{task_2}}
3. {{task_3}}

---

## Ghi chú cho BA Agent

- Quick mode: có thể bỏ bớt section không cần thiết, nhưng giữ numbering nếu section tồn tại.
- Standard mode: dùng shared contract làm mặc định; phần tùy chọn chỉ thêm khi giúp làm rõ.
- Formal mode: có thể dùng đầy đủ shared contract + phần tùy chọn + quy trình chi tiết.
- Không ép full-spec nếu requirement nhỏ.
- Không đưa implementation detail vào output.
- Chỉ dùng 4 marker chính: `ASSUMPTION`, `Risk`, `Dependency`, `Open item`.
- Nếu section không áp dụng, bỏ section đó thay vì ghi nội dung rỗng.
- AC dùng Gherkin format nhất quán (Given/When/Then), không mix tiếng Việt/Anh.
- Assumption bắt buộc có risk level tag `[ASSUMPTION:LOW|MED|HIGH]`.
- State Machine section: thêm khi domain có state transitions rõ ràng.
