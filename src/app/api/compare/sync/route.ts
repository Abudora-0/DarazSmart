import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { parseIdList } from "@/lib/list-utils";
import { MAX_COMPARE, mergeCompare } from "@/lib/compare-service";

/** Folds the device's local compare selection into the account on sign-in. */
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

  const ids = parseIdList((body as { items?: unknown })?.items, MAX_COMPARE);
  const merged = await mergeCompare(session.user.id, ids);
  return Response.json({ items: merged });
}
