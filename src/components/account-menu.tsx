"use client";

import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { signOut } from "next-auth/react";
import { Bell, Heart, Layers, LogOut, ShoppingBag } from "lucide-react";

const LINKS = [
  { href: "/cart", label: "My Cart", icon: ShoppingBag },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/compare", label: "Compare", icon: Layers },
  { href: "/alerts", label: "Price Alerts", icon: Bell },
];

export function AccountMenu({
  name,
  email,
}: {
  name?: string | null;
  email?: string | null;
}) {
  const initial = (name?.[0] ?? email?.[0] ?? "U").toUpperCase();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          aria-label="Account menu"
          className="ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-white shadow-[var(--shadow-brand)] transition-transform duration-200 hover:scale-110"
        >
          {initial}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="glass-float animate-scale-in z-50 w-60 overflow-hidden rounded-2xl p-1.5 shadow-[var(--shadow-3)]"
        >
          <div className="border-b border-line px-3 py-2.5">
            <p className="truncate text-sm font-semibold text-ink">
              {name ?? "My account"}
            </p>
            {email && (
              <p className="truncate text-xs text-ink-subtle">{email}</p>
            )}
          </div>

          <div className="py-1">
            {LINKS.map(({ href, label, icon: Icon }) => (
              <DropdownMenu.Item key={href} asChild>
                <Link
                  href={href}
                  className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-ink-muted outline-none transition-colors data-[highlighted]:bg-accent-soft data-[highlighted]:text-brand-600"
                >
                  <Icon className="h-4 w-4" /> {label}
                </Link>
              </DropdownMenu.Item>
            ))}
          </div>

          <div className="border-t border-line pt-1">
            <DropdownMenu.Item
              onSelect={() => signOut({ callbackUrl: "/" })}
              className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-danger outline-none transition-colors data-[highlighted]:bg-danger-soft"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </DropdownMenu.Item>
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
