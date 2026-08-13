"use client";

/**
 * Preview footer — hiển thị bản tóm tắt tài khoản sẽ liên kết (tab select)
 * hoặc sẽ tạo mới (tab create) trước khi user bấm Submit.
 *
 * Ẩn khi:
 *   - `hidden = true` (staff inactive)
 *   - tab `select` mà chưa chọn user
 *   - tab `create` mà form invalid
 */

import type { LinkableUser } from "../../hooks/use-link-user-sheet";
import type { CreateForm } from "./helpers";

interface SelectedPreviewProps {
  hidden: boolean;
  tab: "select" | "create";
  selectedUser: LinkableUser | null;
  createForm: CreateForm;
  createFormValid: boolean;
}

export function SelectedPreview({
  hidden,
  tab,
  selectedUser,
  createForm,
  createFormValid,
}: SelectedPreviewProps) {
  if (hidden) return null;

  const show =
    (tab === "select" && selectedUser != null) ||
    (tab === "create" && createFormValid);

  if (!show) return null;

  return (
    <div className="border-t border-[var(--color-success-border)] bg-[var(--color-success-soft)]/70 px-5 py-3">
      <div className="text-[10.5px] font-semibold uppercase tracking-wide text-[var(--color-success-text)]">
        Sẽ liên kết với tài khoản
      </div>
      <div className="mt-1 text-sm font-medium text-foreground">
        {tab === "select" && selectedUser ? (
          <>
            {selectedUser.username}{" "}
            <span className="font-normal text-muted-foreground">
              · {selectedUser.email}
            </span>
          </>
        ) : (
          <>
            {createForm.username}{" "}
            <span className="font-normal text-muted-foreground">
              · {createForm.email}
            </span>{" "}
            <span className="text-[10.5px] font-normal text-[var(--color-success-text)]">
              (sẽ tạo mới)
            </span>
          </>
        )}
      </div>
    </div>
  );
}
