import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const BASE_URL = process.env.JSON_SERVER_URL;

if (!BASE_URL) {
  throw new Error("JSON_SERVER_URL environment variable is not configured");
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  const isOwner = session.user.id === id;

  if (!isOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const res = await fetch(`${BASE_URL}/users/${id}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = await res.json();

    const { password, ...safeUser } = user;

    return NextResponse.json(safeUser);
  } catch (error) {
    console.error("Fetch user error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
