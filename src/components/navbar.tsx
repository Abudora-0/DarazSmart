"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShoppingBag,
  ShoppingCart,
  Bell,
  Tag,
  LogIn,
  Search,
  X,
} from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useSession } from "next-auth/react";
import { SearchBar } from "@/components/search-bar";
import { AccountMenu } from "@/components/account-menu";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const cartCount = useCartStore((s) => s.items.length);
  const { data: session } = useSession();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [badgeBump, setBadgeBump] = useState(false);
  const prevCartCount = useRef(cartCount);

  useEffect(() => {
    if (cartCount > prevCartCount.current) {
      setBadgeBump(true);
    }
    prevCartCount.current = cartCount;
  }, [cartCount]);

  const navItems = [
    { href: "/coupons", label: "Coupons", icon: Tag },
    { href: "/alerts", label: "Alerts", icon: Bell },
    { href: "/cart", label: "Cart", icon: ShoppingBag, badge: cartCount },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-white/50 bg-white/45 backdrop-blur-xl">
      <div className="flex items-center gap-4 px-4 py-3.5 sm:px-6">
        {/* Logo — hidden while the mobile search row takes over */}
        <Link
          href="/"
          className={cn(
            "group flex shrink-0 items-center gap-2",
            mobileSearchOpen && "hidden sm:flex"
          )}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-sm shadow-brand-500/40 transition-transform group-hover:scale-105">
            <ShoppingCart className="h-[18px] w-[18px]" strokeWidth={2.5} />
          </span>
          <span className="font-brand hidden text-xl font-bold tracking-tight sm:block">
            <span className="text-amber-400">Daraz</span>
            <span className="text-brand-500">Smart</span>
          </span>
        </Link>

        {/* Search — always inline from sm up */}
        <div className="hidden flex-1 sm:block">
          <SearchBar variant="compact" />
        </div>

        {/* Mobile: collapsed to a search icon until tapped */}
        {!mobileSearchOpen && (
          <button
            onClick={() => setMobileSearchOpen(true)}
            aria-label="Open search"
            className="ml-auto flex h-10 w-10 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-gray-100 sm:hidden"
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
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-gray-400 transition-colors hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Right nav — hidden on mobile while search is expanded */}
        <nav
          className={cn(
            "items-center gap-1",
            mobileSearchOpen ? "hidden sm:flex" : "flex"
          )}
        >
          {navItems.map(({ href, label, icon: Icon, badge }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-sm font-medium transition-colors sm:px-3",
                pathname === href
                  ? "bg-brand-50 text-brand-600"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
              )}
            >
              <span className="relative">
                <Icon className="h-[18px] w-[18px]" />
                {badge !== undefined && badge > 0 && (
                  <span
                    onAnimationEnd={() => setBadgeBump(false)}
                    className={cn(
                      "absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-bold text-white",
                      href === "/cart" && badgeBump && "animate-bump"
                    )}
                  >
                    {badge}
                  </span>
                )}
              </span>
              <span className="hidden lg:inline">{label}</span>
            </Link>
          ))}

          {session ? (
            <AccountMenu
              name={session.user?.name}
              email={session.user?.email}
            />
          ) : (
            <button
              onClick={() => router.push("/auth/signin")}
              className="ml-1 flex items-center gap-1.5 rounded-xl bg-brand-500 px-3.5 py-2 text-sm font-semibold text-white shadow-sm shadow-brand-500/30 transition-colors hover:bg-brand-600"
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
