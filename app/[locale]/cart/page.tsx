import { getTranslations } from "next-intl/server";
import CartPage from "@/components/cart/CartPage";

type CartPageProps = {
  params: Promise<{ locale: "vi" | "en" }>;
};

export default async function CartRoute({ params }: CartPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "CartPage" });

  return (
    <CartPage
      locale={locale}
      labels={{
        title: t("title"),
        selectAll: t("selectAll"),
        clearCart: t("clearCart"),
        empty: t("empty"),
        continueShopping: t("continueShopping"),
        item: {
          remove: t("item.remove"),
          color: t("item.color"),
          size: t("item.size"),
        },
        summary: {
          summary: t("summary.summary"),
          selected: t("summary.selected"),
          total: t("summary.total"),
          checkout: t("summary.checkout"),
          clearSelected: t("summary.clearSelected"),
          noItemSelected: t("summary.noItemSelected"),
        },
      }}
    />
  );
}
