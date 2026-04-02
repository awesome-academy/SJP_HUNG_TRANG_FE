import { useEffect, useMemo, useState } from "react"
import { Star } from "lucide-react"
import { toast } from "sonner"

import type { Order, OrderStatus } from "@/types/order"
import type { Review } from "@/types/review"
import { apiGet, apiPost } from "@/lib/json-server"
import { Button } from "@/components/ui/button"

type OrdersPanelProps = {
  orders: Order[]
  locale: string
  title: string
  description: string
  empty: string
  
  retry: string
  idLabel: string
  statusLabel: string
  dateLabel: string
  totalLabel: string
  shippingInfoLabel: string
  addressLabel: string
  phoneLabel: string
  noteLabel: string
  voucherLabel: string
  itemsLabel: string
  variantLabel: string
  colorLabel: string
  sizeLabel: string
  quantityLabel: string
  unitPriceLabel: string
  lineTotalLabel: string
  reviewActionLabel: string
  reviewedLabel: string
  reviewModalTitle: string
  ratingLabel: string
  commentLabel: string
  commentPlaceholder: string
  reviewCancelLabel: string
  reviewSubmitLabel: string
  reviewSubmittingLabel: string
  reviewSuccessMessage: string
  reviewAlreadyRatedMessage: string
  reviewErrorMessage: string
  selectOrderHint: string
  error?: string
  onRetry: () => void
}

const STATUS_CLASS_MAP: Record<OrderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-sky-100 text-sky-700",
  SHIPPING: "bg-violet-100 text-violet-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-rose-100 text-rose-700",
}

export function OrdersPanel({
  orders,
  locale,
  title,
  description,
  empty,
  retry,
  idLabel,
  statusLabel,
  dateLabel,
  totalLabel,
  shippingInfoLabel,
  addressLabel,
  phoneLabel,
  noteLabel,
  voucherLabel,
  itemsLabel,
  variantLabel,
  colorLabel,
  sizeLabel,
  quantityLabel,
  unitPriceLabel,
  lineTotalLabel,
  reviewActionLabel,
  reviewedLabel,
  reviewModalTitle,
  ratingLabel,
  commentLabel,
  commentPlaceholder,
  reviewCancelLabel,
  reviewSubmitLabel,
  reviewSubmittingLabel,
  reviewSuccessMessage,
  reviewAlreadyRatedMessage,
  reviewErrorMessage,
  selectOrderHint,
  error,
  onRetry,
}: OrdersPanelProps) {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [reviewedKeys, setReviewedKeys] = useState<Set<string>>(new Set())
  const [activeReview, setActiveReview] = useState<{
    orderId: string
    productId: string
    productName: string
    variant?: { id?: string; color?: string; size?: string }
  } | null>(null)
  const [ratingValue, setRatingValue] = useState(5)
  const [reviewComment, setReviewComment] = useState("")
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)

  const getVariantSignature = (variant?: { id?: string; color?: string; size?: string }) => {
    if (!variant) return "default"
    if (variant.id) return `id:${variant.id}`

    const color = variant.color?.trim() ?? ""
    const size = variant.size?.trim() ?? ""
    if (!color && !size) return "default"

    return `color:${color}|size:${size}`
  }

  const getReviewKey = (orderId: string, productId: string, variant?: { id?: string; color?: string; size?: string }) => {
    return `${orderId}::${productId}::${getVariantSignature(variant)}`
  }

  useEffect(() => {
    const fetchMyReviews = async () => {
      try {
        const reviews = await apiGet<Review[]>("/api/reviews")
        const nextKeys = new Set<string>()

        reviews.forEach((review) => {
          if (!review.orderId) {
            return
          }

          const key = `${review.orderId}::${review.productId}::${review.variantSignature ?? "default"}`
          nextKeys.add(key)
        })

        setReviewedKeys(nextKeys)
      } catch {
        setReviewedKeys(new Set())
      }
    }

    void fetchMyReviews()
  }, [])

  const handleOpenReview = (params: {
    orderId: string
    productId: string
    productName: string
    variant?: { id?: string; color?: string; size?: string }
  }) => {
    setActiveReview(params)
    setRatingValue(5)
    setReviewComment("")
  }

  const handleSubmitReview = async () => {
    if (!activeReview || !reviewComment.trim()) {
      return
    }

    setIsSubmittingReview(true)

    try {
      await apiPost("/api/reviews", {
        orderId: activeReview.orderId,
        productId: activeReview.productId,
        rating: ratingValue,
        comment: reviewComment.trim(),
        variant: activeReview.variant,
      })

      setReviewedKeys((prev) => {
        const next = new Set(prev)
        next.add(getReviewKey(activeReview.orderId, activeReview.productId, activeReview.variant))
        return next
      })

      setActiveReview(null)
      setReviewComment("")
      toast.success(reviewSuccessMessage)
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : ""
      if (message.includes("409")) {
        toast.error(reviewAlreadyRatedMessage)
      } else {
        toast.error(reviewErrorMessage)
      }
    } finally {
      setIsSubmittingReview(false)
    }
  }

  useEffect(() => {
    if (orders.length === 0) {
      setSelectedOrderId(null)
      return
    }

    if (!selectedOrderId || !orders.some((order) => order.id === selectedOrderId)) {
      setSelectedOrderId(orders[0].id)
    }
  }, [orders, selectedOrderId])

  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedOrderId) ?? null,
    [orders, selectedOrderId]
  )

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US", {
        style: "currency",
        currency: "VND",
      }),
    [locale]
  )

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    [locale]
  )

  if (error) {
    return (
      <section className="rounded-xl border border-rose-200 bg-rose-50 p-5 md:p-6">
        <h2 className="text-xl font-semibold text-zinc-900">{title}</h2>
        <p className="mt-1 text-sm text-zinc-600">{description}</p>
        <p className="mt-4 text-sm text-rose-700">{error}</p>
        <Button type="button" variant="outline" className="mt-4 rounded-none" onClick={onRetry}>
          {retry}
        </Button>
      </section>
    )
  }


  if (orders.length === 0) {
    return (
      <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm md:p-6">
        <h2 className="text-xl font-semibold text-zinc-900">{title}</h2>
        <p className="mt-1 text-sm text-zinc-600">{description}</p>
        <p className="mt-4 rounded-md border border-dashed border-zinc-300 bg-zinc-50 px-4 py-6 text-sm text-zinc-600">
          {empty}
        </p>
      </section>
    )
  }

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm md:p-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-zinc-900">{title}</h2>
        <p className="text-sm text-zinc-600">{description}</p>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="space-y-2">
          {orders.map((order) => {
            const statusClass = STATUS_CLASS_MAP[order.status]
            const isActive = order.id === selectedOrderId

            return (
              <button
                key={order.id}
                type="button"
                className={`w-full rounded-lg border p-3 text-left transition ${
                  isActive
                    ? "border-zinc-900 bg-zinc-100"
                    : "border-zinc-200 bg-white hover:border-zinc-400 hover:bg-zinc-50"
                }`}
                onClick={() => setSelectedOrderId(order.id)}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-zinc-900">#{order.id}</p>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusClass}`}>
                    {order.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-zinc-600">{dateFormatter.format(new Date(order.createdAt))}</p>
                <p className="mt-2 text-sm font-semibold text-zinc-900">
                  {currencyFormatter.format(order.totalPrice)}
                </p>
              </button>
            )
          })}
        </div>

        {selectedOrder ? (
          <div className="rounded-lg border border-zinc-200 bg-zinc-50/60 p-4 md:p-5">
            <div className="grid gap-2 border-b border-zinc-200 pb-4 text-sm text-zinc-700 sm:grid-cols-2">
              <p>
                <span className="font-medium text-zinc-900">{idLabel}:</span> #{selectedOrder.id}
              </p>
              <p>
                <span className="font-medium text-zinc-900">{statusLabel}:</span> {selectedOrder.status}
              </p>
              <p>
                <span className="font-medium text-zinc-900">{dateLabel}:</span>{" "}
                {dateFormatter.format(new Date(selectedOrder.createdAt))}
              </p>
              <p>
                <span className="font-medium text-zinc-900">{totalLabel}:</span>{" "}
                {currencyFormatter.format(selectedOrder.totalPrice)}
              </p>
            </div>

            <div className="mt-4 rounded-md border border-zinc-200 bg-white p-3">
              <h3 className="text-sm font-semibold text-zinc-900">{shippingInfoLabel}</h3>
              <div className="mt-2 space-y-1 text-sm text-zinc-700">
                <p>
                  <span className="font-medium text-zinc-900">{addressLabel}:</span> {selectedOrder.address}
                </p>
                <p>
                  <span className="font-medium text-zinc-900">{phoneLabel}:</span> {selectedOrder.phone}
                </p>
                <p>
                  <span className="font-medium text-zinc-900">{noteLabel}:</span> {selectedOrder.note || "-"}
                </p>
                <p>
                  <span className="font-medium text-zinc-900">{voucherLabel}:</span> {selectedOrder.voucherCode || "-"}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-md border border-zinc-200 bg-white p-3">
              <h3 className="text-sm font-semibold text-zinc-900">{itemsLabel}</h3>
              <div className="mt-3 space-y-3">
                {selectedOrder.items.map((item) => (
                  <div
                    key={`${selectedOrder.id}-${item.productId}-${item.variant?.id ?? item.variant?.color ?? "default"}-${item.variant?.size ?? "default"}`}
                    className="rounded-md border border-zinc-200 px-3 py-2"
                  >
                    <p className="text-sm font-medium text-zinc-900">{item.productName}</p>
                    {item.variant && (item.variant.color || item.variant.size) && (
                      <p className="mt-1 text-xs text-zinc-600">
                        {variantLabel}: {item.variant.color ? `${colorLabel}: ${item.variant.color}` : ""}
                        {item.variant.color && item.variant.size ? " | " : ""}
                        {item.variant.size ? `${sizeLabel}: ${item.variant.size}` : ""}
                      </p>
                    )}
                    <div className="mt-1 grid gap-1 text-xs text-zinc-600 sm:grid-cols-3">
                      <p>
                        {quantityLabel}: {item.quantity}
                      </p>
                      <p>
                        {unitPriceLabel}: {currencyFormatter.format(item.price)}
                      </p>
                      <p>
                        {lineTotalLabel}: {currencyFormatter.format(item.price * item.quantity)}
                      </p>
                    </div>

                    {selectedOrder.status === "DELIVERED" && (
                      <div className="mt-3 flex justify-end">
                        {(() => {
                          const reviewKey = getReviewKey(selectedOrder.id, item.productId, item.variant)
                          const reviewed = reviewedKeys.has(reviewKey)

                          return (
                            <Button
                              type="button"
                              variant="outline"
                              className="rounded-none"
                              disabled={reviewed}
                              onClick={() =>
                                handleOpenReview({
                                  orderId: selectedOrder.id,
                                  productId: item.productId,
                                  productName: item.productName,
                                  variant: item.variant,
                                })
                              }
                            >
                              {reviewed ? reviewedLabel : reviewActionLabel}
                            </Button>
                          )
                        })()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-6 text-sm text-zinc-600">
            {selectOrderHint}
          </div>
        )}
      </div>

      {activeReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl border border-zinc-200 bg-white p-5 shadow-xl md:p-6">
            <h3 className="text-lg font-semibold text-zinc-900">{reviewModalTitle}</h3>
            <p className="mt-1 text-sm text-zinc-600">{activeReview.productName}</p>

            <div className="mt-4">
              <p className="text-sm font-medium text-zinc-900">{ratingLabel}</p>
              <div className="mt-2 flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, index) => {
                  const value = index + 1
                  const active = value <= ratingValue

                  return (
                    <button
                      key={value}
                      type="button"
                      className="rounded p-1 text-zinc-300 transition hover:scale-105"
                      onClick={() => setRatingValue(value)}
                    >
                      <Star
                        className={`h-6 w-6 ${active ? "fill-amber-400 text-amber-500" : "fill-zinc-200 text-zinc-300"}`}
                      />
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="mt-4">
              <label className="text-sm font-medium text-zinc-900">{commentLabel}</label>
              <textarea
                className="mt-2 min-h-[120px] w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
                placeholder={commentPlaceholder}
                value={reviewComment}
                onChange={(event) => setReviewComment(event.target.value)}
              />
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-none"
                onClick={() => setActiveReview(null)}
                disabled={isSubmittingReview}
              >
                {reviewCancelLabel}
              </Button>
              <Button
                type="button"
                className="rounded-none"
                onClick={() => {
                  void handleSubmitReview()
                }}
                disabled={isSubmittingReview || !reviewComment.trim()}
              >
                {isSubmittingReview ? reviewSubmittingLabel : reviewSubmitLabel}
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
