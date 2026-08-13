"use client";

/**
 * ChangeStaffStatusDialog
 * -----------------------
 * Self-contained dialog thay đổi tình trạng làm việc (employment status) —
 * gọi `PATCH /staff/{id}/status` (ChangeActivateStaffAsync).
 *
 * Đây là "smart" component: đọc modal state + `changeStatusEmployeeId` từ
 * `employeesStore`, chạy mutation `useChangeStaffStatus`, và tự xử lý toast /
 * close modal. Consumer chỉ cần render `<ChangeStaffStatusDialog />` một chỗ
 * (thường trong `EmployeesModals`) — bất kỳ nơi nào dispatch
 * `openModal("CHANGE_STATUS", id)` sẽ mở dialog này.
 *
 * UI:
 *   - 3 lựa chọn radio: Đang làm việc (1), Tạm nghỉ (2), Đã nghỉ việc (3)
 *   - Khi chọn status 3 → bắt buộc nhập lý do (reason)
 *   - Submit disabled cho đến khi chọn radio; status 3 cần reason
 *   - Radio của status hiện tại bị disable + hiển thị "Hiện tại" badge
 *
 * `currentStatusId` được resolve bằng `useEmployeeDetail(changeStatusEmployeeId)`
 * — tận dụng cache của react-query, không cần truyền items từ ngoài.
 */

import { useCallback, useId, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import AppDialog from "@/components/dialog/app-dialog";
import { Textarea } from "@/components/forms/textarea";
import { Button } from "@/components/ui-elements/button";
import { FieldLabel } from "@/components/ui-elements/field";
import { RadioGroup, RadioGroupItem } from "@/components/forms/radio-group";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/context";
import {
  notifyAdminError,
  notifyAdminSuccess,
} from "@/modules/system/shared/admin-toast-notify";

import { useEmployeesContext } from "../context/employees-store";
import {
  useChangeStaffStatus,
  useEmployeeDetail,
} from "../hooks/use-employees-query";

// ─── Status options ──────────────────────────────────────────────────────────

/**
 * Colors dùng semantic tokens (`--color-{success|warning|danger}-*`) thay vì
 * raw Tailwind color để tuân thủ codebase rule `landsoft-color/no-raw-tailwind-colors`.
 */
const STATUS_OPTIONS = [
  {
    value: 1,
    label: "Đang làm việc",
    description: "Nhân viên đang làm việc bình thường",
    dotClass: "bg-[var(--color-success-default)]",
    borderChecked:
      "has-[[data-checked]]:border-[var(--color-success-default)] has-[[data-checked]]:bg-[var(--color-success-soft)]",
    radioClass:
      "data-[checked]:!border-[var(--color-success-default)] data-[checked]:!bg-[var(--color-success-default)]",
  },
  {
    value: 2,
    label: "Tạm nghỉ",
    description: "Nhân viên đang trong thời gian nghỉ phép",
    dotClass: "bg-[var(--color-warning-default)]",
    borderChecked:
      "has-[[data-checked]]:border-[var(--color-warning-default)] has-[[data-checked]]:bg-[var(--color-warning-soft)]",
    radioClass:
      "data-[checked]:!border-[var(--color-warning-default)] data-[checked]:!bg-[var(--color-warning-default)]",
  },
  {
    value: 3,
    label: "Đã nghỉ việc",
    description: "Nhân viên đã chấm dứt hợp đồng",
    dotClass: "bg-[var(--color-danger-default)]",
    borderChecked:
      "has-[[data-checked]]:border-[var(--color-danger-default)] has-[[data-checked]]:bg-[var(--color-danger-soft)]",
    radioClass:
      "data-[checked]:!border-[var(--color-danger-default)] data-[checked]:!bg-[var(--color-danger-default)]",
  },
] as const;

const STATUS_REQUIRING_REASON = 3;

// ─── Component ───────────────────────────────────────────────────────────────

export function ChangeStaffStatusDialog() {
  const { dict } = useT();
  const radioId = useId();

  // ── Store state ────────────────────────────────────────────────────────────
  const modal = useEmployeesContext((s) => s.modals);
  const closeModal = useEmployeesContext((s) => s.closeModal);
  const changeStatusEmployeeId = useEmployeesContext(
    (s) => s.changeStatusEmployeeId,
  );
  const open = Boolean(modal.CHANGE_STATUS);

  // ── Employee data (for currentStatusId pre-select) ─────────────────────────
  const { data: employee } = useEmployeeDetail(changeStatusEmployeeId);
  const currentStatusId = employee?.staffStatusId;

  // ── Mutation ───────────────────────────────────────────────────────────────
  const changeStaffStatus = useChangeStaffStatus();
  const isLoading = changeStaffStatus.isPending;

  // ── Local form state ───────────────────────────────────────────────────────
  const [selectedStatus, setSelectedStatus] = useState<number | null>(null);
  const [reason, setReason] = useState("");

  const requiresReason = selectedStatus === STATUS_REQUIRING_REASON;
  const canSubmit =
    selectedStatus !== null && (!requiresReason || reason.trim().length > 0);

  // Reset form khi đóng dialog — dùng render-phase state sync thay vì
  // useEffect + setState (tránh cascading render + đồng bộ trong 1 pass).
  const [prevOpen, setPrevOpen] = useState(open);
  if (prevOpen !== open) {
    setPrevOpen(open);
    if (!open) {
      setSelectedStatus(null);
      setReason("");
    }
  }

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleOpenChange = (v: boolean) => {
    if (isLoading) return;
    if (!v) closeModal("CHANGE_STATUS");
  };

  const handleConfirm = useCallback(() => {
    if (!canSubmit || selectedStatus === null) return;
    if (changeStatusEmployeeId == null) return;

    changeStaffStatus.mutate(
      {
        id: changeStatusEmployeeId,
        payload: {
          staffStatusId: selectedStatus,
          reason: requiresReason ? reason.trim() : undefined,
        },
      },
      {
        onSuccess: (resp) => {
          if (resp.success) {
            notifyAdminSuccess(dict, "Cập nhật tình trạng làm việc thành công");
            closeModal("CHANGE_STATUS");
          }
        },
        onError: () =>
          notifyAdminError(dict, "Không thể thay đổi tình trạng làm việc"),
      },
    );
  }, [
    canSubmit,
    changeStaffStatus,
    changeStatusEmployeeId,
    closeModal,
    dict,
    reason,
    requiresReason,
    selectedStatus,
  ]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <AppDialog
      open={open}
      onOpenChange={handleOpenChange}
      size="md"
      title="Thay đổi tình trạng làm việc"
      description="Chọn tình trạng mới cho nhân viên"
      footer={
        <>
          <Button
            variant="outline"
            onClick={() => closeModal("CHANGE_STATUS")}
            disabled={isLoading}
            className="flex-1"
          >
            Hủy
          </Button>
          <Button
            tone="primary"
            onClick={handleConfirm}
            disabled={!canSubmit || isLoading}
            className="flex-1"
          >
            {isLoading && <Loader2 className="size-4 animate-spin" />}
            {isLoading ? "Đang xử lý..." : "Xác nhận"}
          </Button>
        </>
      }
      footerClassName="flex gap-2"
    >
      <div className="space-y-4">
        {/* Radio group */}
        <RadioGroup
          value={selectedStatus !== null ? String(selectedStatus) : ""}
          onValueChange={(val: unknown) =>
            setSelectedStatus(Number(String(val)))
          }
          className="gap-2"
        >
          {STATUS_OPTIONS.map((option) => {
            const isCurrentStatus = option.value === currentStatusId;
            return (
              <label
                key={option.value}
                htmlFor={`${radioId}-${option.value}`}
                className={cn(
                  "relative flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-all",
                  !isCurrentStatus && "hover:bg-muted/40",
                  isCurrentStatus
                    ? "cursor-default border-muted-foreground/30 bg-muted/40"
                    : option.borderChecked,
                )}
              >
                <RadioGroupItem
                  id={`${radioId}-${option.value}`}
                  value={String(option.value)}
                  className={cn("mt-0.5 shrink-0", option.radioClass)}
                  disabled={isCurrentStatus}
                />

                <div className="flex flex-1 flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "size-2 shrink-0 rounded-full absolute top-2 right-2",
                        option.dotClass,
                      )}
                    />
                    <span
                      className={cn(
                        "text-sm font-semibold leading-none",
                        isCurrentStatus && "text-muted-foreground",
                      )}
                    >
                      {option.label}
                    </span>
                    {isCurrentStatus && (
                      <span className="flex items-center gap-1 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium leading-none text-foreground shadow-sm">
                        <Check
                          className="size-3 text-[var(--color-success-default)]"
                          strokeWidth={3}
                        />
                        Hiện tại
                      </span>
                    )}
                  </div>
                  <span className="text-[13px] leading-snug text-muted-foreground">
                    {option.description}
                  </span>
                </div>

                {/* Overlay để block click khi là trạng thái hiện tại */}
                {isCurrentStatus && (
                  <span className="absolute inset-0 cursor-not-allowed rounded-lg" />
                )}
              </label>
            );
          })}
        </RadioGroup>

        {/* Textarea lý do — chỉ hiển thị khi chọn status 3 */}
        {requiresReason && (
          <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
            <FieldLabel
              htmlFor="staff-status-reason"
              className="text-sm font-medium"
            >
              Lý do nghỉ việc
              <span className="ml-0.5 text-destructive">*</span>
            </FieldLabel>
            <Textarea
              id="staff-status-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do nghỉ việc..."
              rows={3}
              className="min-h-20 resize-none"
              autoFocus
            />
            {reason.trim().length === 0 && (
              <p className="text-xs text-muted-foreground">
                Lý do là bắt buộc khi chuyển sang trạng thái nghỉ việc.
              </p>
            )}
          </div>
        )}
      </div>
    </AppDialog>
  );
}
