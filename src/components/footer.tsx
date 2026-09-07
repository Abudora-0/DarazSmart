import Link from "next/link";
import { ShoppingCart, Heart, ArrowUpRight, Code2 } from "lucide-react";

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-white">{title}</h4>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              href={l.href}
              className="text-sm text-white/55 transition-colors hover:text-brand-300"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="overflow-clip bg-[#1f150f]/90 text-white/60 shadow-[var(--shadow-3)] backdrop-blur-2xl sm:rounded-[28px]">
      <div className="h-1 bg-gradient-to-r from-brand-400 via-brand-500 to-brand-700" />

      <div className="px-6 py-12 sm:px-10">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.7fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <Link href="/" className="group flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-[var(--shadow-brand)] transition-transform duration-300 group-hover:scale-110">
                <ShoppingCart className="h-[18px] w-[18px]" strokeWidth={2.5} />
              </span>
              <span className="font-brand text-xl font-bold">
                <span className="text-amber-300">Daraz</span>
                <span className="text-brand-400">Smart</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/55">
              Shop Daraz.pk smarter. Compare prices, track drops, and collect
              coupons, all in one place.
            </p>
            <a
              href="https://github.com/Abudora-0/DarazSmart"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              <Code2 className="h-4 w-4" />
              View the source
            </a>
          </div>

          <FooterCol
            title="Shop"
            links={[
              { label: "Trending Deals", href: "/search?q=deals" },
              { label: "Coupons", href: "/coupons" },
              { label: "Compare", href: "/compare" },
            ]}
          />
          <FooterCol
            title="Account"
            links={[
              { label: "My Cart", href: "/cart" },
              { label: "Wishlist", href: "/wishlist" },
              { label: "Price Alerts", href: "/alerts" },
              { label: "Sign in", href: "/auth/signin" },
            ]}
          />
          <FooterCol
            title="Popular"
            links={[
              { label: "iPhone", href: "/search?q=iPhone" },
              { label: "Smart Watch", href: "/search?q=Smart%20Watch" },
              { label: "Sneakers", href: "/search?q=Sneakers" },
              { label: "Headphones", href: "/search?q=Headphones" },
            ]}
          />
        </div>

        {/* Disclaimer + bottom bar */}
        <div className="mt-10 border-t border-white/10 pt-6">
          <a
            href="https://www.daraz.pk"
            target="_blank"
            rel="noopener noreferrer"
            className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-xs font-medium text-white/70 transition-colors hover:bg-white/10"
          >
            Powered by live Daraz.pk data
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-xl text-xs leading-relaxed text-white/40">
              © {year} DarazSmart. An independent price-comparison tool, not
              affiliated with, endorsed by, or sponsored by Daraz.pk. All
              products, prices, and trademarks belong to their respective
              owners; purchases are completed on Daraz.
            </p>
            <p className="flex shrink-0 items-center gap-1 text-xs text-white/40">
              Made with{" "}
              <Heart className="h-3 w-3 fill-brand-400 text-brand-400" /> for
              smart shoppers
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
