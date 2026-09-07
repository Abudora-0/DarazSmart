"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/card";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Route error:", error);
  }, [error]);

  return (
    <div className="px-4 py-10 sm:px-6">
      <EmptyState
        icon={<AlertTriangle className="h-6 w-6" />}
        title="Something went wrong"
      >
        We could not load this page. Daraz may be slow to respond right now.
        {error.digest && (
          <p className="mt-2 font-mono text-xs text-ink-subtle">
            Reference: {error.digest}
          </p>
        )}
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Button size="sm" onClick={reset}>
            <RotateCw className="h-3.5 w-3.5" />
            Try again
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </EmptyState>
    </div>
  );
}
