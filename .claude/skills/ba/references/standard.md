# Standard Mode Reference

## Khi dùng

Dùng `Standard` cho phần lớn feature business bình thường.

Tín hiệu điển hình:
- feature vừa
- có 1–2 workflow
- có business rule, edge case, scope boundary, hoặc dependency cần làm rõ
- cần output đủ chắc để handoff xuống planner / task-decomposer

Ví dụ:
```text
Standard: Quy trình khóa user khi đăng nhập sai nhiều lần
```

---

## Mục tiêu

- cân bằng giữa tốc độ và độ chắc
- hỏi vừa đủ để chốt core business rules
- tránh full ceremony của Formal mode

---

## Flow

1. Intake + context discovery
2. Gap analysis
3. Round 1 tối đa 4 câu
4. Round 2 tối đa 2 câu nếu xuất hiện GAP mới thật sự quan trọng
5. Generate business spec
6. Document
7. Summary + handoff

---

## Question Budget

- round 1: tối đa **4 câu**
- round 2: tối đa **2 câu** nếu cần thật sự
- không có round 3

Rule:
- ambiguity không block output → `Assumption`
- ambiguity block scope/business rule/AC → hỏi

---

## Output Kỳ Vọng

- Business Context
- Business Objectives
- Stakeholder Impact
- 3–5 User Stories
- Acceptance Criteria
- AS-IS / TO-BE
- Constraints
- Assumptions
- Open Items nếu có

Có thể thêm:
- Dependencies
- Risk notes
- NFR mức business nếu requirement đòi hỏi rõ

---

## Bật conditionally

- Feasibility warning
- Dependency notes
- Scope warning
- NFR nếu có nhu cầu rõ

Không bật mặc định:
- Decomposition
- Review gate
- Overlap/conflict validation

---

## Fallback / Escalation

### Standard → Quick
Có thể giữ hoặc simplify về Quick nếu sau gap analysis thấy requirement thật ra rất nhỏ.

### Standard → Formal
Escalate khi phát hiện:
- requirement thực chất là end-to-end workflow lớn
- nhiều actor/sub-process hơn dự kiến
- có legal/compliance/audit concern đáng kể
- stakeholder review là yêu cầu thật sự, không phải nice-to-have

---

## Ví dụ tốt

```text
Standard: Quy trình khóa user khi đăng nhập sai nhiều lần
Standard: Đặc tả rule cho phép quản lý mở lại tài khoản bị khóa
Standard: Cập nhật business doc cho luồng chỉnh sửa hợp đồng với approval một cấp
```

---

## Anti-pattern

Không nên dùng Standard khi:
- user muốn formal review chặt cho epic lớn
- requirement có nhiều bounded sub-flows rõ ràng
- cần stakeholder sign-off trước handoff

---

## Decision Summary

Standard là default mode cân bằng.
Dùng cho đa số feature business có complexity vừa phải.