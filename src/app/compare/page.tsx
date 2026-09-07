import type { Metadata } from "next";
import { CompareView } from "./compare-view";

export const metadata: Metadata = {
  title: "Compare Products | DarazSmart",
  description:
    "Put up to four Daraz products side by side and compare price, discount, rating and seller.",
};

export default function ComparePage() {
  return <CompareView />;
}
