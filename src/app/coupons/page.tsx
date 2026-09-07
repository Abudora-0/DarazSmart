import type { Metadata } from "next";
import { CouponsView } from "./coupons-view";

export const metadata: Metadata = {
  title: "Coupon Collector | DarazSmart",
  description: "Browse active Daraz.pk voucher codes and copy them with one click.",
};

export default function CouponsPage() {
  return <CouponsView />;
}
