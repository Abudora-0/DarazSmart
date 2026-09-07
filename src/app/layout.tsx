import type { Metadata } from "next";
import { Geist, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ScrollToTop } from "@/components/scroll-to-top";
import { Toaster } from "@/components/toaster";
import { SessionProvider } from "@/components/session-provider";
import { StoreHydration } from "@/components/store-hydration";
import { CartSync } from "@/components/cart-sync";
import { WishlistSync } from "@/components/wishlist-sync";
import { CompareSync } from "@/components/compare-sync";
import { CompareTray } from "@/components/compare-tray";
import { themeBootstrapScript } from "@/lib/theme";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "DarazSmart | Shop Daraz.pk Smarter",
  description:
    "Find the best prices, ratings, and reviews on Daraz products. Save to your cart, track price drops, and shop smarter.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geist.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <head>
        {/* Stamps data-theme before first paint so a dark-mode reload never
            flashes the light palette. */}
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
      </head>
      <body className="app-backdrop min-h-screen">
        <SessionProvider>
          <StoreHydration />
          <CartSync />
          <WishlistSync />
          <CompareSync />

          <a
            href="#main"
            className="skip-link rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-3)]"
          >
            Skip to content
          </a>

          <div className="mx-auto flex min-h-screen w-full max-w-[1360px] flex-col gap-5 p-0 sm:p-5">
            {/* overflow-clip (not hidden) keeps the rounded corners without
                breaking position:sticky for descendants like the filter
                sidebar */}
            <div className="flex flex-1 flex-col overflow-clip bg-canvas shadow-[var(--shadow-4)] sm:rounded-[28px]">
              <Navbar />
              <main id="main" className="flex-1">
                {children}
              </main>
            </div>
            {/* Footer is a distinct floating panel, not part of the content card */}
            <Footer />
          </div>

          <CompareTray />
          <ScrollToTop />
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
