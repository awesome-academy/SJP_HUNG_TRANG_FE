import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { OrderStatus } from "@/constants/order_status";
import { useTranslations } from "next-intl";

export const ORDER_STATUS_META = {
  ALL: {
    color: "text-gray-600",
    bg: "bg-gray-100",
    dot: "bg-gray-400",
  },
  PENDING: {
    color: "text-amber-600",
    bg: "bg-amber-50",
    dot: "bg-amber-500",
  },
  CONFIRMED: {
    color: "text-blue-600",
    bg: "bg-blue-50",
    dot: "bg-blue-500",
  },
  SHIPPING: {
    color: "text-purple-600",
    bg: "bg-purple-50",
    dot: "bg-purple-500",
  },
  DELIVERED: {
    color: "text-green-600",
    bg: "bg-green-50",
    dot: "bg-green-500",
  },
  CANCELLED: {
    color: "text-red-500",
    bg: "bg-red-50",
    dot: "bg-red-400",
  },
} as const;

export function SortableHeader({
  label,
  field,
  currentSort,
  currentOrder,
  onSort,
}: {
  label: string;
  field: string;
  currentSort: string;
  currentOrder: string;
  onSort: (field: string) => void;
}) {
  const isActive = currentSort === field;
  return (
    <th
      className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
      onClick={() => onSort(field)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSort(field);
        }
      }}
    >
      <div className="flex items-center gap-1">
        {label}
        {isActive ? (
          currentOrder === "asc" ? (
            <ChevronUp className="w-3 h-3 text-green-600" />
          ) : (
            <ChevronDown className="w-3 h-3 text-green-600" />
          )
        ) : (
          <ArrowUpDown className="w-3 h-3 text-gray-300" />
        )}
      </div>
    </th>
  );
}

export function StatusBadge({ status }: { status: OrderStatus }) {
  const t = useTranslations("Admin.orders");
  const m = ORDER_STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap",
        m.bg,
        m.color,
      )}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full flex-shrink-0 uppercase",
          m.dot,
        )}
      />
      {t(status)}
    </span>
  );
}

export function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 px-4 py-3 flex items-center gap-3">
      <p className={cn("text-2xl font-extrabold", color ?? "text-gray-900")}>
        {value}
      </p>
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider leading-tight">
        {label}
      </p>
    </div>
  );
}

export function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
        {icon && <span className="text-green-600">{icon}</span>}
        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
          {title}
        </h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <span className="text-green-500 mt-0.5 flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
          {label}
        </p>
        <p className="text-sm font-medium text-gray-800 mt-0.5 break-words">
          {value || "—"}
        </p>
      </div>
    </div>
  );
}
