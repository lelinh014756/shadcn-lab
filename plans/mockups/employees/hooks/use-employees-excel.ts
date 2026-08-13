import { useCallback } from "react";
import { saveAs } from "file-saver";
import { utils, write } from "xlsx";
import { STAFF_IMPORT_MAX_BYTES } from "../constants/misc";
import { useT } from "@/lib/i18n/context";
import { notifyAdminError, notifyAdminSuccess, resolveErrorMessage } from "../../shared/admin-toast-notify";
import { useDownloadImportTemplate, useImportEmployees } from "./use-employees-query";
import type { Employee } from "../types/employee";

const useEmployeesExcel = (employees: Employee[] = []) => {
    const { dict } = useT();
    const d = dict.system.employees;
    const sc = dict.system.common;

    const importMutation = useImportEmployees();
    const downloadMutation = useDownloadImportTemplate();

    const isLoading = importMutation.isPending;

    const validateImportFile = useCallback(
        (file: File): string | null => {
            if (!file.name.toLowerCase().endsWith(".xlsx")) return d.importInvalidFileType;
            if (file.size > STAFF_IMPORT_MAX_BYTES) return d.importFileTooLarge;
            return null;
        },
        [d.importInvalidFileType, d.importFileTooLarge],
    );

    const handleImportFile = useCallback(
        async (file: File) => {
            const validationError = validateImportFile(file);
            if (validationError) {
                notifyAdminError(dict, validationError);
                return;
            }
            importMutation.mutateAsync(file, {
                onSuccess: (result) => notifyAdminSuccess(dict, result.message || d.toastImportSuccess),
                onError: (err) => notifyAdminError(dict, resolveErrorMessage(err, d.toastImportError)),
            });
        },
        [dict, validateImportFile, importMutation],
    );

    const handleDownloadTemplate = useCallback(async () => {
        downloadMutation.mutateAsync(undefined, {
            onError(err) {
                notifyAdminError(dict, resolveErrorMessage(err, d.toastTemplateError));

            },
        });
    }, [dict, d.toastTemplateError]);

    const handleExport = useCallback(() => {
        if (employees.length === 0) {
            notifyAdminError(dict, d.toastExportEmpty);
            return;
        }

        try {
            const rows = employees.map((employee) => ({
                [d.code]: employee.code,
                [d.fullName]: employee.fullName,
                [d.email]: employee.workEmail ?? "",
                [d.phone]: employee.workPhone ?? "",
                [d.departmentName]: employee.departmentName ?? "",
                [d.organizationId]: employee.organizationName ?? "",
                [d.status]: employee.isActive ? sc.active : sc.inactive,
            }));
            const worksheet = utils.json_to_sheet(rows);
            const workbook = utils.book_new();
            utils.book_append_sheet(workbook, worksheet, "Employees");
            const buffer = write(workbook, { bookType: "xlsx", type: "array" });
            saveAs(
                new Blob([buffer], {
                    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
                }),
                "employees-export.xlsx",
            );
            notifyAdminSuccess(dict, d.toastExportSuccess);
        } catch {
            notifyAdminError(dict, d.toastExportError);
        }
    }, [d, dict, employees, sc.active, sc.inactive]);

    return {
        isLoading,
        handleImportFile,
        handleDownloadTemplate,
        handleExport,
    };
};

export default useEmployeesExcel;
