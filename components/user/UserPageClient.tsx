'use client'

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { apiGet, apiPut } from "@/lib/json-server"
import { Button } from "@/components/ui/button"
import { OrdersPanel } from "@/components/user/OrdersPanel"
import { ProfileEditorPanel } from "@/components/user/ProfileEditorPanel"
import type { Order } from "@/types/order"
import type { User } from "@/types/user"

type TabKey = "profile" | "orders"

type UserPageClientProps = {
  locale: "vi" | "en"
  userId: string
  initialProfile: User
  initialOrders: Order[]
}

export default function UserPageClient({ locale, userId, initialProfile, initialOrders }: UserPageClientProps) {
  const t = useTranslations("ProfilePage")

  const [activeTab, setActiveTab] = useState<TabKey>("profile")
  const [isEditing, setIsEditing] = useState(false)

  const [fullName, setFullName] = useState(initialProfile.fullName)
  const [phone, setPhone] = useState(initialProfile.phone)
  const [address, setAddress] = useState(initialProfile.address)
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [ordersError, setOrdersError] = useState("")
  const [isSavingProfile, setIsSavingProfile] = useState(false)

  const email = initialProfile.email

  const fetchProfile = async () => {
    try {
      const profile = await apiGet<User>("/api/users/me")
      setFullName(profile.fullName)
      setPhone(profile.phone)
      setAddress(profile.address)
    } catch {
      toast.error(t("profileSection.loadFailed"))
    }
  }

  const fetchOrders = async () => {
    setOrdersError("")

    try {
      const data = await apiGet<Order[]>("/api/orders")
      setOrders(data)
    } catch {
      setOrders([])
      setOrdersError(t("ordersSection.fetchFailed"))
    }
  }

  useEffect(() => {
    if (!userId) {
      return
    }

    void fetchProfile()
    void fetchOrders()
  }, [userId])

  const tabs: Array<{ key: TabKey; label: string }> = [
    { key: "profile", label: t("tabs.profile") },
    { key: "orders", label: t("tabs.orders") },
  ]

  const handleSaveProfile = async () => {
    setIsSavingProfile(true)

    try {
      const profile = await apiPut<User>("/api/users/me", {
        fullName,
        phone,
        address,
      })

      setFullName(profile.fullName)
      setPhone(profile.phone)
      setAddress(profile.address)
      setIsEditing(false)
      toast.success(t("profileSection.saved"))
    } catch {
      toast.error(t("profileSection.saveFailed"))
    } finally {
      setIsSavingProfile(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-10 md:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">{t("title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-2 md:grid-cols-2">
        {tabs.map((tab) => (
          <Button
            key={tab.key}
            type="button"
            variant={activeTab === tab.key ? "default" : "outline"}
            className="h-auto min-h-10 rounded-none px-3 py-2 text-left text-sm whitespace-normal"
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {activeTab === "profile" && (
        <ProfileEditorPanel
          title={t("profileSection.heading")}
          description={t("profileSection.description")}
          nameLabel={t("profileSection.name")}
          emailLabel={t("profileSection.email")}
          phoneLabel={t("profileSection.phone")}
          addressLabel={t("profileSection.address")}
          notProvidedPlaceholder={t("profileSection.notProvided")}
          editLabel={t("profileSection.edit")}
          saveLabel={t("profileSection.save")}
          cancelLabel={t("profileSection.cancel")}
          signOutLabel={t("profileSection.signOut")}
          fullName={fullName}
          email={email}
          phone={phone}
          address={address}
          isEditing={isEditing}
          onFullNameChange={setFullName}
          onPhoneChange={setPhone}
          onAddressChange={setAddress}
          onEdit={() => setIsEditing(true)}
          onSave={() => {
            if (!isSavingProfile) {
              void handleSaveProfile()
            }
          }}
          onCancel={() => {
            setIsEditing(false)
            void fetchProfile()
          }}
        />
      )}

      {activeTab === "orders" && (
        <OrdersPanel
          orders={orders}
          locale={locale}
          title={t("ordersSection.heading")}
          description={t("ordersSection.description")}
          empty={t("ordersSection.empty")}
          retry={t("ordersSection.retry")}
          idLabel={t("ordersSection.id")}
          statusLabel={t("ordersSection.status")}
          dateLabel={t("ordersSection.date")}
          totalLabel={t("ordersSection.total")}
          shippingInfoLabel={t("ordersSection.shippingInfo")}
          addressLabel={t("ordersSection.address")}
          phoneLabel={t("ordersSection.phone")}
          noteLabel={t("ordersSection.note")}
          voucherLabel={t("ordersSection.voucher")}
          itemsLabel={t("ordersSection.items")}
          variantLabel={t("ordersSection.variant")}
          colorLabel={t("ordersSection.color")}
          sizeLabel={t("ordersSection.size")}
          quantityLabel={t("ordersSection.quantity")}
          unitPriceLabel={t("ordersSection.unitPrice")}
          lineTotalLabel={t("ordersSection.lineTotal")}
          reviewActionLabel={t("ordersSection.review.action")}
          reviewedLabel={t("ordersSection.review.reviewed")}
          reviewModalTitle={t("ordersSection.review.modalTitle")}
          ratingLabel={t("ordersSection.review.rating")}
          commentLabel={t("ordersSection.review.comment")}
          commentPlaceholder={t("ordersSection.review.commentPlaceholder")}
          reviewCancelLabel={t("ordersSection.review.cancel")}
          reviewSubmitLabel={t("ordersSection.review.submit")}
          reviewSubmittingLabel={t("ordersSection.review.submitting")}
          reviewSuccessMessage={t("ordersSection.review.success")}
          reviewAlreadyRatedMessage={t("ordersSection.review.alreadyRated")}
          reviewErrorMessage={t("ordersSection.review.error")}
          selectOrderHint={t("ordersSection.selectOrderHint")}
          error={ordersError}
          onRetry={() => {
            void fetchOrders()
          }}
        />
      )}
    </div>
  )
}
