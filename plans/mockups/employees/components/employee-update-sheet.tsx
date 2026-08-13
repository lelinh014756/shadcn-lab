import { memo } from "react";
import {
  AdminSheet,
  AdminSheetContent,
  AdminSheetFooter,
  AdminSheetHeader,
  AdminSheetHeaderMeta,
  AdminSheetTitle,
} from "@/components/overlay/admin-sheet";
import { useEmployeesContext } from "../context/employees-store";
import { useT } from "@/lib/i18n/context";
import { adminPageStyles } from "@/lib/configs/admin-page-styles";
import { cn } from "@/lib/utils";
import { ButtonApp } from "@/components/button";
import EmployeeUpdateForm, { FORM_ID } from "./employee-update-form";
import { LoadingBlock } from "@/components/feedback/loading-block";
import { SkeletonForm } from "@/components/feedback/app-skeleton";
import { EmptyState } from "@/components/data-display/empty-state";
import { useEmployeeDetail } from "../hooks/use-employees-query";


const EmployeeFormSheet = () => {
  const { dict } = useT();
  const d = dict.system.employees;

  const closeModal = useEmployeesContext((s) => s.closeModal);
  const modals = useEmployeesContext((s) => s.modals);
  const open = !!modals.CREATE || !!modals.EDIT;
  const isEdit = !!modals.EDIT;
  const editEmployeeData = useEmployeesContext((s) => s.editEmployeeData);

  const { data: employee, isLoading } = useEmployeeDetail(editEmployeeData?.id ?? null);

  const isNotFound = isEdit && employee === null && editEmployeeData?.id != null;

  return (
    <AdminSheet open={open} onOpenChange={(v) => { if (!v) closeModal(isEdit ? "EDIT" : "CREATE"); }}>
      <AdminSheetContent side="right" variant="full">
        <AdminSheetHeader>
          <AdminSheetHeaderMeta>
            <AdminSheetTitle>
              {isEdit ? d.editSheetTitle : d.createSheetTitle}
            </AdminSheetTitle>
          </AdminSheetHeaderMeta>
        </AdminSheetHeader>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 p-4">
            <SkeletonForm />
            <SkeletonForm />
          </div>
        ) : isNotFound ? (
          <EmptyState
            title={d.notFoundTitle}
            description={d.notFoundDescription}
            variant="error"
          />
        ) : (
          open && (
            <EmployeeUpdateForm editingEmployee={employee}>
              {(isDirty) => (
                <AdminSheetFooter>
                  <ButtonApp
                    type="button"
                    variant="outline"
                    onClick={() => closeModal(isEdit ? "EDIT" : "CREATE")}
                  >
                    {dict.common.cancel}
                  </ButtonApp>
                  <ButtonApp
                    preset="save"
                    type="submit"
                    form={FORM_ID}
                    disabled={!isDirty}
                    className={cn(
                      adminPageStyles.toolbarBtn,
                      adminPageStyles.toolbarBtnPrimary,
                      "gap-1.5",
                    )}
                  >
                    {dict.common.save}
                  </ButtonApp>
                </AdminSheetFooter>
              )}
            </EmployeeUpdateForm>
          )
        )}
      </AdminSheetContent>
    </AdminSheet>
  );
};

export default memo(EmployeeFormSheet);