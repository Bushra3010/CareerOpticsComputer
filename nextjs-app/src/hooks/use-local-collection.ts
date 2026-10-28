import { useCallback, useEffect, useState } from "react";

/**
 * Client-side persistence for screens the API does not model yet (settings,
 * templates, question banks, QR/payment config). State survives reload via
 * localStorage so the buttons on these pages do real, observable work instead
 * of being decorative. Anything the backend *does* model should go through
 * `api()` instead, which forwards requests to the backend.
 */
function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function useLocalState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => read(key, initial));
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* quota or private-mode; the in-memory value still drives the UI */
    }
  }, [key, value]);
  return [value, setValue] as const;
}

export type WithId = { id: string };

export const newId = (prefix = "row") =>
  `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/** A persisted list with add/update/remove, for the many table-driven pages. */
export function useLocalCollection<T extends WithId>(key: string, initial: T[]) {
  const [items, setItems] = useLocalState<T[]>(key, initial);
  const add = useCallback(
    (item: Omit<T, "id"> & { id?: string }) =>
      setItems((list) => [{ ...item, id: item.id ?? newId() } as T, ...list]),
    [setItems],
  );
  const update = useCallback(
    (id: string, patch: Partial<T>) =>
      setItems((list) => list.map((i) => (i.id === id ? { ...i, ...patch } : i))),
    [setItems],
  );
  const remove = useCallback(
    (id: string) => setItems((list) => list.filter((i) => i.id !== id)),
    [setItems],
  );
  const reset = useCallback(() => setItems(initial), [setItems, initial]);
  return { items, setItems, add, update, remove, reset };
}
