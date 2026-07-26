"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Bell, ShoppingBag, LogOut } from "lucide-react";

export function AccountMenu({
  name,
  email,
}: {
  name?: string | null;
  email?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const initial = (name?.[0] ?? email?.[0] ?? "U").toUpperCase();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  return (
    <div ref={ref} className="relative ml-1">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-white shadow-sm shadow-brand-500/30 transition-transform hover:scale-105"
        aria-label="Account menu"
      >
        {initial}
      </button>

      {open && (
        <div className="glass-float animate-fade-up absolute right-0 z-50 mt-2 w-60 origin-top-right overflow-hidden rounded-2xl p-1.5 shadow-[0_20px_50px_-15px_rgba(120,45,10,0.35)]">
          <div className="border-b border-gray-100 px-3 py-2.5">
            <p className="truncate text-sm font-semibold text-[#1c1917]">
              {name ?? "My account"}
            </p>
            {email && (
              <p className="truncate text-xs text-gray-400">{email}</p>
            )}
          </div>

          <div className="py-1">
            <Link
              href="/cart"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-brand-50 hover:text-brand-600"
            >
              <ShoppingBag className="h-4 w-4" /> My Cart
            </Link>
            <Link
              href="/alerts"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-brand-50 hover:text-brand-600"
            >
              <Bell className="h-4 w-4" /> Price Alerts
            </Link>
          </div>

          <div className="border-t border-gray-100 pt-1">
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-rose-500 transition-colors hover:bg-rose-50"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
