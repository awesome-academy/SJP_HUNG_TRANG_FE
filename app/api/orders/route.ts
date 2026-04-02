import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { apiGet } from "@/lib/json-server"
import type { Order, OrderStatus, RawOrder } from "@/types/order"

const ORDER_STATUSES: ReadonlySet<OrderStatus> = new Set([
  "PENDING",
  "CONFIRMED",
  "SHIPPING",
  "DELIVERED",
  "CANCELLED",
])

function normalizeOrderStatus(status?: string): OrderStatus {
  if (!status) {
    return "PENDING"
  }

  const normalized = status.toUpperCase() as OrderStatus
  return ORDER_STATUSES.has(normalized) ? normalized : "PENDING"
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const orders = await apiGet<RawOrder[]>("/orders", { userId: session.user.id })
    const normalizedOrders: Order[] = orders.map((order) => ({
      id: String(order.id),
      userId: String(order.userId),
      status: normalizeOrderStatus(order.status),
      totalPrice: order.totalPrice ?? 0,
      fullName: order.fullName ?? "",
      phone: order.phone ?? "",
      address: order.address ?? "",
      note: order.note ?? "",
      voucherCode: order.voucherCode ?? "",
      createdAt: order.createdAt ?? new Date().toISOString(),
      items: (order.items ?? []).map((item) => ({
        productId: String(item.productId),
        productName: item.productName ?? "Unknown product",
        price: item.price ?? 0,
        quantity: item.quantity ?? 0,
        variant: item.variant
          ? {
              id: item.variant.id !== undefined ? String(item.variant.id) : undefined,
              color: item.variant.color,
              size: item.variant.size,
            }
          : undefined,
      })),
    }))

    return NextResponse.json(normalizedOrders, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
