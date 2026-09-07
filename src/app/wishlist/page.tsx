import type { Metadata } from "next";
import { WishlistView } from "./wishlist-view";

export const metadata: Metadata = {
  title: "Your Wishlist | DarazSmart",
  description:
    "Products you have saved for later, with live prices from Daraz.pk.",
};

export default function WishlistPage() {
  return <WishlistView />;
}
