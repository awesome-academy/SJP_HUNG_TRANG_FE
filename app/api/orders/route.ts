import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { apiGet } from "@/lib/json-server"
import { mapRawOrdersToOrders } from "@/lib/order-normalizer"
import type { RawOrder } from "@/types/order"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const orders = await apiGet<RawOrder[]>("/orders", { userId: session.user.id })
    const normalizedOrders = mapRawOrdersToOrders(orders)

    return NextResponse.json(normalizedOrders, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

const BASE_URL = process.env.JSON_SERVER_URL;

if (!BASE_URL) {
  throw new Error("JSON_SERVER_URL environment variable is not configured");
}

export async function POST(req: Request) {
  try {
    const orderData = await req.json();

    if (!orderData.items || orderData.items.length === 0) {
      return NextResponse.json(
        { message: "Order must contain at least one item" },
        { status: 400 },
      );
    }

    const shipping = orderData.shipping ?? orderData.shippingAddress ?? {};

    const normalizedItems = Array.isArray(orderData.items)
      ? orderData.items.map((item: any) => ({
          ...item,
          productName: typeof item.productName === "string" ? item.productName.trim() : "",
        }))
      : [];

    if (normalizedItems.some((item: { productName: string }) => !item.productName)) {
      return NextResponse.json(
        { message: "Each order item must include a non-empty productName" },
        { status: 400 },
      );
    }

    const normalizedOrder = {
      // Preserve any existing fields on the incoming payload
      ...orderData,
      // Ensure root-level fields expected by the schema exist
      fullName:
        orderData.fullName ??
        orderData.name ??
        orderData.customerName ??
        shipping.fullName ??
        "",
      phone: orderData.phone ?? orderData.contactPhone ?? shipping.phone ?? "",
      address: orderData.address ?? shipping.address ?? orderData.shippingAddress ?? "",
      note: orderData.note ?? orderData.notes ?? shipping.note ?? "",
      // Normalize items to ensure each has productName
      items: normalizedItems,
      // Ensure createdAt exists
      createdAt: orderData.createdAt ?? new Date().toISOString(),
    };
    const response = await fetch(`${BASE_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(normalizedOrder),
    });

    if (!response.ok) {
      throw new Error("Failed to save order to JSON Server");
    }

    const savedOrder = await response.json();

    return NextResponse.json(
      { message: "Order placed successfully", orderId: savedOrder.id },
      { status: 201 },
    );
  } catch (error) {
    console.error("Order API Error:", error);
    return NextResponse.json(
      { message: "Failed to place order" },
      { status: 500 },
    );
  }
}
