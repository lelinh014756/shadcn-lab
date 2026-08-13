/**
 * In-memory replacement for the database layer.
 *
 * Holds rows in a module-scoped array, supports the CRUD surface the demos
 * need, and notifies subscribers so multiple views of the same collection
 * stay in sync. Seeded lazily so the cost is paid on first read only.
 */

export interface MockStore<TData> {
  getAll: () => TData[];
  getById: (id: string) => TData | undefined;
  insert: (items: TData[], at?: "start" | "end") => TData[];
  update: (id: string, patch: Partial<TData>) => TData | undefined;
  updateMany: (ids: string[], patch: Partial<TData>) => TData[];
  remove: (ids: string[]) => TData[];
  replaceAll: (items: TData[]) => void;
  subscribe: (listener: () => void) => () => void;
}

export function createMockStore<TData>({
  seed,
  getKey,
}: {
  seed: () => TData[];
  getKey: (item: TData) => string;
}): MockStore<TData> {
  let rows: TData[] | null = null;
  const listeners = new Set<() => void>();

  function getRows() {
    if (rows === null) {
      rows = seed();
    }
    return rows;
  }

  function notify() {
    for (const listener of listeners) {
      listener();
    }
  }

  return {
    getAll() {
      return [...getRows()];
    },
    getById(id) {
      return getRows().find((row) => getKey(row) === id);
    },
    insert(items, at = "end") {
      const current = getRows();
      rows = at === "start" ? [...items, ...current] : [...current, ...items];
      notify();
      return items;
    },
    update(id, patch) {
      let updated: TData | undefined;
      rows = getRows().map((row) => {
        if (getKey(row) !== id) return row;
        updated = { ...row, ...patch };
        return updated;
      });
      if (updated) notify();
      return updated;
    },
    updateMany(ids, patch) {
      const idSet = new Set(ids);
      const updated: TData[] = [];
      rows = getRows().map((row) => {
        if (!idSet.has(getKey(row))) return row;
        const next = { ...row, ...patch };
        updated.push(next);
        return next;
      });
      if (updated.length > 0) notify();
      return updated;
    },
    remove(ids) {
      const idSet = new Set(ids);
      const current = getRows();
      const removed = current.filter((row) => idSet.has(getKey(row)));
      rows = current.filter((row) => !idSet.has(getKey(row)));
      if (removed.length > 0) notify();
      return removed;
    },
    replaceAll(items) {
      rows = [...items];
      notify();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
