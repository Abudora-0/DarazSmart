import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { parseIdList } from "@/lib/list-utils";
import { MAX_COMPARE, readCompare, replaceCompare } from "@/lib/compare-service";

/** The signed-in compare tray. Anonymous visitors keep theirs in localStorage. */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await readCompare(session.user.id);
  return Response.json({ items });
}

/** Replaces the whole compare tray, capped at four. */
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

  const ids = parseIdList((body as { items?: unknown })?.items, MAX_COMPARE);
  const saved = await replaceCompare(session.user.id, ids);
  return Response.json({ items: saved });
}
