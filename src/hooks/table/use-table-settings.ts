"use client";

/**
 * Draft / applied settings state machine, ported from the reference MRT module's
 * `useAdminTableSettings`.
 *
 *   draft   — what the sheet is editing right now
 *   applied — what the table renders from, and what is persisted
 *
 * The split exists so a user can rearrange columns freely and only pay the
 * re-render on Apply. `patchApplied` is the escape hatch for changes that must
 * land immediately without an Apply — column resizing is the motivating case.
 */

import * as React from "react";

import { type TablePrefsHandle, useTablePrefs } from "./use-table-prefs";

export interface UseTableSettingsProps<TSettings> {
  tableId: string;
  version?: number;
  defaultValue: () => TSettings;
  reconcile?: (stored: TSettings) => TSettings;
  clone?: (settings: TSettings) => TSettings;
}

export interface TableSettingsHandle<TSettings> {
  draft: TSettings;
  applied: TSettings;
  isHydrated: boolean;
  /** Edit the draft without touching what the table renders. */
  patchDraft: (patch: Partial<TSettings>) => void;
  /** Write straight through to applied + storage, bypassing Apply. */
  patchApplied: (patch: Partial<TSettings>) => void;
  /** Commit draft → applied. */
  apply: (
    onBeforeApply?: (draft: TSettings, applied: TSettings) => void,
  ) => void;
  /** Discard draft edits. */
  reset: () => void;
  /** Reset applied + draft to defaults and drop the stored value. */
  clear: () => void;
  prefs: TablePrefsHandle<TSettings>;
}

function shallowClone<TSettings>(settings: TSettings): TSettings {
  return structuredClone(settings);
}

export function useTableSettings<TSettings>({
  tableId,
  version = 1,
  defaultValue,
  reconcile,
  clone = shallowClone,
}: UseTableSettingsProps<TSettings>): TableSettingsHandle<TSettings> {
  const prefs = useTablePrefs<TSettings>({
    tableId,
    version,
    defaultValue,
    reconcile,
  });

  const [draft, setDraft] = React.useState<TSettings>(() => clone(prefs.prefs));

  // Adopt the stored value into the draft once hydration lands, unless the user
  // has already started editing.
  const hasEditedRef = React.useRef(false);
  const cloneRef = React.useRef(clone);
  cloneRef.current = clone;
  const prefsRef = React.useRef(prefs.prefs);
  prefsRef.current = prefs.prefs;

  React.useEffect(() => {
    if (prefs.isHydrated && !hasEditedRef.current) {
      setDraft(cloneRef.current(prefsRef.current));
    }
  }, [prefs.isHydrated]);

  const patchDraft = React.useCallback((patch: Partial<TSettings>) => {
    hasEditedRef.current = true;
    setDraft((prev) => ({ ...prev, ...patch }));
  }, []);

  const patchApplied = React.useCallback(
    (patch: Partial<TSettings>) => {
      const next = { ...prefs.prefs, ...patch };
      prefs.setPrefs(next);
      setDraft((prev) => ({ ...prev, ...patch }));
    },
    [prefs],
  );

  const apply = React.useCallback(
    (onBeforeApply?: (draft: TSettings, applied: TSettings) => void) => {
      onBeforeApply?.(draft, prefs.prefs);
      prefs.setPrefs(clone(draft));
      hasEditedRef.current = false;
    },
    [clone, draft, prefs],
  );

  const reset = React.useCallback(() => {
    setDraft(clone(prefs.prefs));
    hasEditedRef.current = false;
  }, [clone, prefs.prefs]);

  const clear = React.useCallback(() => {
    const next = defaultValue();
    prefs.clearPrefs();
    setDraft(clone(next));
    hasEditedRef.current = false;
  }, [clone, defaultValue, prefs]);

  return {
    draft,
    applied: prefs.prefs,
    isHydrated: prefs.isHydrated,
    patchDraft,
    patchApplied,
    apply,
    reset,
    clear,
    prefs,
  };
}
