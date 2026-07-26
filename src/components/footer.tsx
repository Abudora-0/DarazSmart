import Link from "next/link";
import { ShoppingCart, Heart, Globe, Mail, Send, ArrowUpRight } from "lucide-react";

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
              className="text-sm text-gray-400 transition-colors hover:text-brand-300"
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
    <footer className="overflow-clip bg-[#1f150f]/90 text-gray-400 shadow-[0_30px_70px_-35px_rgba(45,18,6,0.7)] backdrop-blur-2xl sm:rounded-[28px]">
      <div className="h-1 bg-gradient-to-r from-brand-400 via-brand-500 to-brand-700" />

      <div className="px-6 py-12 sm:px-10">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.7fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-sm shadow-brand-500/40">
                <ShoppingCart className="h-[18px] w-[18px]" strokeWidth={2.5} />
              </span>
              <span className="font-brand text-xl font-bold">
                <span className="text-amber-300">Daraz</span>
                <span className="text-brand-400">Smart</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-gray-400">
              Shop Daraz.pk smarter — compare prices, track drops, and collect
              coupons, all in one place.
            </p>
            <div className="mt-5 flex gap-2">
              {[Globe, Mail, Send].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="social link"
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-gray-400 transition-colors hover:bg-brand-500 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <FooterCol
            title="Shop"
            links={[
              { label: "Trending Deals", href: "/search?q=deals" },
              { label: "Coupons", href: "/coupons" },
              { label: "Browse Home", href: "/" },
            ]}
          />
          <FooterCol
            title="Account"
            links={[
              { label: "My Cart", href: "/cart" },
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
            className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-300 transition-colors hover:bg-white/10"
          >
            Powered by live Daraz.pk data
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-xl text-xs leading-relaxed text-gray-500">
              © {year} DarazSmart. An independent price-comparison tool — not
              affiliated with, endorsed by, or sponsored by Daraz.pk. All
              products, prices, and trademarks belong to their respective
              owners; purchases are completed on Daraz.
            </p>
            <p className="flex shrink-0 items-center gap-1 text-xs text-gray-500">
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
