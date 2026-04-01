import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; 

const BASE = process.env.JSON_SERVER_URL;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }
    const { productId, content, createdAt } = body as {
      productId?: unknown;
      content?: unknown;
      createdAt?: unknown;
    };
    if (typeof productId !== "string" || typeof content !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'productId' or 'content'" },
        { status: 400 }
      );
    }
    const sanitizedPayload = {
      productId,
      content,
      createdAt:
        typeof createdAt === "string" && createdAt.trim() !== ""
          ? createdAt
          : new Date().toISOString(),
      userId: session.user.id,
    };
    const res = await fetch(`${BASE}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sanitizedPayload),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to create comment" },
        { status: 502 }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    );
  }
}
