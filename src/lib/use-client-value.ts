"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";

const neverChanges = () => () => {};

/**
 * Reads a browser-only value (localStorage, history, matchMedia) once the
 * client has taken over, without a setState inside an effect.
 *
 * `read` runs only in the browser and its result is cached, so the snapshot
 * stays referentially stable, which useSyncExternalStore requires.
 */
export function useClientValue<T>(read: () => T, serverValue: T): T {
  const cache = useRef<{ value: T } | null>(null);

  const getSnapshot = useCallback(() => {
    if (!cache.current) cache.current = { value: read() };
    return cache.current.value;
    // `read` is expected to be a stable module-level function.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getServerSnapshot = useCallback(() => serverValue, [serverValue]);

  return useSyncExternalStore(neverChanges, getSnapshot, getServerSnapshot);
}
