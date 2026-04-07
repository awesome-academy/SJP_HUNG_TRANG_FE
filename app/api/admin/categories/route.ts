import { NextRequest, NextResponse } from "next/server";
import type { Category } from "@/types/category";
import { buildTree } from "@/lib/categoryTree";
import { ROLES } from "@/constants/role";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

const BASE = process.env.JSON_SERVER_URL;

if (!BASE) {
  throw new Error("JSON_SERVER_URL environment variable is not configured");
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== ROLES.ADMIN) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const res = await fetch(`${BASE}/categories`, { cache: "no-store" });
    if (!res.ok)
      return NextResponse.json({ error: "Upstream error" }, { status: 502 });
    const categories: Category[] = await res.json();
    return NextResponse.json(buildTree(categories));
  } catch (err) {
    console.error("[GET /api/categories]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== ROLES.ADMIN) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const data = (await req.json()) as Omit<Category, "id">;
    const res = await fetch(`${BASE}/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok)
      return NextResponse.json({ error: "Upstream error" }, { status: 502 });
    return NextResponse.json(await res.json());
  } catch (err) {
    console.error("[POST /api/categories]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
