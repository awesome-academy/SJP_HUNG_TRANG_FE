import { NextRequest } from "next/server";

const BASE = process.env.JSON_SERVER_URL;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  const res = await fetch(`${BASE}/orders?userId=${userId}`);

  if (!res.ok) {
    return Response.json({ error: "Failed" }, { status: 500 });
  }

  const data = await res.json();
  return Response.json(data);
}
