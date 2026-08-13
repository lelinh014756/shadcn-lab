"use client";

/**
 * localStorage persistence for table preferences.
 *
 * SSR-safe: the first render always returns `defaultValue` and hydration
 * happens in an effect, so server and client markup match. Callers gate on
 * `isHydrated` before rendering the table to avoid a settings flicker.
 */

import * as React from "react";

const STORAGE_PREFIX = "tablecn:table-prefs";

interface StoredPrefs<TValue> {
  version: number;
  data: TValue;
}

export interface UseTablePrefsProps<TValue> {
  tableId: string;
  version?: number;
  defaultValue: () => TValue;
  /** Migrate a stored shape after a schema change — drop unknown column ids etc. */
  reconcile?: (stored: TValue) => TValue;
}

export interface TablePrefsHandle<TValue> {
  prefs: TValue;
  setPrefs: (next: TValue) => void;
  clearPrefs: () => void;
  isHydrated: boolean;
}

export function useTablePrefs<TValue>({
  tableId,
  version = 1,
  defaultValue,
  reconcile,
}: UseTablePrefsProps<TValue>): TablePrefsHandle<TValue> {
  const storageKey = `${STORAGE_PREFIX}:${tableId}`;

  const [prefs, setPrefsState] = React.useState<TValue>(defaultValue);
  const [isHydrated, setIsHydrated] = React.useState(false);

  const reconcileRef = React.useRef(reconcile);
  reconcileRef.current = reconcile;
  const defaultValueRef = React.useRef(defaultValue);
  defaultValueRef.current = defaultValue;

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as StoredPrefs<TValue>;
        if (parsed.version === version) {
          const value = reconcileRef.current
            ? reconcileRef.current(parsed.data)
            : parsed.data;
          setPrefsState(value);
        }
        // A version mismatch falls through to the default — the stored shape
        // predates the current schema and reconcile cannot be trusted.
      }
    } catch {
      // Corrupt or unavailable storage: fall back to defaults silently.
    }
    setIsHydrated(true);
  }, [storageKey, version]);

  const setPrefs = React.useCallback(
    (next: TValue) => {
      setPrefsState(next);
      try {
        window.localStorage.setItem(
          storageKey,
          JSON.stringify({ version, data: next } satisfies StoredPrefs<TValue>),
        );
      } catch {
        // Quota or private-mode failures must not break the table.
      }
    },
    [storageKey, version],
  );

  const clearPrefs = React.useCallback(() => {
    setPrefsState(defaultValueRef.current());
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
  }, [storageKey]);

  return { prefs, setPrefs, clearPrefs, isHydrated };
}
