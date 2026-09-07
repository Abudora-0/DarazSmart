import Link from "next/link";
import { Compass, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="px-4 py-10 sm:px-6">
      <EmptyState icon={<Compass className="h-6 w-6" />} title="Page not found">
        That page does not exist, or it moved somewhere else.
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Button asChild size="sm">
            <Link href="/">Back to home</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/search?q=deals">
              <Search className="h-3.5 w-3.5" />
              Browse deals
            </Link>
          </Button>
        </div>
      </EmptyState>
    </div>
  );
}
