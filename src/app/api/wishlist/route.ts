import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { parseIdList } from "@/lib/list-utils";
import { MAX_WISHLIST, readWishlist, replaceWishlist } from "@/lib/wishlist-service";

/** The signed-in wishlist. Anonymous visitors keep theirs in localStorage. */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await readWishlist(session.user.id);
  return Response.json({ items });
}

/** Replaces the whole wishlist. Idempotent, so a retried push is harmless. */
export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const ids = parseIdList((body as { items?: unknown })?.items, MAX_WISHLIST);
  const saved = await replaceWishlist(session.user.id, ids);
  return Response.json({ items: saved });
}
