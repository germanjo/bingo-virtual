import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';

/** Hydrate after mount so Astro's server and first client render agree. */
export function useStoredState<T>(
  key: string,
  fallback: T,
  validate: (value: unknown) => value is T,
) {
  const [value, setValue] = useState(fallback);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect -- Browser-only hydration and storage failure feedback must happen after the SSR-compatible initial render. */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) {
        const saved: unknown = JSON.parse(raw);
        if (validate(saved)) setValue(saved);
      }
    } catch {
      // Invalid JSON is recoverable, just like unavailable browser storage.
      setStorageError(true);
    }
    setReady(true);
  }, [key, validate]);

  useEffect(() => {
    // Never overwrite a saved game with the pre-hydration defaults.
    if (!ready) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [key, value, ready]);
  /* eslint-enable react-hooks/set-state-in-effect */

  return { value, setValue, ready, storageError } satisfies {
    value: T;
    setValue: Dispatch<SetStateAction<T>>;
    ready: boolean;
    storageError: boolean;
  };
}
