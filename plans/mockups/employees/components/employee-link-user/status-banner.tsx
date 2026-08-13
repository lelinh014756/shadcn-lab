"use client";

/**
 * Banner + empty states hiển thị theo `StaffState`:
 *   - `empty`    → warning banner "Chưa có tài khoản..."
 *   - `linked`   → success banner + nút "Huỷ liên kết"
 *   - `inactive` → destructive banner "Đã ngưng hoạt động"
 *
 * `InactiveEmptyState` + `ReplaceNotice` là sub-components hỗ trợ.
 */

import { Check, Info, Lock, ShieldAlert } from "lucide-react";
import { ButtonApp } from "@/components/button/button-app";
import type { StaffState } from "./helpers";

interface StatusBannerProps {
  state: StaffState;
  userName?: string | null;
  workEmail?: string | null;
  onUnlink: () => void;
  isUnlinking: boolean;
}

export function StatusBanner({
  state,
  userName,
  workEmail,
  onUnlink,
  isUnlinking,
}: StatusBannerProps) {
  if (state === "empty") {
    return (
      <div className="border-b border-border px-5 py-3">
        <div className="flex items-start gap-2 text-xs">
          <ShieldAlert
            aria-hidden
            className="mt-0.5 size-4 shrink-0 text-[var(--color-warning-default)]"
          />
          <p className="leading-5 text-foreground/80">
            <span className="font-semibold">Chưa có tài khoản đăng nhập.</span>{" "}
            Cấp tài khoản để nhân viên có thể sử dụng hệ thống.
          </p>
        </div>
      </div>
    );
  }

  if (state === "linked") {
    return (
      <div className="border-b border-border px-5 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-2">
            <Check
              aria-hidden
              className="mt-0.5 size-4 shrink-0 text-[var(--color-success-default)]"
            />
            <div className="min-w-0">
              <div className="text-xs font-semibold text-foreground">
                Đã liên kết tài khoản
              </div>
              <div className="mt-0.5 truncate text-xs text-foreground/90">
                {userName ?? workEmail ?? "—"}
              </div>
            </div>
          </div>
          <ButtonApp
            variant="outline"
            intent="destructive"
            size="sm"
            onClick={onUnlink}
            loading={isUnlinking}
            loadingText="Đang huỷ..."
          >
            Huỷ liên kết
          </ButtonApp>
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-border px-5 py-3">
      <div className="flex items-start gap-2 text-xs">
        <Lock aria-hidden className="mt-0.5 size-4 shrink-0 text-destructive" />
        <p className="leading-5 text-foreground/80">
          <span className="font-semibold">Nhân viên đã ngưng hoạt động.</span>{" "}
          Không thể gắn / huỷ tài khoản. Kích hoạt lại nhân viên trước.
        </p>
      </div>
    </div>
  );
}

/** Full-panel empty state khi staff inactive. */
export function InactiveEmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center text-muted-foreground">
      <Lock aria-hidden className="size-10 opacity-40" />
      <p className="text-sm font-medium">Chức năng bị khoá</p>
      <p className="text-xs">Nhân viên đã ngưng hoạt động.</p>
    </div>
  );
}

/** Cảnh báo "sẽ thay thế" khi staff đã có tài khoản. */
export function ReplaceNotice() {
  return (
    <div className="flex items-start gap-2 rounded-md border border-[var(--color-info-border)] bg-[var(--color-info-soft)]/70 px-3 py-2 text-xs text-[var(--color-info-text)]">
      <Info aria-hidden className="mt-0.5 size-3.5 shrink-0" />
      <span>
        Chọn tài khoản mới sẽ <strong>thay thế</strong> tài khoản hiện tại.
      </span>
    </div>
  );
}
