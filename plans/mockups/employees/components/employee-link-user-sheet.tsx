"use client";

/**
 * EmployeeLinkUserSheet
 * ---------------------
 * Sheet cấp tài khoản cho nhân viên. Chỉ đóng vai trò orchestrator:
 *   - Lifecycle: reset state khi mở lại / đổi nhân viên
 *   - Router: chuyển giữa 2 tab (select existing / create new)
 *   - Dispatch: gọi mutation link / unlink / createUser
 *   - Layout: header · body · footer
 *
 * Sub-components được tách vào `./employee-link-user/`:
 *   - `StaffContextCard`   — header card (avatar + info nhân viên)
 *   - `StatusBanner`       — banner theo trạng thái staff (empty/linked/inactive)
 *   - `SelectUserTab`      — tab chọn user có sẵn
 *   - `CreateUserTab`      — tab tạo user mới
 *   - `SelectedPreview`    — preview trước Submit
 *   - `helpers.ts`         — pure utils + types + constants
 */

import { useState } from "react";
import { Link2, Plus, Search } from "lucide-react";

import {
  AdminSheet,
  AdminSheetBody,
  AdminSheetContent,
  AdminSheetFooter,
  AdminSheetHeader,
  AdminSheetHeaderMeta,
  AdminSheetTitle,
} from "@/components/overlay/admin-sheet";
import { ButtonApp } from "@/components/button/button-app";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui-elements/tabs";

import { useT } from "@/lib/i18n/context";
import {
  notifyAdminError,
  notifyAdminSuccess,
  resolveErrorMessage,
} from "@/modules/system/shared/admin-toast-notify";

import { useEmployeesContext } from "../context/employees-store";
import {
  useCreateUser,
  useEmployeeDetail,
  useLinkUserToEmployee,
  useUnlinkUser,
  type CreateUserPayload,
} from "../hooks/use-employees-query";
import { useLinkableUsers } from "../hooks/use-link-user-sheet";

import {
  CreateUserTab,
  InactiveEmptyState,
  INITIAL_FORM,
  ReplaceNotice,
  SelectedPreview,
  SelectUserTab,
  StaffContextCard,
  StatusBanner,
  generatePassword,
  isCreateFormValid,
  type CreateForm,
  type StaffState,
} from "./employee-link-user";

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = { open: boolean };

// ─── Component ────────────────────────────────────────────────────────────────

export default function EmployeeLinkUserSheet({ open }: Props) {
  const { dict } = useT();
  const d = dict.system.employees;
  const sc = dict.system.common;
  const accountsDict = dict.system.accounts;

  // ── Store + data ──────────────────────────────────────────────────────────
  const linkUserEmployeeId = useEmployeesContext((s) => s.linkUserEmployeeId);
  const closeModal = useEmployeesContext((s) => s.closeModal);

  const { data: employee, isLoading: isEmployeeLoading } =
    useEmployeeDetail(linkUserEmployeeId);
  const { data: users = [], isLoading: isUsersLoading } = useLinkableUsers({
    organizationId: employee?.organizationId ?? 0,
  });

  const staffState: StaffState = deriveStaffState(employee);

  // ── Local UI state ────────────────────────────────────────────────────────
  const [tab, setTab] = useState<"select" | "create">("select");
  const [searchKw, setSearchKw] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [form, setForm] = useState<CreateForm>(() => ({
    ...INITIAL_FORM,
    password: generatePassword(),
  }));

  // Reset state khi mở lại hoặc đổi employee — dùng "reset key" trick để
  // trigger reset đồng bộ trong 1 render mà không phải useEffect.
  const [resetKey, setResetKey] = useState<string>("");
  const currentKey = `${open ? 1 : 0}:${linkUserEmployeeId ?? ""}`;
  if (open && currentKey !== resetKey) {
    setResetKey(currentKey);
    setTab("select");
    setSearchKw("");
    setSelectedUserId(null);
    setForm({ ...INITIAL_FORM, password: generatePassword() });
  }

  // ── Mutations ─────────────────────────────────────────────────────────────
  const link = useLinkUserToEmployee({
    onSuccess: () => {
      notifyAdminSuccess(dict, accountsDict.toastLinkSuccess);
      closeModal("LINK_USER");
    },
    onError: (err) =>
      notifyAdminError(dict, resolveErrorMessage(err, accountsDict.toastLinkError)),
  });
  const unlink = useUnlinkUser({
    onSuccess: () => {
      notifyAdminSuccess(dict, accountsDict.toastUnlinkSuccess);
      closeModal("LINK_USER");
    },
    onError: (err) =>
      notifyAdminError(dict, resolveErrorMessage(err, accountsDict.toastUnlinkError)),
  });
  const createUser = useCreateUser({
    onSuccess: () => {
      notifyAdminSuccess(dict, accountsDict.toastCreateSuccess);
      closeModal("LINK_USER");
    },
    onError: (err) =>
      notifyAdminError(dict, resolveErrorMessage(err, accountsDict.toastCreateError)),
  });

  const isBusy = link.isPending || unlink.isPending || createUser.isPending;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleClose = () => closeModal("LINK_USER");

  const handleUnlink = () => {
    if (!employee) return;
    unlink.mutate(employee.id);
  };

  const handleSubmit = () => {
    if (!employee) return;
    if (staffState === "inactive") return;

    if (tab === "select") {
      if (selectedUserId == null) return;
      link.mutate({ staffId: employee.id, userId: selectedUserId });
      return;
    }

    if (!isCreateFormValid(form)) return;
    const payload: CreateUserPayload = {
      organizationId: employee.organizationId ?? 0,
      username: form.username,
      email: form.email,
      fullName: form.fullName || employee.fullName,
      password: form.password,
      roleId: Number(form.roleId),
    };
    createUser.mutate({ staffId: employee.id, payload });
  };

  const applyStaffSuggestion = () => {
    if (!employee) return;
    setForm((prev) => ({
      ...prev,
      username: (employee.code ?? "").toLowerCase(),
      email: employee.workEmail ?? employee.personalEmail ?? "",
      fullName: employee.fullName ?? "",
    }));
  };

  // ── Derived render props ──────────────────────────────────────────────────
  const submitDisabled =
    staffState === "inactive" ||
    isBusy ||
    (tab === "select" ? selectedUserId == null : !isCreateFormValid(form));

  const submitLabel =
    staffState === "linked"
      ? "Thay thế tài khoản"
      : tab === "create"
        ? "Tạo & cấp tài khoản"
        : "Cấp tài khoản";

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <AdminSheet
      open={open}
      onOpenChange={(v) => {
        if (!v) handleClose();
      }}
    >
      <AdminSheetContent side="right" variant="narrow">
        <AdminSheetHeader tone="info" className="gap-3">
          <AdminSheetHeaderMeta>
            <Link2 aria-hidden className="size-4 text-primary" />
            <AdminSheetTitle className="normal-case">
              {d.createAccountSheetTitle ?? "Cấp tài khoản"}
            </AdminSheetTitle>
          </AdminSheetHeaderMeta>

          <StaffContextCard
            fullName={employee?.fullName}
            code={employee?.code}
            departmentName={employee?.departmentName}
            positionName={employee?.positionName}
            isLoading={isEmployeeLoading}
          />
        </AdminSheetHeader>

        <AdminSheetBody className="flex flex-col">
          <StatusBanner
            state={staffState}
            userName={employee?.userName}
            workEmail={employee?.workEmail}
            onUnlink={handleUnlink}
            isUnlinking={unlink.isPending}
          />

          {staffState === "inactive" ? (
            <InactiveEmptyState />
          ) : (
            <div className="min-w-0 flex-1 px-5 py-4">
              {staffState === "linked" ? <ReplaceNotice /> : null}

              <Tabs
                value={tab}
                onValueChange={(v) => {
                  const next = (v as "select" | "create") ?? "select";
                  setTab(next);
                  setSelectedUserId(null);
                }}
                className="mt-3"
              >
                <TabsList className="w-full">
                  <TabsTrigger value="select" className="gap-1.5">
                    <Search aria-hidden className="size-3.5" />
                    Chọn tài khoản có sẵn
                  </TabsTrigger>
                  <TabsTrigger value="create" className="gap-1.5">
                    <Plus aria-hidden className="size-3.5" />
                    Tạo tài khoản mới
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="select" className="mt-4">
                  <SelectUserTab
                    users={users}
                    isLoading={isUsersLoading}
                    searchKw={searchKw}
                    onSearchChange={setSearchKw}
                    selectedUserId={selectedUserId}
                    onSelect={setSelectedUserId}
                  />
                </TabsContent>

                <TabsContent value="create" className="mt-4">
                  <CreateUserTab
                    employeeFullName={employee?.fullName ?? null}
                    employeeCode={employee?.code ?? null}
                    employeeEmail={
                      employee?.workEmail ?? employee?.personalEmail ?? null
                    }
                    form={form}
                    onChange={setForm}
                    onApplySuggestion={applyStaffSuggestion}
                    onRegeneratePassword={() =>
                      setForm((p) => ({ ...p, password: generatePassword() }))
                    }
                  />
                </TabsContent>
              </Tabs>
            </div>
          )}

          <SelectedPreview
            hidden={staffState === "inactive"}
            tab={tab}
            selectedUser={users.find((u) => u.id === selectedUserId) ?? null}
            createForm={form}
            createFormValid={isCreateFormValid(form)}
          />
        </AdminSheetBody>

        <AdminSheetFooter className="flex justify-end gap-2 border-t pt-4">
          <ButtonApp variant="outline" onClick={handleClose} disabled={isBusy}>
            {sc.cancel}
          </ButtonApp>
          <ButtonApp
            preset="save"
            onClick={handleSubmit}
            disabled={submitDisabled}
            loading={isBusy}
          >
            {submitLabel}
          </ButtonApp>
        </AdminSheetFooter>
      </AdminSheetContent>
    </AdminSheet>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function deriveStaffState(
  employee: { isActive: boolean; hasLinkedUser: boolean } | null | undefined,
): StaffState {
  if (!employee) return "empty";
  if (!employee.isActive) return "inactive";
  return employee.hasLinkedUser ? "linked" : "empty";
}
