"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { User as  Mail, Phone, MapPin,
  ShoppingBag, Star,
  RefreshCw, Calendar, Hash,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { User } from "@/types/user";
import { Order } from "@/types/order";
import { Review } from "@/types/review";
import { Avatar, StatusBadge, RoleBadge, SectionCard } from "@/components/admin/users/ui";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import InfoRow from "@/components/admin/users/user-details/InfoRow";
import OrderList from "@/components/admin/users/user-details/OrderList";
import ReviewList from "@/components/admin/users/user-details/ReviewList";

export default function UserDetailPage() {
  const t = useTranslations("Admin.users_details");
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [uRes, oRes, rRes] = await Promise.all([
        fetch(`/api/admin/users/${id}`),
        fetch(`/api/admin/orders?userId=${id}`),
        fetch(`/api/admin/reviews?userId=${id}`),
      ]);

      if (!uRes.ok || !oRes.ok || !rRes.ok) {
        throw new Error("Fetch failed");
      }

      const [u, o, r] = await Promise.all([
        uRes.json(),
        oRes.json(),
        rRes.json(),
      ]);

      setUser(u);
      setOrders(o);
      setReviews(r);
      } catch {
        setError(t("userNotFound"));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <RefreshCw className="w-6 h-6 animate-spin text-green-500" />
          <span className="text-sm">{t("loading")}</span>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-sm text-red-500">{error ?? t("userNotFound")}</p>
          <button onClick={() => router.back()} className="text-sm text-green-600 hover:underline">
            {t("goBack")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Profile card */}
          <div className="space-y-4">
            {/* Hero card */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="flex flex-col items-center gap-3 text-center">
                <Avatar name={user.fullName} size="lg" />
                <div>
                  <h2 className="text-lg font-extrabold text-gray-900">{user.fullName}</h2>
                  <p className="text-sm text-gray-400 mt-0.5">{user.email}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-center">
                  <RoleBadge role={user.role} />
                  <StatusBadge isActive={user.isActive} />
                </div>
              </div>

              <Separator className="my-4" />

              <div>
                <InfoRow icon={<Mail className="w-4 h-4" />} label={t("email")} value={user.email} />
                <InfoRow icon={<Phone className="w-4 h-4" />} label={t("phone")} value={user.phone} />
                <InfoRow icon={<MapPin className="w-4 h-4" />} label={t("address")} value={user.address} />
                <InfoRow icon={<Hash className="w-4 h-4" />} label={t("userId")} value={user.id} />
                <InfoRow
                  icon={<Calendar className="w-4 h-4" />}
                  label={t("createdAt")}
                  value={user.createdAt ? new Date(user.createdAt).toLocaleString("vi-VN") : undefined}
                />
              </div>

              <Separator className="my-4" />

              {/* Quick stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xl font-extrabold text-gray-900">{orders.length}</p>
                  <p className="text-xs text-gray-400 font-medium mt-0.5 uppercase tracking-wider">{t("orders")}</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xl font-extrabold text-gray-900">{reviews.length}</p>
                  <p className="text-xs text-gray-400 font-medium mt-0.5 uppercase tracking-wider">{t("reviews")}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Orders + Reviews */}
          <div className="lg:col-span-2 space-y-4">
            <SectionCard
              title={`${t("orders")} (${orders.length})`}
              icon={<ShoppingBag className="w-4 h-4" />}
            >
              <OrderList orders={orders} />
            </SectionCard>

            <SectionCard
              title={`${t("reviews")} (${reviews.length})`}
              icon={<Star className="w-4 h-4" />}
            >
              <ReviewList reviews={reviews} />
            </SectionCard>
          </div>
        </div>

      </div>
    </div>
  );
}
