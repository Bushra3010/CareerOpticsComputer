import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { WithId } from "@/hooks/use-local-collection";

type ApiCollectionState<T extends WithId> = {
  items: T[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  add: (item: Omit<T, "id"> & { id?: string }) => Promise<T | undefined>;
  update: (id: string, patch: Partial<T>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  setItems: React.Dispatch<React.SetStateAction<T[]>>;
};

export function useApiCollection<T extends WithId>(
  table: string,
  fallbackItems: T[],
  options?: { enabled?: boolean; select?: string },
): ApiCollectionState<T> {
  const { toast } = useToast();
  const [items, setItems] = useState<T[]>(fallbackItems);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { select } = options ?? {};
      const query = supabase.from(table).select(select ?? "*");
      const { data, error: err } = await query;

      if (err) throw new Error(err.message);
      setItems((data as unknown as T[]) ?? []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load data";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [table, options?.select]);

  useEffect(() => {
    if (options?.enabled === false) {
      setLoading(false);
      return;
    }
    void refresh();
  }, [refresh, options?.enabled]);

  const add = useCallback(
    async (item: Omit<T, "id"> & { id?: string }): Promise<T | undefined> => {
      try {
        const { data, error: err } = await supabase
          .from(table)
          .insert(item)
          .select("*")
          .single();

        if (err) throw new Error(err.message);
        setItems((list) => [data as T, ...list]);
        toast({ title: "Saved", description: "Record created successfully." });
        return data as T;
      } catch (err) {
        toast({
          title: "Failed to save",
          description: err instanceof Error ? err.message : "Unknown error",
          variant: "destructive",
        });
        return undefined;
      }
    },
    [table, toast],
  );

  const update = useCallback(
    async (id: string, patch: Partial<T>) => {
      try {
        const { error: err } = await supabase
          .from(table)
          .update(patch as Record<string, unknown>)
          .eq("id", id);

        if (err) throw new Error(err.message);
        setItems((list) => list.map((i) => (i.id === id ? { ...i, ...patch } : i)));
        toast({ title: "Updated", description: "Record updated successfully." });
      } catch (err) {
        toast({
          title: "Update failed",
          description: err instanceof Error ? err.message : "Unknown error",
          variant: "destructive",
        });
      }
    },
    [table, toast],
  );

  const removeCb = useCallback(
    async (id: string) => {
      try {
        const { error: err } = await supabase
          .from(table)
          .delete()
          .eq("id", id);

        if (err) throw new Error(err.message);
        setItems((list) => list.filter((i) => i.id !== id));
        toast({ title: "Deleted", description: "Record removed." });
      } catch (err) {
        toast({
          title: "Delete failed",
          description: err instanceof Error ? err.message : "Unknown error",
          variant: "destructive",
        });
      }
    },
    [table, toast],
  );

  return { items, loading, error, refresh, add, update, remove: removeCb, setItems };
}
