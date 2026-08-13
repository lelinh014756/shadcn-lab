---
name: opt-in-via-callback-presence
description: Shared component design pattern — optional feature render gated by presence of callback prop (not boolean flag), used in admin-table-settings column visibility
metadata:
  type: feedback
---

Khi thiết kế shared component có feature tùy chọn (vd: column visibility trong `AdminTableSettingsSheet`), gate render bằng **presence của callback prop** (`onHiddenColumnIdsChange?: ...`) chứ không phải boolean flag riêng.

**Why:** Giảm surface API — caller truyền callback khi muốn feature, không truyền khi không. Demo/dev consumers không cần biết flag, không break khi thêm feature mới. Verified trong batch heavy-grid tier products table (2026-06-29): dev demo không truyền callback → không render cột visibility; products truyền → render. Header `<th>` và `<TableCell>` cùng guard bằng cùng điều kiện để không vỡ layout.

**How to apply:**
- Khi review shared component mới có optional feature: kiểm tra cả header và cell guard dùng cùng signal (callback presence).
- Khi add feature optional vào shared component: ưu tiên callback-presence gate thay vì thêm `enableX?: boolean`.
- Pair với data prop cùng optional (`hiddenColumnIds?: string[]`) để fallback `?? []` an toàn.
