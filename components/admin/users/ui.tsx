"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { ROLES } from "@/constants/role";
import { OrderStatus } from "@/constants/order_status";

export function StatusBadge({ isActive }: { isActive: boolean }) {
  const t = useTranslations("Admin.users");

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold",
        isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-500",
      )}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full",
          isActive ? "bg-green-500" : "bg-red-400",
        )}
      />
      {isActive ? t("filters.active") : t("filters.inactive")}
    </span>
  );
}

export function RoleBadge({ role }: { role: string }) {
  const t = useTranslations("Admin.users");

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold tracking-wider uppercase",
        role === ROLES.ADMIN
          ? "bg-amber-100 text-amber-700"
          : "bg-gray-100 text-gray-500",
      )}
    >
      {t(`roles.${role}`)}
    </span>
  );
}

export function Avatar({
  name,
  size = "md",
}: {
  name: string;
  size?: "sm" | "md" | "lg";
}) {
  const safeName = name?.trim() || "U";

  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0].toUpperCase())
    .join("");

  const colors = [
    "bg-rose-200 text-rose-700",
    "bg-sky-200 text-sky-700",
    "bg-violet-200 text-violet-700",
    "bg-emerald-200 text-emerald-700",
    "bg-amber-200 text-amber-700",
    "bg-pink-200 text-pink-700",
  ];

  const index = safeName.charCodeAt(0) % colors.length;
  const color = colors[index];

  const sizeClass = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-14 h-14 text-base",
  }[size];

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-bold flex-shrink-0",
        sizeClass,
        color,
      )}
    >
      {initials || "?"}
    </div>
  );
}

export function SectionCard({
  title,
  icon,
  children,
  action,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          {icon && <span className="text-green-600">{icon}</span>}
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
            {title}
          </h3>
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-8 text-center text-sm text-gray-400">{message}</div>
  );
}

export const ORDER_STATUS_META = {
  PENDING: { key: "pending", color: "text-amber-600", bg: "bg-amber-50" },
  CONFIRMED: { key: "confirmed", color: "text-blue-600", bg: "bg-blue-50" },
  SHIPPING: { key: "shipping", color: "text-purple-600", bg: "bg-purple-50" },
  DELIVERED: { key: "delivered", color: "text-green-600", bg: "bg-green-50" },
  CANCELLED: { key: "cancelled", color: "text-red-500", bg: "bg-red-50" },
} as const;
