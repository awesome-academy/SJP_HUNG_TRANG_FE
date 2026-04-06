import { useEffect, useMemo, useState } from "react"
import { Star } from "lucide-react"
import { toast } from "sonner"

import type { Order } from "@/types/order"
import type { OrderStatus } from "@/constants/order_status"
import type { Review } from "@/types/review"
import { Button } from "@/components/ui/button"

type OrdersPanelText = {
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
}

type OrdersPanelProps = {
  orders: Order[]
  locale: string
  text: OrdersPanelText
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
  text,
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
        const response = await fetch("/api/reviews", { cache: "no-store" })
        if (!response.ok) {
          throw new Error(`GET /api/reviews failed: ${response.status}`)
        }

        const reviews = (await response.json()) as Review[]
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

  useEffect(() => {
    if (!activeReview) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        if (!isSubmittingReview) {
          setActiveReview(null)
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [activeReview, isSubmittingReview])

  const handleSubmitReview = async () => {
    if (!activeReview || !reviewComment.trim()) {
      return
    }

    setIsSubmittingReview(true)

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: activeReview.orderId,
          productId: activeReview.productId,
          rating: ratingValue,
          comment: reviewComment.trim(),
          variant: activeReview.variant,
        }),
      })

      if (!response.ok) {
        throw new Error(`POST /api/reviews failed: ${response.status}`)
      }

      setReviewedKeys((prev) => {
        const next = new Set(prev)
        next.add(getReviewKey(activeReview.orderId, activeReview.productId, activeReview.variant))
        return next
      })

      setActiveReview(null)
      setReviewComment("")
      toast.success(text.reviewSuccessMessage)
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : ""
      if (message.includes("409")) {
        toast.error(text.reviewAlreadyRatedMessage)
      } else {
        toast.error(text.reviewErrorMessage)
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
        <h2 className="text-xl font-semibold text-zinc-900">{text.title}</h2>
        <p className="mt-1 text-sm text-zinc-600">{text.description}</p>
        <p className="mt-4 text-sm text-rose-700">{error}</p>
        <Button type="button" variant="outline" className="mt-4 rounded-none" onClick={onRetry}>
          {text.retry}
        </Button>
      </section>
    )
  }


  if (orders.length === 0) {
    return (
      <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm md:p-6">
        <h2 className="text-xl font-semibold text-zinc-900">{text.title}</h2>
        <p className="mt-1 text-sm text-zinc-600">{text.description}</p>
        <p className="mt-4 rounded-md border border-dashed border-zinc-300 bg-zinc-50 px-4 py-6 text-sm text-zinc-600">
          {text.empty}
        </p>
      </section>
    )
  }

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm md:p-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-zinc-900">{text.title}</h2>
        <p className="text-sm text-zinc-600">{text.description}</p>
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
                <span className="font-medium text-zinc-900">{text.idLabel}:</span> #{selectedOrder.id}
              </p>
              <p>
                <span className="font-medium text-zinc-900">{text.statusLabel}:</span> {selectedOrder.status}
              </p>
              <p>
                <span className="font-medium text-zinc-900">{text.dateLabel}:</span>{" "}
                {dateFormatter.format(new Date(selectedOrder.createdAt))}
              </p>
              <p>
                <span className="font-medium text-zinc-900">{text.totalLabel}:</span>{" "}
                {currencyFormatter.format(selectedOrder.totalPrice)}
              </p>
            </div>

            <div className="mt-4 rounded-md border border-zinc-200 bg-white p-3">
              <h3 className="text-sm font-semibold text-zinc-900">{text.shippingInfoLabel}</h3>
              <div className="mt-2 space-y-1 text-sm text-zinc-700">
                <p>
                  <span className="font-medium text-zinc-900">{text.addressLabel}:</span> {selectedOrder.address || "-"}
                </p>
                <p>
                  <span className="font-medium text-zinc-900">{text.phoneLabel}:</span> {selectedOrder.phone || "-"}
                </p>
                <p>
                  <span className="font-medium text-zinc-900">{text.noteLabel}:</span> {selectedOrder.note || "-"}
                </p>
                <p>
                  <span className="font-medium text-zinc-900">{text.voucherLabel}:</span> {selectedOrder.voucherCode || "-"}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-md border border-zinc-200 bg-white p-3">
              <h3 className="text-sm font-semibold text-zinc-900">{text.itemsLabel}</h3>
              <div className="mt-3 space-y-3">
                {selectedOrder.items.map((item, itemIndex) => (
                  <div
                    key={`${selectedOrder.id}-${item.productId}-${item.variant?.id ?? item.variant?.color ?? "default"}-${item.variant?.size ?? "default"}-${itemIndex}`}
                    className="rounded-md border border-zinc-200 px-3 py-2"
                  >
                    <p className="text-sm font-medium text-zinc-900">{item.productName || "Unknown product"}</p>
                    {item.variant && (item.variant.color || item.variant.size) && (
                      <p className="mt-1 text-xs text-zinc-600">
                        {text.variantLabel}: {item.variant.color ? `${text.colorLabel}: ${item.variant.color}` : ""}
                        {item.variant.color && item.variant.size ? " | " : ""}
                        {item.variant.size ? `${text.sizeLabel}: ${item.variant.size}` : ""}
                      </p>
                    )}
                    <div className="mt-1 grid gap-1 text-xs text-zinc-600 sm:grid-cols-3">
                      <p>
                        {text.quantityLabel}: {item.quantity}
                      </p>
                      <p>
                        {text.unitPriceLabel}: {currencyFormatter.format(item.price)}
                      </p>
                      <p>
                        {text.lineTotalLabel}: {currencyFormatter.format(item.price * item.quantity)}
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
                              className="rounded-none border-[#7faa3d] text-[#7faa3d] hover:border-[#6f9835] hover:bg-[#f5f9eb] hover:text-[#6f9835]"
                              disabled={reviewed}
                              onClick={() =>
                                handleOpenReview({
                                  orderId: selectedOrder.id,
                                  productId: item.productId,
                                  productName: item.productName || "Unknown product",
                                  variant: item.variant,
                                })
                              }
                            >
                              {reviewed ? text.reviewedLabel : text.reviewActionLabel}
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
            {text.selectOrderHint}
          </div>
        )}
      </div>

      {activeReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-title"
            className="w-full max-w-lg rounded-xl border border-zinc-200 bg-white p-5 shadow-xl md:p-6"
          >
            <h3 id="review-title" className="text-lg font-semibold text-zinc-900">
              {text.reviewModalTitle}
            </h3>
            <p className="mt-1 text-sm text-zinc-600">
              {activeReview.productName}
            </p>

            <div className="mt-4">
              <p className="text-sm font-medium text-zinc-900">{text.ratingLabel}</p>
              <div className="mt-2 flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, index) => {
                  const value = index + 1
                  const active = value <= ratingValue

                  return (
                    <button
                      key={value}
                      type="button"
                      className="rounded p-1 text-zinc-300 transition hover:scale-105"
                      aria-label={`${text.ratingLabel}: ${value}/5`}
                      aria-pressed={active}
                      onClick={() => setRatingValue(value)}
                    >
                      <Star
                        aria-hidden="true"
                        className={`h-6 w-6 ${active ? "fill-amber-400 text-amber-500" : "fill-zinc-200 text-zinc-300"}`}
                      />
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="mt-4">
              <label className="text-sm font-medium text-zinc-900">{text.commentLabel}</label>
              <textarea
                className="mt-2 min-h-[120px] w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
                placeholder={text.commentPlaceholder}
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
                {text.reviewCancelLabel}
              </Button>
              <Button
                type="button"
                className="rounded-none border border-[#7faa3d] bg-[#7faa3d] text-white hover:border-[#6f9835] hover:bg-[#6f9835]"
                onClick={() => {
                  void handleSubmitReview()
                }}
                disabled={isSubmittingReview || !reviewComment.trim()}
              >
                {isSubmittingReview ? text.reviewSubmittingLabel : text.reviewSubmitLabel}
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
