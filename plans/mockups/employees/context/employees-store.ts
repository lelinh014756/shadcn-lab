import { createStore, useStore } from "zustand";
import { Employee } from "../types/employee";

type ModalKey = "DETAIL" | "CREATE" | "EDIT" | "LINK_USER" | "CHANGE_STATUS";

export interface EmployeesState {
    modals: Record<ModalKey, boolean | null>;
    editEmployeeData: Employee | null;
    detailEmployeeId: number | null;
    linkUserEmployeeId: number | null;
    /** ID nhân viên đang chờ đổi tình trạng làm việc (CHANGE_STATUS dialog). */
    changeStatusEmployeeId: number | null;
    openModal: (modalKey: ModalKey, id?: number) => void;
    openEditModal: (data: Employee) => void;
    closeModal: (modalKey: ModalKey) => void;
}

const initialModals: Record<ModalKey, boolean | null> = {
    DETAIL: null,
    CREATE: null,
    EDIT: null,
    LINK_USER: null,
    CHANGE_STATUS: null,
};

export const createEmployeesStore = () =>
    createStore<EmployeesState>((set) => ({
        modals: initialModals,
        editEmployeeData: null,
        detailEmployeeId: null,
        linkUserEmployeeId: null,
        changeStatusEmployeeId: null,
        openModal: (modalKey, id) =>
            set((state) => {
                const updates: Record<string, unknown> = { modals: { ...state.modals, [modalKey]: true } };
                if (modalKey === "DETAIL" && id !== undefined) updates.detailEmployeeId = id;
                if (modalKey === "LINK_USER" && id !== undefined) updates.linkUserEmployeeId = id;
                if (modalKey === "CHANGE_STATUS" && id !== undefined) updates.changeStatusEmployeeId = id;
                return updates;
            }),
        closeModal: (key) =>
            set((state) => ({
                modals: { ...state.modals, [key]: false },
                ...(key === "EDIT" ? { editEmployeeData: null } : {}),
                ...(key === "DETAIL" ? { detailEmployeeId: null } : {}),
                ...(key === "LINK_USER" ? { linkUserEmployeeId: null } : {}),
                ...(key === "CHANGE_STATUS" ? { changeStatusEmployeeId: null } : {}),
            })),
        openEditModal: (data) =>
            set((state) => ({
                editEmployeeData: data,
                modals: { ...state.modals, ["EDIT"]: true },
            })),
    }));

/** Singleton store instance — dùng thay cho EmployeesProvider Context */
export const employeesStore = createEmployeesStore();

/**
 * Selector hook thay thế useEmployeesContext.
 * Dùng trực tiếp với singleton store, không cần Provider wrapper.
 */
export function useEmployeesContext<T>(selector: (state: EmployeesState) => T): T {
    return useStore(employeesStore, selector);
}