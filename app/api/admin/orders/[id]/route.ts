import { ORDER_STATUS, OrderStatus } from "@/constants/order_status";
import { ROLES } from "@/constants/role";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

const BASE = process.env.JSON_SERVER_URL;

if (!BASE) {
  throw new Error("JSON_SERVER_URL environment variable is not configured");
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== ROLES.ADMIN) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const res = await fetch(`${BASE}/orders/${id}`, { cache: "no-store" });

    if (!res.ok) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const order = await res.json();
    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== ROLES.ADMIN) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 },
      );
    }

    const allowedStatuses = Object.values(ORDER_STATUS) as OrderStatus[];
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Allowed: ${allowedStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    const res = await fetch(`${BASE}/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const updatedOrder = await res.json();
    return NextResponse.json(updatedOrder);
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== ROLES.ADMIN) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;

    const res = await fetch(`${BASE}/orders/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: res.statusText || "Failed to delete order" },
        { status: res.status },
      );
    }

    return NextResponse.json({ message: "Order deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
