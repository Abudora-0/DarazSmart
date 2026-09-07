import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { mergeCart, parseCartInput } from "@/lib/cart-service";

/**
 * Folds the device's local cart into the account on sign-in and returns the
 * combined cart, which the client then adopts.
 *
 * The previous version took bare product ids, wrote them, and told the caller
 * only how many rows it had created, which is why the client had nothing to
 * display and simply cleared itself.
 */
export async function POST(request: NextRequest) {
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
  const merged = await mergeCart(session.user.id, items);
  return Response.json({ items: merged });
}
