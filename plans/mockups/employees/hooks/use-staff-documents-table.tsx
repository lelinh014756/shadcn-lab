"use client";

import { useMemo } from "react";
import type { MRT_ColumnDef } from "material-react-table";
import { MRT_Localization_EN } from "material-react-table/locales/en";
import { MRT_Localization_VI } from "material-react-table/locales/vi";
import { GridEmptyState } from "@/components/data-display/grid-empty-state";
import { useAdminTable } from "@/lib/hooks/use-admin-table";
import { useT } from "@/lib/i18n/context";
import type { StaffDocument } from "../types/staff-document";

export function useStaffDocumentsTable(data: StaffDocument[]) {
  const { dict, locale } = useT();
  const d = dict.system.employees;

  const localization =
    locale === "en" ? MRT_Localization_EN : MRT_Localization_VI;

  const columns = useMemo<MRT_ColumnDef<StaffDocument>[]>(
    () => [
      {
        accessorKey: "type",
        header: d.docType,
        size: 140,
        minSize: 100,
        maxSize: 200,
      },
      {
        accessorKey: "name",
        header: d.docName,
        size: 200,
        minSize: 120,
        grow: true,
      },
      {
        accessorKey: "documentNumber",
        header: d.docNumber,
        size: 140,
        minSize: 100,
        maxSize: 180,
      },
      {
        accessorKey: "issuedDate",
        header: d.docIssuedDate,
        size: 120,
        minSize: 90,
        maxSize: 160,
      },
      {
        accessorKey: "issuedBy",
        header: d.docIssuedBy,
        size: 160,
        minSize: 100,
        maxSize: 220,
      },
      {
        accessorKey: "expiryDate",
        header: d.docExpiryDate,
        size: 120,
        minSize: 90,
        maxSize: 160,
      },
    ],
    [d],
  );

  return useAdminTable<StaffDocument>({
    columns,
    data,
    rowCount: data.length,
    getRowId: (row) => String(row.id),
    localization,
    initialState: {
      columnPinning: { left: [], right: ["mrt-row-actions"] },
      showGlobalFilter: false,
    },
    renderEmptyRowsFallback: () => <GridEmptyState title={d.docEmpty} />,
    enableRowActions: false,
    enableStickyHeader: true,
  });
}
