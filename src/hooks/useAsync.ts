import { useState, useCallback } from "react";

interface AsyncState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
}

export function useAsync<T>() {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    isLoading: false,
  });

  const run = useCallback((promise: Promise<T>) => {
    setState({ data: null, error: null, isLoading: true });
    return promise
      .then((data) => {
        setState({ data, error: null, isLoading: false });
        return data;
      })
      .catch((error) => {
        setState({ data: null, error, isLoading: false });
        throw error;
      });
  }, []);

  return { ...state, run };
}
