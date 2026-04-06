import { getServerSession } from "next-auth";
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import SuggestionsCard from "@/components/admin/SuggestionsCard";
import { Separator } from "@/components/ui/separator";
import { ROLES } from "@/constants/role";
import { ROUTES } from "@/constants/router";
import { authOptions } from "@/lib/auth";
import { apiGet } from "@/lib/json-server";
import { Product } from "@/types/product";
import { Order } from "@/types/order";
import { User } from "@/types/user";
import { ProductSuggestion } from "@/types/product";

type AdminPageProps = {
  params: Promise<{ locale: "vi" | "en" }>;
};

export default async function AdminPage({ params }: AdminPageProps) {
  const { locale } = await params;
  const t = await getTranslations("Admin");
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect(`/${locale}${ROUTES.LOGIN}`);
  }

  if (session.user.role !== ROLES.ADMIN) {
    notFound();
  }

  const [products, orders, users, suggestions] = await Promise.all([
    apiGet<Product[]>("/products"),
    apiGet<Order[]>("/orders"),
    apiGet<User[]>("/users"),
    apiGet<ProductSuggestion[]>("/productSuggestions"),
  ]);

  const totalProducts = products.length;
  const lowStockProducts = products.filter(
    (product) => product.stock <= 5,
  ).length;
  const totalStock = products.reduce((sum, product) => sum + product.stock, 0);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(
    (order) => order.status === "PENDING",
  ).length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const customerUsers = users.filter((user) => user.role === ROLES.USER);
  const totalCustomers = customerUsers.length;
  const activeCustomers = customerUsers.filter((user) => user.isActive).length;
  const totalSuggestions = suggestions.length;

  const currency = new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  });

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-10 md:px-6">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">{t("title")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>{t("stats.totalProducts")}</CardDescription>
            <CardTitle>{totalProducts}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {t("stats.totalStock", { count: totalStock })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>{t("stats.orders")}</CardDescription>
            <CardTitle>{totalOrders}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {t("stats.pendingOrders", { count: pendingOrders })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>{t("stats.revenue")}</CardDescription>
            <CardTitle>{currency.format(totalRevenue)}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {t("stats.avgOrderValue", {
              value: currency.format(avgOrderValue),
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>{t("stats.customers")}</CardDescription>
            <CardTitle>{totalCustomers}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {t("stats.customersMeta", {
              active: activeCustomers,
              suggestions: totalSuggestions,
            })}
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t("highlights.title")}</CardTitle>
            <CardDescription>{t("highlights.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span>{t("highlights.lowStock")}</span>
              <span className="font-medium">{lowStockProducts}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span>{t("highlights.totalSuggestions")}</span>
              <span className="font-medium">{totalSuggestions}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span>{t("highlights.pendingRate")}</span>
              <span className="font-medium">
                {totalOrders > 0
                  ? Math.round((pendingOrders / totalOrders) * 100)
                  : 0}
                %
              </span>
            </div>
          </CardContent>
        </Card>

        <SuggestionsCard suggestions={suggestions} />
      </div>
    </div>
  );
}
