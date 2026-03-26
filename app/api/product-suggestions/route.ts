import { NextResponse } from "next/server";
import { apiPost } from "@/lib/json-server";
import type { ProductSuggestion } from "@/lib/mock-db";

export async function POST(request: Request) {
  const body = await request.json();
  const result = await apiPost<ProductSuggestion>("/productSuggestions", body);
  return NextResponse.json(result, { status: 201 });
}
