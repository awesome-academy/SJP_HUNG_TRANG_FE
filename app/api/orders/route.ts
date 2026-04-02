import { NextResponse } from "next/server";

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

    const normalizedOrder = {
      // Preserve any existing fields on the incoming payload
      ...orderData,
      // Ensure root-level fields expected by the schema exist
      fullName:
        orderData.fullName ?? orderData.name ?? orderData.customerName ?? "",
      phone: orderData.phone ?? orderData.contactPhone ?? "",
      address: orderData.address ?? orderData.shippingAddress ?? "",
      note: orderData.note ?? orderData.notes ?? "",
      // Normalize items to ensure each has productName
      items: Array.isArray(orderData.items)
        ? orderData.items.map((item: any) => ({
            ...item,
            productName: item.productName ?? item.name ?? item.title ?? "",
          }))
        : [],
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
