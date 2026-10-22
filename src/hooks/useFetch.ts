import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";

// Loads data when the screen is shown, and again each time you come back to it.
export function useFetch<T>(load: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const loadRef = useRef(load);
  loadRef.current = load;

  const run = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      setData(await loadRef.current());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useFocusEffect(
    useCallback(() => {
      run();
    }, [run]),
  );

  return { data, setData, error, loading, refreshing, reload: run, refresh: () => run(true) };
}
