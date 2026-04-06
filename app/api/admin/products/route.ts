import { ROLES } from "@/constants/role";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

const BASE = process.env.JSON_SERVER_URL;

if (!BASE) {
  throw new Error("JSON_SERVER_URL environment variable is not configured");
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== ROLES.ADMIN) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);

  const page = searchParams.get("page") || "1";
  const limit = searchParams.get("limit") || "10";

  const q = searchParams.get("q") || "";
  const name = searchParams.get("name") || "";
  const categoryId = searchParams.get("categoryId") || "";

  const sort = searchParams.get("sort") || "createdAt";
  const order = searchParams.get("order") || "desc";

  const query = new URLSearchParams({
    _page: page,
    _limit: limit,
    _sort: sort,
    _order: order,
  });

  if (q) query.append("q", q);

  if (name) query.append("name_like", name);
  if (categoryId) query.append("categoryId", categoryId);

  if (searchParams.get("price_gte")) {
    query.append("price_gte", searchParams.get("price_gte")!);
  }

  if (searchParams.get("price_lte")) {
    query.append("price_lte", searchParams.get("price_lte")!);
  }

  if (searchParams.get("isActive")) {
    query.append("isActive", searchParams.get("isActive")!);
  }

  try {
    const res = await fetch(`${BASE}/products?${query.toString()}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return Response.json(
        { message: "Failed to fetch products" },
        { status: 500 },
      );
    }

    const raw = await res.json();
    const total = res.headers.get("x-total-count");

    const data = raw.map((p: any) => {
      const hasVariants = Array.isArray(p.variants) && p.variants.length > 0;

      const stock = hasVariants
        ? p.variants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0)
        : p.stock ?? 0;

      const mainImage =
        p.images?.find((i: any) => i.isMain) || p.images?.[0] || null;

      return {
        ...p,
        stock,
        hasVariants,
        mainImage,
      };
    });

    return Response.json({
      data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: Number(total),
      },
    });
  } catch (error) {
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== ROLES.ADMIN) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();

  try {
    const res = await fetch(`${BASE}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        {
          error:
            typeof data?.error === "string"
              ? data.error
              : typeof data?.message === "string"
                ? data.message
                : "Failed to create product",
        },
        { status: res.status },
      );
    }
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Fail" }, { status: 500 });
  }
}
