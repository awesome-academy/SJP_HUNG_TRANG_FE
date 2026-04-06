"use client";

import { useState, useEffect, useMemo, use } from "react";
import { Lock, Truck, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Voucher } from "@/types/voucher";
import { SHIPPING_FEE } from "@/constants/shipping_fee";
import AddressSection from "@/components/checkout/AddressSection";
import VoucherSection from "@/components/checkout/VoucherSection";
import OrderSummary from "@/components/checkout/OrderSummary";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useCartStore, useSelectedTotal } from "@/store/cart";
import { useRouter } from "@/i18n/navigation";
import { useSession } from "next-auth/react";
import { ROUTES } from "@/constants/router";
import { formatPriceVnd } from "@/lib/mock-db";

type CheckoutPageProps = {
  params: Promise<{ locale: "vi" | "en" }>;
};

export default function CheckoutPage({ params }: CheckoutPageProps) {
  const t = useTranslations("Checkout");
  const { locale } = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  const items = useCartStore((state) => state.items);
  const { clearSelected } = useCartStore();

  const selectedItems = useMemo(() => {
    return items.filter((item) => item.selected);
  }, [items]);

  const subtotal = useSelectedTotal();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [shippingInfo, setShippingInfo] = useState({
    fullName: "",
    phone: "",
    address: "",
    note: "",
  });
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);

  const voucherDiscount = appliedVoucher
    ? Math.round((subtotal * appliedVoucher.discountPercent) / 100)
    : 0;
  const grandTotal = subtotal + SHIPPING_FEE - voucherDiscount;

  useEffect(() => {
    if (isMounted && items.length > 0 && selectedItems.length === 0) {
      toast.error(t("Please select at least one item to checkout"));
      router.replace(ROUTES.CART);
    }
  }, [isMounted, items.length, selectedItems.length, router]);

  if (!isMounted) return <div className="min-h-screen bg-gray-50" />;

  const handlePlaceOrder = async () => {
    if (selectedItems.length === 0) {
      toast.error(t("Your cart is empty or no items selected"));
      return;
    }

    if (
      !shippingInfo.address ||
      !shippingInfo.phone ||
      !shippingInfo.fullName
    ) {
      toast.error(t("Please fill in all shipping information"));
      return;
    }
    setIsSubmitting(true);

    try {
      const orderData = {
        userId: session?.user?.id || "GUEST",
        status: "PENDING",
        totalPrice: grandTotal,
        shipping: shippingInfo,
        voucherCode: appliedVoucher?.code || "",
        items: selectedItems.map((item) => ({
          productId: item.product.id,
          variantId: item.variant?.id,
          quantity: item.quantity,
          price: item.product.price,
        })),
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(t("Order placed successfully"));

        clearSelected();

        router.push(ROUTES.HOME);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(t("Failed to connect to server"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <AddressSection onAddressChange={setShippingInfo} />
            <VoucherSection
              orderTotal={subtotal}
              appliedCode={appliedVoucher?.code ?? null}
              onChange={setAppliedVoucher}
              locale={locale}
            />
          </div>

          <div className="space-y-4">
            <OrderSummary
              items={selectedItems}
              appliedVoucher={appliedVoucher}
              locale={locale}
            />

            <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-3">
              <Button
                onClick={handlePlaceOrder}
                disabled={selectedItems.length === 0 || isSubmitting}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-12 text-sm rounded uppercase tracking-wider shadow-sm transition-all shadow-green-200"
              >
                {isSubmitting
                  ? t("Processing")
                  : `${t("Place Order")} · ${formatPriceVnd(grandTotal, locale)}`}
              </Button>

              <p className="text-xs text-center text-gray-400 leading-relaxed">
                {t("By placing your order, you agree to our")}{" "}
                <span className="text-green-600 cursor-pointer hover:underline">
                  {t("Terms of Service")}
                </span>{" "}
                {t("and")}{" "}
                <span className="text-green-600 cursor-pointer hover:underline">
                  {t("Privacy Policy")}
                </span>
              </p>

              <Separator />

              <div className="flex items-center justify-center gap-2 pt-1">
                <span className="flex items-center justify-center gap-1 text-xs text-gray-400 text-center">
                  <Lock size={14} className="text-green-600" />

                  {t("Secure payment")}
                </span>

                <span className="flex items-center justify-center gap-1 text-xs text-gray-400 text-center">
                  <Truck size={14} className="text-green-600" />

                  {t("Free shipping nationwide")}
                </span>

                <span className="flex items-center justify-center gap-1 text-xs text-gray-400 text-center">
                  <Undo2 size={14} className="text-green-600" />

                  {t("Return within 30 days")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
