import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { ROLES } from "@/constants/role";

const BASE = process.env.JSON_SERVER_URL;

if (!BASE) {
  throw new Error("JSON_SERVER_URL environment variable is not configured");
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== ROLES.ADMIN) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  
  const userId = searchParams.get("userId");
  const status = searchParams.get("status");
  const sortBy = searchParams.get("sort") || "createdAt";
  const order = searchParams.get("order") || "desc";
  const q = searchParams.get("q"); 
  
  const hasPage = searchParams.has("page");
  
  const DEFAULT_PAGE = 1;
  const DEFAULT_LIMIT = 10;

  let page = parseInt(searchParams.get("page") || "", 10);
  if (isNaN(page) || page < 1) page = DEFAULT_PAGE;

  let limit = parseInt(searchParams.get("limit") || "", 10);
  if (isNaN(limit) || limit < 1) limit = DEFAULT_LIMIT;

  const query = new URLSearchParams();
  
  if (hasPage || !userId) {
    query.append("_page", String(page));
    query.append("_limit", String(limit));
  }

  query.append("_sort", sortBy); 
  query.append("_order", order);

  if (userId) query.append("userId", userId);
  if (status && status !== "ALL") query.append("status", status);
  if (q) query.append("q", q);

  try {
    const res = await fetch(`${BASE}/orders?${query.toString()}`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch from database");

    const data = await res.json();
    const totalCount = parseInt(res.headers.get("X-Total-Count") || "0");

    if (userId && !hasPage) {
      return NextResponse.json(data);
    }

    return NextResponse.json({
      data,
      pagination: {
        total: totalCount,
        page,
        limit
      },
      filters: {
        userId: userId || null,
        status: status || "ALL",
        sort: sortBy,
        order: order,
        q: q || ""
      }
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
