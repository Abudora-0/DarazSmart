"use client";

import { useCallback, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useCartStore, type CartProduct } from "@/store/cart";
import { useStoreHydrated } from "@/lib/use-store-hydrated";
import { toast } from "@/lib/toast";

const PUSH_DEBOUNCE = 800;

/**
 * A stable string for a cart's contents, so we can tell "the same cart the
 * server already has" from "something the user actually changed". Sorted,
 * because item order is not meaningful.
 */
function signature(items: { id: string; quantity: number }[]) {
  return items
    .map((i) => `${i.id}:${i.quantity}`)
    .sort()
    .join("|");
}

function toInput(items: CartProduct[]) {
  return items.map((i) => ({ id: i.id, quantity: i.quantity }));
}

/**
 * Keeps the signed-in cart in step with the account.
 *
 * The local Zustand store stays the thing the UI renders, so nothing has to
 * wait on the network. This component is the bridge:
 *
 *  - on sign-in, the device's cart is merged into the account's and the
 *    combined result is adopted locally
 *  - later local edits are pushed, debounced
 *  - returning to the tab pulls anything another device changed
 *  - signing out clears the local copy, so a shared device does not leak a
 *    cart to whoever signs in next
 */
export function CartSync() {
  const { status } = useSession();
  const hydrated = useStoreHydrated(useCartStore);
  const items = useCartStore((s) => s.items);
  const replaceAll = useCartStore((s) => s.replaceAll);
  const clearCart = useCartStore((s) => s.clearCart);

  // What we believe the server currently holds. Null until the first merge,
  // which is also what gates pushing.
  const serverSig = useRef<string | null>(null);
  const pushTimer = useRef<number | undefined>(undefined);
  const inFlight = useRef(false);
  const wasAuthed = useRef(false);

  const adopt = useCallback(
    (serverItems: CartProduct[]) => {
      serverSig.current = signature(toInput(serverItems));
      replaceAll(serverItems);
    },
    [replaceAll]
  );

  // 1. Sign-in: merge this device's cart into the account.
  useEffect(() => {
    if (status !== "authenticated" || !hydrated) return;
    if (serverSig.current !== null) return;

    let cancelled = false;
    // Read straight from the store rather than closing over `items`, so this
    // effect does not re-run on every cart edit.
    const local = toInput(useCartStore.getState().items);

    (async () => {
      try {
        const res = await fetch("/api/cart/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: local }),
        });
        if (!res.ok) throw new Error(String(res.status));
        const data = await res.json();
        if (cancelled) return;

        const merged: CartProduct[] = data.items ?? [];
        const gained = merged.length - local.length;
        adopt(merged);
        if (gained > 0 && local.length > 0) {
          toast(
            `Restored ${gained} item${gained === 1 ? "" : "s"} from your other devices`,
            { variant: "success" }
          );
        }
      } catch {
        // Offline or the request failed. Leave the local cart alone and let
        // the next mount try again rather than losing what is on this device.
        if (!cancelled) serverSig.current = null;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [status, hydrated, adopt]);

  // 2. Push local edits back up, debounced so a held quantity stepper is one
  //    request rather than a dozen.
  useEffect(() => {
    if (status !== "authenticated" || !hydrated) return;
    if (serverSig.current === null) return;

    const local = toInput(items);
    const sig = signature(local);
    if (sig === serverSig.current) return;

    window.clearTimeout(pushTimer.current);
    pushTimer.current = window.setTimeout(async () => {
      if (inFlight.current) return;
      inFlight.current = true;
      try {
        const res = await fetch("/api/cart", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: local }),
        });
        if (res.ok) serverSig.current = sig;
      } catch {
        // Keep serverSig as it was so the next edit retries this push.
      } finally {
        inFlight.current = false;
      }
    }, PUSH_DEBOUNCE);

    return () => window.clearTimeout(pushTimer.current);
  }, [items, status, hydrated]);

  // 3. Coming back to the tab pulls whatever another device did meanwhile.
  useEffect(() => {
    if (status !== "authenticated") return;

    async function pull() {
      if (document.visibilityState !== "visible") return;
      if (serverSig.current === null || inFlight.current) return;
      // A local edit is still queued; it would only be clobbered by a pull.
      if (signature(toInput(useCartStore.getState().items)) !== serverSig.current)
        return;

      try {
        const res = await fetch("/api/cart");
        if (!res.ok) return;
        const data = await res.json();
        const remote: CartProduct[] = data.items ?? [];
        if (signature(toInput(remote)) !== serverSig.current) adopt(remote);
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
  }, [status, adopt]);

  // 4. Sign-out empties this device. The cart is safe on the account.
  useEffect(() => {
    if (status === "authenticated") {
      wasAuthed.current = true;
      return;
    }
    if (status === "unauthenticated" && wasAuthed.current) {
      wasAuthed.current = false;
      serverSig.current = null;
      clearCart();
    }
  }, [status, clearCart]);

  return null;
}
