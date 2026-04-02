import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

import UserPageClient from "../../../components/user/UserPageClient"
import { authOptions } from "@/lib/auth"
import { apiGet } from "@/lib/json-server"
import type { Order, OrderStatus, RawOrder } from "@/types/order"
import type { User } from "@/types/user"

type UserPageProps = {
  params: Promise<{ locale: "vi" | "en" }>
}

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

function toUserProfile(user: User): User {
  return {
    id: String(user.id),
    email: user.email,
    fullName: user.fullName ?? "",
    phone: user.phone ?? "",
    address: user.address ?? "",
  }
}

async function getInitialOrders(userId: string): Promise<Order[]> {
  const orders = await apiGet<RawOrder[]>("/orders", { userId })

  return orders.map((order) => ({
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
}

export default async function UserPage({ params }: UserPageProps) {
  const { locale } = await params
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect(`/${locale}/login?callbackUrl=/${locale}/user`)
  }

  const initialProfileRaw = await apiGet<User>(`/users/${session.user.id}`)
  const initialProfile = toUserProfile(initialProfileRaw)
  const initialOrders = await getInitialOrders(session.user.id)

  return (
    <UserPageClient
      locale={locale}
      userId={session.user.id}
      initialProfile={initialProfile}
      initialOrders={initialOrders}
    />
  )
}
