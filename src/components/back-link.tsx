"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

/**
 * Goes back to wherever the user actually came from. The old version was a
 * hardcoded link to /search with no query, which always landed on the empty
 * "search for anything" state.
 */
export function BackLink({
  fallback = "/",
  label = "Back",
}: {
  fallback?: string;
  label?: string;
}) {
  const router = useRouter();

  function goBack() {
    // A history length of 1 means this page was opened directly, so there is
    // nothing to go back to. Read it at click time, not at mount, so no
    // client-only value has to survive hydration.
    if (window.history.length > 1) router.back();
    else router.push(fallback);
  }

  return (
    <button
      onClick={goBack}
      className="group mb-4 inline-flex items-center gap-1 text-sm font-medium text-ink-muted transition-colors hover:text-brand-600"
    >
      <ChevronLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
      {label}
    </button>
  );
}
