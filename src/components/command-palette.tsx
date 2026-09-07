"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import {
  Bell,
  Clock,
  CornerDownLeft,
  Heart,
  Home,
  Layers,
  Monitor,
  Moon,
  Search,
  ShoppingBag,
  Sun,
  Tag,
  TrendingUp,
} from "lucide-react";
import { addRecentSearch, getRecentSearches } from "@/lib/recent";
import { setTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

interface Command {
  id: string;
  label: string;
  hint?: string;
  section: string;
  icon: React.ElementType;
  run: () => void;
}

const CATEGORIES = [
  "Deals",
  "Electronics",
  "Mobiles",
  "Fashion",
  "Home",
  "Beauty",
  "Appliances",
  "Sports",
  "Toys",
  "Groceries",
];

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [recent, setRecent] = useState<string[]>([]);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((wasOpen) => {
          if (!wasOpen) {
            setQuery("");
            setActive(0);
            setRecent(getRecentSearches());
          }
          return !wasOpen;
        });
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function onOpenChange(next: boolean) {
    // Resetting here rather than in an effect keeps the palette from painting
    // once with the previous query still in the box.
    if (next) {
      setQuery("");
      setActive(0);
      setRecent(getRecentSearches());
    }
    setOpen(next);
  }

  const go = useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router]
  );

  const search = useCallback(
    (term: string) => {
      const t = term.trim();
      if (!t) return;
      addRecentSearch(t);
      go(`/search?q=${encodeURIComponent(t)}`);
    },
    [go]
  );

  const commands = useMemo<Command[]>(() => {
    const list: Command[] = [];

    if (query.trim()) {
      list.push({
        id: "search-query",
        label: `Search for "${query.trim()}"`,
        hint: "Enter",
        section: "Search",
        icon: Search,
        run: () => search(query),
      });
    }

    recent.forEach((term) =>
      list.push({
        id: `recent-${term}`,
        label: term,
        section: "Recent searches",
        icon: Clock,
        run: () => search(term),
      })
    );

    (
      [
        { label: "Home", href: "/", icon: Home },
        { label: "Cart", href: "/cart", icon: ShoppingBag },
        { label: "Wishlist", href: "/wishlist", icon: Heart },
        { label: "Compare", href: "/compare", icon: Layers },
        { label: "Coupons", href: "/coupons", icon: Tag },
        { label: "Price alerts", href: "/alerts", icon: Bell },
      ] as const
    ).forEach(({ label, href, icon }) =>
      list.push({
        id: `page-${href}`,
        label,
        section: "Go to",
        icon,
        run: () => go(href),
      })
    );

    CATEGORIES.forEach((cat) =>
      list.push({
        id: `cat-${cat}`,
        label: cat,
        section: "Categories",
        icon: TrendingUp,
        run: () => search(cat),
      })
    );

    (
      [
        { label: "Light theme", value: "light", icon: Sun },
        { label: "Dark theme", value: "dark", icon: Moon },
        { label: "Match system theme", value: "system", icon: Monitor },
      ] as const
    ).forEach(({ label, value, icon }) =>
      list.push({
        id: `theme-${value}`,
        label,
        section: "Theme",
        icon,
        run: () => {
          setTheme(value);
          setOpen(false);
        },
      })
    );

    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (c) => c.id === "search-query" || c.label.toLowerCase().includes(q)
    );
  }, [query, recent, go, search]);

  // A shrinking result list must never leave the cursor past the end, so
  // clamp on read rather than correcting the stored index afterwards.
  const activeIndex = Math.min(active, Math.max(0, commands.length - 1));

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % Math.max(1, commands.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + commands.length) % Math.max(1, commands.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      commands[activeIndex]?.run();
    }
  }

  useEffect(() => {
    listRef.current
      ?.querySelector('[data-active="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  let lastSection = "";

  return (
    <>
      <button
        onClick={() => onOpenChange(true)}
        aria-label="Open command palette"
        className="hidden items-center gap-2 rounded-xl bg-sunken px-2.5 py-2 text-xs font-medium text-ink-subtle ring-1 ring-line transition-colors hover:text-ink lg:flex"
      >
        <Search className="h-3.5 w-3.5" />
        <kbd className="font-sans text-[10px] font-semibold">Ctrl K</kbd>
      </button>

      <Dialog.Root open={open} onOpenChange={onOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay className="animate-fade-in fixed inset-0 z-[110] bg-overlay backdrop-blur-sm" />
          <Dialog.Content
            onKeyDown={onKeyDown}
            className="glass-float animate-scale-in fixed left-1/2 top-[12vh] z-[120] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 overflow-hidden rounded-3xl shadow-[var(--shadow-4)]"
          >
            <Dialog.Title className="sr-only">Command palette</Dialog.Title>
            <Dialog.Description className="sr-only">
              Search products, jump to a page, or change the theme.
            </Dialog.Description>

            <div className="flex items-center gap-3 border-b border-line px-4 py-3.5">
              <Search className="h-4 w-4 shrink-0 text-ink-subtle" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products, pages and settings"
                className="w-full bg-transparent text-sm text-ink placeholder:text-ink-subtle focus:outline-none"
              />
              <kbd className="hidden shrink-0 rounded-md bg-sunken px-1.5 py-0.5 text-[10px] font-semibold text-ink-subtle sm:block">
                Esc
              </kbd>
            </div>

            <div
              ref={listRef}
              className="scroll-slim max-h-[52vh] overflow-y-auto p-2"
            >
              {commands.length === 0 && (
                <p className="px-3 py-8 text-center text-sm text-ink-subtle">
                  Nothing matches that.
                </p>
              )}

              {commands.map((cmd, i) => {
                const showSection = cmd.section !== lastSection;
                lastSection = cmd.section;
                const Icon = cmd.icon;
                return (
                  <div key={cmd.id}>
                    {showSection && (
                      <p className="px-3 pb-1 pt-3 text-[10px] font-bold uppercase tracking-wider text-ink-subtle">
                        {cmd.section}
                      </p>
                    )}
                    <button
                      data-active={i === activeIndex}
                      onMouseEnter={() => setActive(i)}
                      onClick={cmd.run}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                        i === activeIndex
                          ? "bg-accent-soft font-semibold text-brand-600"
                          : "text-ink-muted"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1 truncate">{cmd.label}</span>
                      {i === activeIndex && (
                        <CornerDownLeft className="h-3.5 w-3.5 shrink-0 opacity-60" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
