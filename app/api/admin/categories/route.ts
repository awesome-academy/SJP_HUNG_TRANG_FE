import { NextRequest, NextResponse } from "next/server";
import type { Category } from "@/types/category";
import { buildTree } from "@/lib/categoryTree";

const BASE = process.env.JSON_SERVER_URL;

export async function GET() {
    console.log("BASE =", process.env.JSON_SERVER_URL);
  try {
    const res = await fetch(`${BASE}/categories`);
    if (!res.ok) return NextResponse.json({ error: "Upstream error" }, { status: 502 });
    const categories: Category[] = await res.json();
    return NextResponse.json(buildTree(categories));
  } catch (err) {
    console.error("[GET /api/categories]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json() as Omit<Category, "id">;
    const res = await fetch(`${BASE}/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) return NextResponse.json({ error: "Upstream error" }, { status: 502 });
    return NextResponse.json(await res.json());
  } catch (err) {
    console.error("[POST /api/categories]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
