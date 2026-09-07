import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { parseCartInput, readCart, replaceCart } from "@/lib/cart-service";

/**
 * The signed-in cart. Anonymous visitors keep their cart in localStorage
 * only, so there is nothing here for them to read or write.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await readCart(session.user.id);
  return Response.json({ items });
}

/** Replaces the whole cart. Idempotent, so a retried push is harmless. */
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

  const items = parseCartInput((body as { items?: unknown })?.items);
  const saved = await replaceCart(session.user.id, items);
  return Response.json({ items: saved });
}
