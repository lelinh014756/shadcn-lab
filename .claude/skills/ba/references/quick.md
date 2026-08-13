# Quick Mode Reference

## Khi dùng

Dùng `Quick` khi requirement nhỏ, tương đối rõ, và không cần full BA flow.

Tín hiệu điển hình:
- 1 actor chính
- 1 workflow chính
- business rule đơn giản hoặc đã rõ
- ambiguity còn lại không block scope, business rule, hoặc AC

Ví dụ:
```text
Quick: Admin có thể deactivate user
```

---

## Mục tiêu

- formalize nhanh
- ít câu hỏi nhất có thể
- ưu tiên assumption thay vì ceremony
- tạo artifact đủ cho handoff nhẹ

---

## Flow

1. Intake
2. Context discovery nhẹ
3. Gap analysis
4. Hỏi tối đa 2 câu nếu thật sự cần
5. Generate business artifact ngắn gọn
6. Document
7. Handoff

---

## Question Budget

- tối đa **2 câu**
- chỉ **1 round**
- nếu ambiguity không block output → dùng `Assumption`

Chỉ hỏi khi ambiguity ảnh hưởng trực tiếp:
- scope
- business rule
- acceptance criteria

---

## Output Kỳ Vọng

- Business Context
- 1–3 User Stories
- 2–6 Acceptance Criteria
- TO-BE flow ngắn
- Assumptions
- Open Items nếu có

---

## Không bật mặc định

- Decomposition
- Review gate
- Overlap/conflict validation
- Stakeholder map
- Business NFR

---

## Fallback / Escalation

### Nếu user chọn Quick nhưng requirement lớn hơn dự kiến
Không im lặng giữ Quick nếu risk rõ.

Escalate lên `Standard` hoặc `Formal` khi:
- xuất hiện nhiều actor/sub-process
- edge cases đủ lớn để AC không thể chốt
- có legal/compliance/audit concern

### Nếu requirement vẫn nhỏ
Giữ Quick. Không tự tăng ceremony chỉ vì có một vài ambiguity nhỏ.

---

## Ví dụ tốt

```text
Quick: Admin có thể deactivate user
Quick: Bổ sung rule không cho user đổi email khi tài khoản bị khóa
Quick: Cập nhật business doc cho luồng reset mật khẩu cơ bản
```

---

## Anti-pattern

Không nên dùng Quick cho:
- quy trình end-to-end nhiều actor
- requirement có approval chain
- requirement có legal/compliance implications
- requirement đang mơ hồ ở core business rule

---

## Decision Summary

Quick = flow nhẹ nhất vẫn đúng nghiệp vụ.
Nếu không block scope/business rule/AC, ưu tiên `Assumption` hơn là hỏi thêm.