# Function Catalog Template

**Module:** {{module_code}} | **Phase:** {{phase}}
**Chế độ:** {{mode}}
**Thời điểm tạo:** {{date}}

---

## Mục đích

Tài liệu liệt kê **đầy đủ các chức năng trong scope** theo nhóm nghiệp vụ.
Dùng để:
- Chốt phạm vi tính năng với stakeholder
- Rà soát thiếu/chồng chéo chức năng
- Handoff cho dev, QA, PM

---

## Khi nào tạo

**Nên tạo khi:**
- Module có ≥5 functions/sub-capabilities
- Cần inventory chi tiết để review với stakeholder non-technical
- QA cần build test matrix
- Standard/Formal mode với nhiều CRUD operations

**Không cần khi:**
- Requirement rất nhỏ (< 5 functions)
- Quick mode — dùng user story format gọn hơn

---

## Template

# {{module_name}} – Danh sách chức năng chi tiết

**Module:** {{module_code}} | **Phase:** {{phase}}
**Thời điểm:** {{date}}

---

## A. {{nhóm_chức_năng_1}}

| Mã | Tên chức năng | Mô tả ngắn | Đối tượng | Độ ưu tiên |
|----|---------------|------------|-----------|------------|
| FC-{{MODULE}}-001 | {{tên}} | {{mô_tả}} | {{actor}} | P0 |
| FC-{{MODULE}}-002 | {{tên}} | {{mô_tả}} | {{actor}} | P1 |

### Chi tiết FC-{{MODULE}}-001 — {{tên chức năng}}

- {{thao_tác_chính_1}}
- {{thao_tác_chính_2}}
- {{business_rule_1}}
- {{business_rule_2}}
- **Phân quyền:** `{{PERMISSION_CODE}}`

---

## B. {{nhóm_chức_năng_2}}

...

---

## Tổng hợp

| Nhóm chức năng | Số lượng | P0 | P1 | P2 | P3 |
|----------------|----------|----|----|----|----|
| {{nhóm_1}} | {{n}} | {{n}} | {{n}} | {{n}} | {{n}} |
| **Tổng** | **{{n}}** | **{{n}}** | **{{n}}** | **{{n}}** | **{{n}}** |

---

## Mapping to User Stories

| Function Catalog | User Story |
|------------------|------------|
| FC-XXX-001 | US-XX-01 |
| FC-XXX-002 | US-XX-02 |

---

## Quy tắc viết

### Naming Convention

- Mã chức năng: `FC-{MODULE}-{NNN}`
  - MODULE: 3-4 ký tự viết tắt (CRM, PRJ, HĐMB, CTB)
  - NNN: số thứ tự 3 chữ số (001, 002...)

### Độ ưu tiên

| Priority | Định nghĩa |
|----------|------------|
| P0 | Must-have, không có thì module không hoạt động |
| P1 | Should-have, cần cho MVP hoàn chỉnh |
| P2 | Nice-to-have, có thể defer |
| P3 | Future, phase sau |

### Nội dung mỗi function

1. **Thao tác chính:** Action user có thể thực hiện
2. **Business rule:** Quy tắc nghiệp vụ áp dụng
3. **Validation:** Kiểm tra đầu vào (nếu có)
4. **Constraint:** Giới hạn kỹ thuật/nghiệp vụ (nếu có)
5. **Phân quyền:** Permission cần thiết

### Quy tắc chung

- Viết theo ngôn ngữ nghiệp vụ, không mô tả kỹ thuật triển khai
- Mỗi bullet là một capability hoặc business rule rõ ràng
- Gom chức năng liên quan vào cùng nhóm
- Ưu tiên đủ scope hơn diễn giải dài
- Không lặp nguyên văn user stories hoặc acceptance criteria

---

## Checklist

- [ ] Mỗi nhóm chức năng có title rõ ràng
- [ ] Mã chức năng unique và consistent
- [ ] Thao tác chính liệt kê đầy đủ
- [ ] Business rule capture đúng
- [ ] Phân quyền gán cho mỗi function
- [ ] Priority gán hợp lý
- [ ] Có bảng tổng hợp cuối document
- [ ] Mapping to user stories (nếu có)
