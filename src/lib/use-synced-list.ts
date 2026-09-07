"use client";

import { useCallback, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { toast } from "@/lib/toast";

export interface SyncedListConfig<T> {
  /** Whether the local persisted store has finished reading localStorage. */
  hydrated: boolean;
  /** The store's current items, used only to trigger the push effect. */
  items: T[];
  /**
   * Reads straight from the store, so effects never see a stale list.
   * Pass a stable, module-level function (e.g. `() => useCartStore.getState().items`
   * assigned to a name), not an inline arrow, so the effects below do not
   * re-subscribe on every render.
   */
  getLocalItems: () => T[];
  /** A store action; stable across renders like any zustand action. */
  replaceAll: (items: T[]) => void;
  /** A store action; stable across renders like any zustand action. */
  clear: () => void;
  /** Identifies an item so a local edit mid-merge can be reconciled by id. */
  getId: (item: T) => string;
  /** A content-only fingerprint (order-independent) for change detection. */
  signature: (items: T[]) => string;
  /** Shapes items into the request body the API route expects. */
  toInput: (items: T[]) => unknown;
  /** GET to read the account's copy, PUT to replace it. */
  apiPath: string;
  /** POST once per sign-in to merge the device's items into the account. */
  syncPath: string;
  /** Optional success toast after a merge that changed something. */
  restoredMessage?: (gainedCount: number, hadLocalItems: boolean) => string | null;
  pushDebounceMs?: number;
}

/**
 * Keeps one persisted local list (cart, wishlist, compare) in step with its
 * signed-in account copy.
 *
 * The local store stays what the UI renders, so nothing waits on the
 * network. This hook is the bridge, run once per list:
 *
 *  - on sign-in, the device's list is merged into the account's and the
 *    combined result is adopted locally
 *  - later local edits are pushed, debounced
 *  - returning to the tab pulls anything another device changed, unless a
 *    local edit is still queued (which would only get clobbered)
 *  - signing out clears the local copy; the account keeps its own
 *
 * Three call sites (cart, wishlist, compare) share this rather than each
 * carrying its own near-identical set of effects.
 */
export function useSyncedList<T>(config: SyncedListConfig<T>) {
  const {
    hydrated,
    items,
    getLocalItems,
    replaceAll,
    clear,
    getId,
    signature,
    toInput,
    apiPath,
    syncPath,
    restoredMessage,
    pushDebounceMs = 800,
  } = config;

  const { status } = useSession();

  // What we believe the server currently holds. Null until the first merge,
  // which is also what gates every other effect below.
  const serverSig = useRef<string | null>(null);
  const pushTimer = useRef<number | undefined>(undefined);
  const inFlight = useRef(false);
  const wasAuthed = useRef(false);

  const adopt = useCallback(
    (serverItems: T[]) => {
      serverSig.current = signature(serverItems);
      replaceAll(serverItems);
    },
    [replaceAll, signature]
  );

  // 1. Sign-in: merge this device's list into the account.
  useEffect(() => {
    if (status !== "authenticated" || !hydrated) return;
    if (serverSig.current !== null) return;

    let cancelled = false;
    const local = getLocalItems();

    (async () => {
      try {
        const res = await fetch(syncPath, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: toInput(local) }),
        });
        if (!res.ok) throw new Error(String(res.status));
        const data = await res.json();
        if (cancelled) return;

        const merged: T[] = data.items ?? [];
        const latestLocal = getLocalItems();

        if (signature(latestLocal) === signature(local)) {
          // Nothing happened locally while the request was in flight: the
          // server's merge is simply the new truth.
          adopt(merged);
        } else {
          // The user edited the list while it was merging (an add, a
          // removal, a quantity change). Blindly adopting `merged` here
          // would silently throw that edit away, since it reflects the list
          // as it was before the edit. Layer the edit on top instead: for
          // any id present in the current local list, its local version
          // wins over the server's; anything the user removed since the
          // snapshot stays removed; anything untouched keeps the server's
          // merged value.
          const removedByUser = new Set(
            local.map(getId).filter((id) => !latestLocal.some((i) => getId(i) === id))
          );
          const byId = new Map<string, T>();
          merged.forEach((item) => byId.set(getId(item), item));
          removedByUser.forEach((id) => byId.delete(id));
          latestLocal.forEach((item) => byId.set(getId(item), item));
          const reconciled = [...byId.values()];

          // serverSig reflects what the server actually holds right now
          // (`merged`), not `reconciled`, so the push effect notices the
          // difference and sends the reconciled state up on its own.
          serverSig.current = signature(merged);
          replaceAll(reconciled);
        }

        const gained = merged.length - local.length;
        const message = restoredMessage?.(gained, local.length > 0);
        if (message) toast(message, { variant: "success" });
      } catch {
        // Offline or the request failed. Leave the local list alone and let
        // the next mount try again rather than losing what is on this device.
        if (!cancelled) serverSig.current = null;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    status,
    hydrated,
    adopt,
    syncPath,
    toInput,
    restoredMessage,
    getLocalItems,
    getId,
    signature,
    replaceAll,
  ]);

  // 2. Push local edits back up, debounced so a burst of clicks is one
  //    request rather than several.
  useEffect(() => {
    if (status !== "authenticated" || !hydrated) return;
    if (serverSig.current === null) return;

    const sig = signature(items);
    if (sig === serverSig.current) return;

    window.clearTimeout(pushTimer.current);
    pushTimer.current = window.setTimeout(async () => {
      if (inFlight.current) return;
      inFlight.current = true;
      try {
        const res = await fetch(apiPath, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: toInput(items) }),
        });
        if (res.ok) serverSig.current = sig;
      } catch {
        // Keep serverSig as it was so the next edit retries this push.
      } finally {
        inFlight.current = false;
      }
    }, pushDebounceMs);

    return () => window.clearTimeout(pushTimer.current);
  }, [items, status, hydrated, apiPath, pushDebounceMs, toInput, signature]);

  // 3. Coming back to the tab pulls whatever another device did meanwhile.
  useEffect(() => {
    if (status !== "authenticated") return;

    async function pull() {
      if (document.visibilityState !== "visible") return;
      if (serverSig.current === null || inFlight.current) return;
      // A local edit is still queued; a pull here would only clobber it.
      if (signature(getLocalItems()) !== serverSig.current) return;

      try {
        const res = await fetch(apiPath);
        if (!res.ok) return;
        const data = await res.json();
        const remote: T[] = data.items ?? [];
        if (signature(remote) !== serverSig.current) adopt(remote);
      } catch {
        // A failed refresh just means this device keeps showing what it has.
      }
    }

    document.addEventListener("visibilitychange", pull);
    window.addEventListener("focus", pull);
    return () => {
      document.removeEventListener("visibilitychange", pull);
      window.removeEventListener("focus", pull);
    };
  }, [status, adopt, apiPath, signature, getLocalItems]);

  // 4. Sign-out empties this device. The list is safe on the account. This
  //    is a backstop: the sign-out button itself clears synchronously,
  //    since waiting for this status transition can race the redirect.
  useEffect(() => {
    if (status === "authenticated") {
      wasAuthed.current = true;
      return;
    }
    if (status === "unauthenticated" && wasAuthed.current) {
      wasAuthed.current = false;
      serverSig.current = null;
      clear();
    }
  }, [status, clear]);
}
