"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShoppingBag,
  ShoppingCart,
  Bell,
  Tag,
  Heart,
  LogIn,
  Search,
  X,
} from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import { useSession } from "next-auth/react";
import { SearchBar } from "@/components/search-bar";
import { AccountMenu } from "@/components/account-menu";
import { ThemeToggle, ThemeToggleCompact } from "@/components/theme-toggle";
import { CommandPalette } from "@/components/command-palette";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const cartCount = useCartStore((s) =>
    s.items.reduce((n, i) => n + i.quantity, 0)
  );
  const wishCount = useWishlistStore((s) => s.items.length);
  const { data: session } = useSession();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [bumped, setBumped] = useState<string | null>(null);
  const prevCounts = useRef({ cart: cartCount, wish: wishCount });

  useEffect(() => {
    if (cartCount > prevCounts.current.cart) setBumped("/cart");
    else if (wishCount > prevCounts.current.wish) setBumped("/wishlist");
    prevCounts.current = { cart: cartCount, wish: wishCount };
  }, [cartCount, wishCount]);

  const navItems = [
    { href: "/coupons", label: "Coupons", icon: Tag, badge: 0 },
    { href: "/alerts", label: "Alerts", icon: Bell, badge: 0 },
    { href: "/wishlist", label: "Wishlist", icon: Heart, badge: wishCount },
    { href: "/cart", label: "Cart", icon: ShoppingBag, badge: cartCount },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/55 backdrop-blur-xl">
      <div className="flex items-center gap-3 px-4 py-3.5 sm:px-6">
        {/* Logo, hidden while the mobile search row takes over */}
        <Link
          href="/"
          className={cn(
            "group flex shrink-0 items-center gap-2",
            mobileSearchOpen && "hidden sm:flex"
          )}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-[var(--shadow-brand)] transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
            <ShoppingCart className="h-[18px] w-[18px]" strokeWidth={2.5} />
          </span>
          <span className="font-brand hidden text-xl font-bold tracking-tight sm:block">
            <span className="text-amber-400">Daraz</span>
            <span className="text-brand-500">Smart</span>
          </span>
        </Link>

        {/* Search, always inline from sm up */}
        <div className="hidden flex-1 sm:block">
          <SearchBar variant="compact" />
        </div>

        {/* Mobile: collapsed to a search icon until tapped */}
        {!mobileSearchOpen && (
          <button
            onClick={() => setMobileSearchOpen(true)}
            aria-label="Open search"
            className="ml-auto flex h-10 w-10 items-center justify-center rounded-xl text-ink-muted transition-colors hover:bg-sunken sm:hidden"
          >
            <Search className="h-5 w-5" />
          </button>
        )}
        {mobileSearchOpen && (
          <div className="flex flex-1 items-center gap-2 sm:hidden">
            <SearchBar variant="compact" />
            <button
              onClick={() => setMobileSearchOpen(false)}
              aria-label="Close search"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-ink-subtle transition-colors hover:bg-sunken"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Right nav, hidden on mobile while search is expanded */}
        <nav
          className={cn(
            "items-center gap-1",
            mobileSearchOpen ? "hidden sm:flex" : "flex"
          )}
        >
          <CommandPalette />

          {navItems.map(({ href, label, icon: Icon, badge }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-sm font-medium transition-colors sm:px-3",
                pathname === href
                  ? "bg-accent-soft text-brand-600"
                  : "text-ink-muted hover:bg-sunken hover:text-ink"
              )}
            >
              <span className="relative">
                <Icon className="h-[18px] w-[18px]" />
                {badge > 0 && (
                  <span
                    onAnimationEnd={() => setBumped(null)}
                    className={cn(
                      "absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-bold text-white",
                      bumped === href && "animate-bump"
                    )}
                  >
                    {badge > 99 ? "99+" : badge}
                  </span>
                )}
              </span>
              <span className="hidden xl:inline">{label}</span>
            </Link>
          ))}

          {/* The segmented control needs room the phone navbar does not
              have, so small screens get the cycling single button. */}
          <ThemeToggleCompact className="sm:hidden" />
          <ThemeToggle className="ml-1 hidden sm:flex" />

          {session ? (
            <AccountMenu name={session.user?.name} email={session.user?.email} />
          ) : (
            <button
              onClick={() => router.push("/auth/signin")}
              className="ml-1 flex items-center gap-1.5 rounded-xl bg-brand-500 px-3.5 py-2 text-sm font-semibold text-white shadow-[var(--shadow-brand)] transition-[background-color,transform] duration-200 hover:bg-brand-600 active:scale-95"
            >
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">Sign in</span>
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
