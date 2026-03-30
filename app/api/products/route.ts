import { NextResponse } from "next/server";
import { apiGet, apiPost } from "@/lib/json-server";
import type { Product } from "@/lib/mock-db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const params: Record<string, string> = {};
  for (const key of ["categoryId", "_page", "_limit", "_sort", "_order"]) {
    const val = searchParams.get(key);
    if (val) params[key] = val;
  }
  const products = await apiGet<Product[]>("/products", params);
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const body = await request.json();
  const product = await apiPost<Product>("/products", body);
  return NextResponse.json(product, { status: 201 });
}
