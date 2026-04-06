import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

import UserPageClient from "@/components/user/UserPageClient"
import { authOptions } from "@/lib/auth"
import { apiGet } from "@/lib/json-server"
import { mapRawOrdersToOrders } from "@/lib/order-normalizer"
import type { Order, RawOrder } from "@/types/order"
import type { User } from "@/types/user"

type UserPageProps = {
  params: Promise<{ locale: "vi" | "en" }>
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

  return mapRawOrdersToOrders(orders)
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
