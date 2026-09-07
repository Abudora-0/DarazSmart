import type { Metadata } from "next";
import { AlertsView } from "./alerts-view";

export const metadata: Metadata = {
  title: "Price Alerts | DarazSmart",
  description: "Get notified by email the moment a saved product hits your target price.",
};

export default function AlertsPage() {
  return <AlertsView />;
}
