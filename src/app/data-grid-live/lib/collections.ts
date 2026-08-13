import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { createCollection } from "@tanstack/react-db";
import { QueryClient } from "@tanstack/react-query";

import {
  deleteSkaters,
  insertSkaters,
  listSkaters,
  updateSkaters,
} from "@/mocks/skaters";
import { type SkaterSchema, skaterSchema } from "./validation";

const queryClient = new QueryClient();

/**
 * Backed by the in-memory mock store instead of `/api/skaters`.
 * The optimistic-mutation surface is unchanged — only the transport is.
 */
export const skatersCollection = createCollection(
  queryCollectionOptions({
    id: "skaters",
    queryKey: ["skaters"],
    queryClient,
    queryFn: async (): Promise<SkaterSchema[]> => {
      const rows = await listSkaters();
      const data = skaterSchema.array().safeParse(rows).data;

      if (!data) {
        throw new Error("Failed to parse skaters");
      }

      return data;
    },
    getKey: (item: SkaterSchema) => item.id,
    schema: skaterSchema,
    onInsert: async ({ transaction }) => {
      const skatersToInsert = transaction.mutations
        .map((m) => m?.modified)
        .filter((modified): modified is SkaterSchema => modified != null)
        .map(
          ({
            // Exclude auto-generated timestamp fields (but keep id!)
            createdAt: _createdAt,
            updatedAt: _updatedAt,
            ...data
          }) => data,
        );

      if (skatersToInsert.length === 0) return;

      await insertSkaters(skatersToInsert);
    },
    onUpdate: async ({ transaction }) => {
      const updates = transaction.mutations
        .filter(
          (
            m,
          ): m is typeof m & {
            key: string;
            changes: Partial<SkaterSchema>;
          } => m?.key != null && m?.changes != null,
        )
        .map((m) => ({ id: m.key, changes: m.changes }));

      if (updates.length === 0) return;

      await updateSkaters(updates);
    },
    onDelete: async ({ transaction }) => {
      const ids = transaction.mutations
        .map((m) => m?.key)
        .filter((id): id is string => id != null);

      if (ids.length === 0) return;

      await deleteSkaters(ids);
    },
  }),
);
