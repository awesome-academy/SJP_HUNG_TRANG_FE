import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { apiGet, apiPost } from "@/lib/json-server"
import type { RawOrder, RawOrderItem } from "@/types/order"
import type { CreateReviewBody, Review, ReviewVariantInput } from "@/types/review"

function getVariantSignature(variant?: ReviewVariantInput): string {
  if (!variant) return "default"
  if (variant.id !== undefined) return `id:${String(variant.id)}`

  const color = variant.color?.trim() ?? ""
  const size = variant.size?.trim() ?? ""

  if (!color && !size) return "default"
  return `color:${color}|size:${size}`
}

function getOrderItemVariantSignature(item: RawOrderItem): string {
  if (!item.variant) return "default"
  if (item.variant.id) return `id:${item.variant.id}`

  const color = item.variant.color?.trim() ?? ""
  const size = item.variant.size?.trim() ?? ""

  if (!color && !size) return "default"
  return `color:${color}|size:${size}`
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const reviews = await apiGet<Review[]>("/reviews", { userId: session.user.id })
    return NextResponse.json(reviews, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = (await req.json()) as CreateReviewBody
    const orderId = typeof body.orderId === "string" ? body.orderId.trim() : undefined
    const productId = typeof body.productId === "string" ? body.productId.trim() : undefined
    const rawRating = body.rating
    const comment = typeof body.comment === "string" ? body.comment.trim() : undefined

    if (!orderId || !productId || !comment || !Number.isInteger(rawRating)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }

    const rating = Number(rawRating)
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }

    const order = await apiGet<RawOrder>(`/orders/${orderId}`)

    if (String(order.userId) !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if ((order.status ?? "").toUpperCase() !== "DELIVERED") {
      return NextResponse.json({ error: "Only delivered orders can be reviewed" }, { status: 400 })
    }

    const requestVariantSignature = getVariantSignature(body.variant)
    const matchedItem = (order.items ?? []).find((item) => {
      if (String(item.productId) !== productId) {
        return false
      }

      return getOrderItemVariantSignature(item) === requestVariantSignature
    })

    if (!matchedItem) {
      return NextResponse.json({ error: "Order item not found" }, { status: 400 })
    }

    const existingReviews = await apiGet<Review[]>("/reviews", {
      userId: session.user.id,
      orderId,
      productId,
      variantSignature: requestVariantSignature,
    })

    if (existingReviews.length > 0) {
      return NextResponse.json({ error: "This item has already been reviewed" }, { status: 409 })
    }

    const created = await apiPost<Review>("/reviews", {
      userId: session.user.id,
      orderId,
      productId,
      rating,
      comment,
      variantSignature: requestVariantSignature,
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
