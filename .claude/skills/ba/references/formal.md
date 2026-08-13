# Formal Mode Reference

## Khi dùng

Dùng `Formal` cho epic hoặc quy trình business lớn cần mức kiểm soát cao hơn.

Tín hiệu điển hình:
- nhiều actor
- nhiều sub-process
- workflow end-to-end
- có legal/compliance/audit concern
- cần stakeholder review rõ ràng trước handoff

Ví dụ:
```text
Formal: Quy trình quản lý vòng đời hợp đồng từ tạo đến thanh lý
```

---

## Mục tiêu

- tạo business spec đầy đủ
- kiểm soát risk tốt hơn
- cho phép decomposition và review gate khi thực sự cần
- hỗ trợ stakeholder alignment cho workflow lớn

---

## Flow

1. Intake
2. Context discovery sâu hơn
3. Decomposition proposal nếu requirement đủ lớn
4. Discovery
5. Feasibility screening
6. Analyze full
7. Overlap/conflict validation nếu có risk rõ
8. Review gate
9. Finalize + handoff

---

## Question Budget

- giống Standard cho discovery
- cộng thêm review questions trong review gate nếu cần
- vẫn tránh hỏi quá mức nếu có thể dùng `Assumption`

---

## Output Kỳ Vọng

- Business Context
- Business Objectives
- Stakeholder Impact
- Stakeholder Map nếu ≥3 actors
- User Stories
- Acceptance Criteria
- AS-IS / TO-BE
- Constraints
- Business NFR
- Dependencies
- Assumptions
- Open Items

---

## Conditional Behaviors

### Decomposition
Chỉ bật khi requirement thực sự đủ lớn để tách thành sub-requirements độc lập.

### Review Gate
Bật trong Formal mode.
- dùng khi output cần stakeholder review rõ ràng
- tối đa 2 revision rounds

### Overlap / Conflict Validation
Chỉ bật khi:
- có existing docs liên quan rõ ràng
- hoặc overlap risk cao
- hoặc user yêu cầu check conflict

Không khẳng định conflict chắc chắn chỉ từ text match thô.

---

## Fallback / Escalation

### Nếu user chọn Formal cho requirement nhỏ
- có thể cảnh báo ngắn rằng `Quick` hoặc `Standard` có thể đủ
- nhưng không tự downgrade nếu user explicit muốn formalize kỹ

### Nếu Formal vẫn chưa đủ
- tách sub-requirements
- làm parent overview + child specs nếu cần

---

## Ví dụ tốt

```text
Formal: Quy trình quản lý vòng đời hợp đồng từ tạo đến thanh lý
Formal: Đặc tả quy trình phê duyệt đầu tư nhiều bước với nhiều vai trò
Formal: Chuẩn hóa toàn bộ quy trình onboard khách hàng doanh nghiệp
```

---

## Anti-pattern

Không nên mặc định dùng Formal cho:
- feature CRUD nhỏ
- business rule đơn lẻ
- thay đổi nhẹ trong existing flow

Formal chỉ nên dùng khi complexity và risk đủ lớn để justify ceremony.

---

## Decision Summary

Formal = mode kiểm soát cao nhất.
Dùng khi cần depth, risk coverage, decomposition, hoặc stakeholder review nghiêm túc.