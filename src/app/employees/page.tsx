import type { Metadata } from "next";
import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { EmployeesListScreen } from "./screens/employees-list-screen";

export const metadata: Metadata = {
  title: "Employees",
  description:
    "Master-detail employees screen — the reference port of the Material React Table flow.",
};

export default function EmployeesPage() {
  return (
    <Suspense fallback={<Skeleton className="m-4 h-[80vh]" />}>
      <EmployeesListScreen />
    </Suspense>
  );
}
