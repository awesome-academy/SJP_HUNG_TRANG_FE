import type { Order, RawOrder } from "@/types/order"
import type { OrderStatus } from "@/constants/order_status"

const ORDER_STATUSES: ReadonlySet<OrderStatus> = new Set([
  "PENDING",
  "CONFIRMED",
  "SHIPPING",
  "DELIVERED",
  "CANCELLED",
])

export function normalizeOrderStatus(status?: string): OrderStatus {
  if (!status) {
    return "PENDING"
  }

  const normalized = status.toUpperCase() as OrderStatus
  return ORDER_STATUSES.has(normalized) ? normalized : "PENDING"
}

export function mapRawOrderToOrder(order: RawOrder): Order {
  const shippingAddress = order.shippingAddress

  return {
    id: String(order.id),
    userId: String(order.userId),
    status: normalizeOrderStatus(order.status),
    totalPrice: order.totalPrice ?? 0,
    fullName: order.fullName ?? shippingAddress?.fullName ?? "",
    phone: order.phone ?? shippingAddress?.phone ?? "",
    address: order.address ?? shippingAddress?.address ?? "",
    note: order.note ?? shippingAddress?.note ?? "",
    voucherCode: order.voucherCode ?? "",
    createdAt: order.createdAt ?? new Date().toISOString(),
    items: (order.items ?? []).map((item) => ({
      productId: String(item.productId),
      productName: item.productName ?? "Unknown product",
      price: item.price ?? 0,
      quantity: item.quantity ?? 0,
      variant: item.variant || item.variantId !== undefined
        ? {
            id:
              item.variant?.id !== undefined
                ? String(item.variant.id)
                : item.variantId !== undefined
                  ? String(item.variantId)
                  : undefined,
            color: item.variant?.color,
            size: item.variant?.size,
          }
        : undefined,
    })),
  }
}

export function mapRawOrdersToOrders(orders: RawOrder[]): Order[] {
  return orders.map(mapRawOrderToOrder)
}
