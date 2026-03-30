import { Order } from "@/types/order";
import { useTranslations } from "next-intl";
import { EmptyState, ORDER_STATUS_META } from "../ui";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

export default function OrderList({ orders, locale }: { orders: Order[]; locale: string }) {
  const t = useTranslations("Admin.users_details");
  
  if (orders.length === 0) return <EmptyState message={t("noOrders")} />;
  return (
    <div className="space-y-3">
      {orders.map((order) => {
        const meta = ORDER_STATUS_META[order.status] ?? ORDER_STATUS_META.PENDING;
        return (
          <div key={order.id} className="rounded-lg border border-gray-100 p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-gray-800">#{order.id}</span>
                  <span className={cn("text-xs px-2 py-0.5 rounded-full font-semibold", meta.bg, meta.color)}>
                     {t(`orderStatus.${order.status}`)}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(order.createdAt).toLocaleString(locale)}
                </p>
              </div>
              <p className="text-sm font-extrabold text-gray-900 flex-shrink-0">
                {order.totalPrice.toLocaleString(locale)}đ
              </p>
            </div>
            <Separator className="my-3" />
            <div className="space-y-1">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-xs text-gray-500">
                  <span>{item.productName} × {item.quantity}</span>
                  <span className="font-medium text-gray-700">{(item.price * item.quantity).toLocaleString(locale)}đ</span>
                </div>
              ))}
            </div>
            {order.voucherCode && (
              <p className="text-xs text-green-600 font-medium mt-2"> {t("voucher")}: {order.voucherCode}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
