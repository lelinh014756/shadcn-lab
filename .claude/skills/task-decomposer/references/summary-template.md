# Task Summary — {{FEATURE_NAME}}

**Ngày tạo:** {{YYYYMMDD}}
**Requirement:** {{REQUIREMENT_SOURCE}}
**Tổng:** {{TOTAL_TASKS}} tasks · ~{{TOTAL_SP}} SP · ~{{TOTAL_MD}} MD

---

## 1. Bảng tổng hợp

| ID  | Title | Role | SP  | MD  | Priority | Blocked by | Blocks |
| --- | ----- | ---- | --- | --- | -------- | ---------- | ------ |

{{TASK_TABLE_ROWS}}

<!-- Mỗi row:
| TASK-NNN  | [ROLE] Action + Subject       | BE/FE/FS| N  | X MD | P0/P1/P2/P3    | TASK-NNN / — | TASK-NNN / — |
-->

---

## 2. Thống kê theo Role

| Role      | Tasks               | SP                  | MD                  | Task IDs            |
| --------- | ------------------- | ------------------- | ------------------- | ------------------- |
| 🔵 BE     | {{BE_COUNT}}        | {{BE_SP}} SP        | {{BE_MD}} MD        | {{BE_TASK_IDS}}     |
| 🟢 FE     | {{FE_COUNT}}        | {{FE_SP}} SP        | {{FE_MD}} MD        | {{FE_TASK_IDS}}     |
| 🟡 FS     | {{FS_COUNT}}        | {{FS_SP}} SP        | {{FS_MD}} MD        | {{FS_TASK_IDS}}     |
| ⚙️ DevOps | {{DEVOPS_COUNT}}    | {{DEVOPS_SP}} SP    | {{DEVOPS_MD}} MD    | {{DEVOPS_TASK_IDS}} |
| 🧪 QA     | {{QA_COUNT}}        | {{QA_SP}} SP        | {{QA_MD}} MD        | {{QA_TASK_IDS}}     |
| **Total** | **{{TOTAL_TASKS}}** | **{{TOTAL_SP}} SP** | **{{TOTAL_MD}} MD** | —                   |

---

## 3. Thống kê SP theo Priority

| Priority           | Tasks               | SP                  | MD                  |
| ------------------ | ------------------- | ------------------- | ------------------- |
| 🔴 P0-Blocking     | {{P0_COUNT}}        | {{P0_SP}} SP        | {{P0_MD}} MD        |
| 🟠 P1-High         | {{P1_COUNT}}        | {{P1_SP}} SP        | {{P1_MD}} MD        |
| 🟡 P2-Medium       | {{P2_COUNT}}        | {{P2_SP}} SP        | {{P2_MD}} MD        |
| ⚪ P3-Nice-to-have | {{P3_COUNT}}        | {{P3_SP}} SP        | {{P3_MD}} MD        |
| **Total**          | **{{TOTAL_TASKS}}** | **{{TOTAL_SP}} SP** | **{{TOTAL_MD}} MD** |

---

## 4. Dependency Graph

```
{{DEPENDENCY_GRAPH}}
```

<!-- Render toàn bộ chain, ví dụ:
TASK-001 [BE · P0] → TASK-003 [BE · P1] → TASK-007 [FE · P2]
TASK-002 [BE · P0] → TASK-005 [FE · P1]
TASK-004 [FE · P1]  (no dependencies)
TASK-006 [QA · P2]  blocked by: TASK-003, TASK-005
-->

---

## Ghi chú

{{NOTES}}

<!-- Điền nếu có:
- Tasks được split từ tasks ban đầu
- Assumptions khi decompose
- Risks / unknowns phát hiện
- Tasks bị skip và lý do
-->
