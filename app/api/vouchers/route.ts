import { NextResponse } from "next/server";

const BASE = process.env.JSON_SERVER_URL;

if (!BASE) {
  throw new Error("JSON_SERVER_URL environment variable is not configured");
}

export async function GET() {
  try {
    const res = await fetch(`${BASE}/vouchers`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch vouchers" },
        { status: 500 },
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
