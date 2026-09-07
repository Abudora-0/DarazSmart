import { type NextRequest } from "next/server";
import { searchAndUpsertPage } from "@/lib/search-service";

// Cold starts (fresh Neon connection + ~40 upserts) can exceed the default
// 10s serverless limit. Give this route real breathing room on Vercel.
export const maxDuration = 30;

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q) return Response.json({ error: "query required" }, { status: 400 });

  const page = Math.max(
    1,
    parseInt(request.nextUrl.searchParams.get("page") ?? "1") || 1
  );

  try {
    const { products, hasMore } = await searchAndUpsertPage(q, page);
    return Response.json({ results: products, hasMore });
  } catch (err) {
    console.error("Search error:", err);
    return Response.json({ error: "Failed to search" }, { status: 500 });
  }
}
