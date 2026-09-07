import type { Metadata } from "next";
import { CartView } from "./cart-view";

export const metadata: Metadata = {
  title: "Your Cart | DarazSmart",
  description: "Review the products you've saved and check out directly on Daraz.",
};

export default function CartPage() {
  return <CartView />;
}
