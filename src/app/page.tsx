import { Suspense } from "react";

import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { Shell } from "@/components/shell";
import { FeatureFlagsProvider } from "./components/feature-flags-provider";
import { TasksTable } from "./components/tasks-table";

export default function IndexPage() {
  return (
    <Shell>
      <Suspense
        fallback={
          <DataTableSkeleton
            columnCount={7}
            filterCount={2}
            cellWidths={[
              "10rem",
              "30rem",
              "10rem",
              "10rem",
              "6rem",
              "6rem",
              "6rem",
            ]}
            shrinkZero
          />
        }
      >
        <FeatureFlagsProvider>
          <TasksTable />
        </FeatureFlagsProvider>
      </Suspense>
    </Shell>
  );
}
