import type { Metadata } from "next";
import { Geist, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ScrollToTop } from "@/components/scroll-to-top";
import { Toaster } from "@/components/toaster";
import { SessionProvider } from "@/components/session-provider";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "DarazSmart — Shop Daraz.pk Smarter",
  description:
    "Find the best prices, ratings, and reviews on Daraz products. Save to your virtual cart and shop smarter.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="app-backdrop min-h-screen">
        <SessionProvider>
          <div className="mx-auto flex min-h-screen w-full max-w-[1360px] flex-col gap-5 p-0 sm:p-5">
            {/* overflow-clip (not hidden) keeps the rounded corners without
                breaking position:sticky for descendants like the filter sidebar */}
            <div className="flex flex-1 flex-col overflow-clip bg-canvas shadow-[0_40px_90px_-30px_rgba(120,45,10,0.45)] sm:rounded-[28px]">
              <Navbar />
              <main className="flex-1">{children}</main>
            </div>
            {/* Footer is a distinct floating panel, not part of the content card */}
            <Footer />
          </div>
          <ScrollToTop />
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
