import { NextRequest, NextResponse } from "next/server";
import type { Category } from "@/types/category";
import { ROLES } from "@/constants/role";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

const BASE = process.env.JSON_SERVER_URL;

if (!BASE) {
  throw new Error("JSON_SERVER_URL environment variable is not configured");
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== ROLES.ADMIN) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  try {
    const data = (await req.json()) as Partial<Omit<Category, "id">>;
    const res = await fetch(`${BASE}/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok)
      return NextResponse.json({ error: "Upstream error" }, { status: 502 });
    return NextResponse.json(await res.json());
  } catch (err) {
    console.error(`[PATCH /api/categories/${id}]`, err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== ROLES.ADMIN) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  try {
    const res = await fetch(`${BASE}/categories/${id}`, { method: "DELETE" });
    if (!res.ok)
      return NextResponse.json({ error: "Upstream error" }, { status: 502 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(`[DELETE /api/categories/${id}]`, err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
