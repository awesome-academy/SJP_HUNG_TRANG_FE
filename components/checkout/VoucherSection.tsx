"use client";

import { useState } from "react";
import {
  Tag,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Ticket,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Voucher } from "@/types/voucher";
import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { formatPriceVnd } from "@/lib/mock-db";

// Validation logic

type ValidationResult =
  | { ok: true; voucher: Voucher }
  | { ok: false; reason: string };

function validateVoucher(
  code: string,
  orderTotal: number,
  vouchers: Voucher[],
  t: ReturnType<typeof useTranslations>,
  locale: "vi" | "en",
): ValidationResult {
  const voucher = vouchers.find(
    (v) => v.code.toUpperCase() === code.trim().toUpperCase(),
  );

  if (!voucher) return { ok: false, reason: t("Voucher not found") };

  if (new Date(voucher.expiredAt) < new Date())
    return { ok: false, reason: t("Voucher expired") };

  if (orderTotal < voucher.minOrderValue)
    return {
      ok: false,
      reason: `${t("Order total needs")} ${formatPriceVnd(voucher.minOrderValue, locale)} ${t("to use this voucher")}`,
    };

  return { ok: true, voucher };
}

// VoucherCard

interface VoucherCardProps {
  voucher: Voucher;
  orderTotal: number;
  locale: "vi" | "en";
  isApplied: boolean;
  onApply: () => void;
  onRemove: () => void;
}

function VoucherCard({
  voucher,
  orderTotal,
  locale,
  isApplied,
  onApply,
  onRemove,
}: VoucherCardProps) {
  const t = useTranslations("Checkout.voucher");
  const isValid =
    orderTotal >= voucher.minOrderValue &&
    new Date(voucher.expiredAt) >= new Date();
  const isExpired = new Date(voucher.expiredAt) < new Date();

  return (
    <div
      className={cn(
        "rounded-lg border p-4 flex items-center gap-4 transition-all",
        isApplied
          ? "border-green-400 bg-green-50/40"
          : isValid
            ? "border-gray-200 bg-white hover:border-gray-300"
            : "border-gray-100 bg-gray-50 opacity-60",
      )}
    >
      {/* Discount badge - Fix theo database mới (chỉ có %) */}
      <div className="flex-shrink-0 rounded-lg border border-purple-200 bg-purple-50 px-3 py-2 text-center min-w-[72px]">
        <p className="text-lg font-extrabold leading-none text-purple-600">
          -{voucher.discountPercent}%
        </p>
        <p className="text-[10px] font-bold mt-1 text-purple-400 uppercase tracking-tighter">
          {t("Discount badge")}
        </p>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-bold text-gray-800 font-mono tracking-wider">
            {voucher.code}
          </span>
          {isApplied && <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />}
        </div>
        <p className="text-xs text-gray-500 mt-0.5">
          {t("Discount")} {voucher.discountPercent}% {t("on orders from")}{" "}
          {formatPriceVnd(voucher.minOrderValue, locale)}
        </p>
        <div className="flex items-center gap-1 mt-1">
          <Clock className="w-3 h-3 text-gray-400" />
          <span
            className={cn(
              "text-[11px]",
              isExpired ? "text-red-400" : "text-gray-400",
            )}
          >
            {isExpired
              ? t("Expired")
              : `${t("Expires on")} ${new Date(voucher.expiredAt).toLocaleDateString("vi-VN")}`}
          </span>
          {!isExpired && orderTotal < voucher.minOrderValue && (
            <span className="text-[11px] text-amber-500 ml-1">
              {t("Need more")}{" "}
              {(voucher.minOrderValue - orderTotal).toLocaleString("vi-VN")}đ
            </span>
          )}
        </div>
      </div>

      {/* CTA */}
      {isApplied ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="flex-shrink-0 text-xs text-red-400 hover:text-red-600 font-medium transition-colors"
        >
          {t("Remove")}
        </button>
      ) : (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onApply();
          }}
          disabled={!isValid}
          className={cn(
            "flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded border transition-all",
            isValid
              ? "border-green-500 text-green-600 hover:bg-green-50"
              : "border-gray-200 text-gray-300 cursor-not-allowed",
          )}
        >
          {t("Use")}
        </button>
      )}
    </div>
  );
}

// VoucherSection

interface VoucherSectionProps {
  orderTotal: number;
  appliedCode: string | null;
  onChange: (voucher: Voucher | null) => void;
  locale: "vi" | "en";
}

export default function VoucherSection({
  orderTotal,
  appliedCode,
  onChange,
  locale,
}: VoucherSectionProps) {
  const t = useTranslations("Checkout.voucher");
  const [inputCode, setInputCode] = useState("");
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [showList, setShowList] = useState(false);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVouchers = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/vouchers");
        if (!response.ok) throw new Error("Network response was not ok");

        const data = await response.json();
        setVouchers(data);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadVouchers();
  }, []);

  const handleCheck = () => {
    if (!inputCode.trim()) return;
    // Thay MOCK_VOUCHERS bằng vouchers
    const result = validateVoucher(inputCode, orderTotal, vouchers, t, locale);
    setValidation(result);
    if (result.ok) onChange(result.voucher);
    else onChange(null);
  };

  const handleApplyFromList = (v: Voucher) => {
    setInputCode(v.code);
    setValidation({ ok: true, voucher: v });
    onChange(v);
  };

  const handleRemove = () => {
    setInputCode("");
    setValidation(null);
    onChange(null);
  };

  const appliedVoucher = appliedCode
    ? vouchers.find((v) => v.code === appliedCode) ?? null
    : null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-green-600" />
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
            {t("Voucher")}
          </h2>
          {!loading && appliedVoucher && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-semibold">
              {appliedVoucher.code}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {loading && (
            <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          )}
          {collapsed ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </button>

      {!collapsed && (
        <div className="px-5 pb-5 space-y-4">
          <Separator className="mb-4" />

          {/* Manual input */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
              {t("Enter voucher code")}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={loading ? t("Loading") : t("Voucher code")}
                disabled={loading}
                value={inputCode}
                onChange={(e) => {
                  setInputCode(e.target.value.toUpperCase());
                  setValidation(null);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleCheck()}
                className="flex-1 px-3 py-2.5 rounded border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-400 font-mono tracking-wider focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors uppercase disabled:bg-gray-50"
              />
              <Button
                onClick={handleCheck}
                disabled={!inputCode.trim() || loading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-semibold h-10 px-5 rounded transition-colors"
              >
                {t("Check")}
              </Button>
            </div>

            {/* Validation feedback */}
            {validation && (
              <div
                className={cn(
                  "flex items-start gap-2 mt-2 px-3 py-2.5 rounded-lg border text-sm",
                  validation.ok
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-red-50 border-red-200 text-red-600",
                )}
              >
                {validation.ok ? (
                  <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  {validation.ok ? (
                    <>
                      <p className="font-semibold">
                        {t("Successfully applied!")}
                      </p>
                      <p className="text-xs mt-0.5 text-green-600">
                        {t("You saved")} {validation.voucher.discountPercent}%{" "}
                        {t("on this order")}
                      </p>
                    </>
                  ) : (
                    <p>{validation.reason}</p>
                  )}
                </div>
                {validation.ok && (
                  <button
                    onClick={handleRemove}
                    className="ml-auto text-green-500 hover:text-green-700 text-xs underline"
                  >
                    {t("Remove")}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Available vouchers list - Thay MOCK_VOUCHERS bằng vouchers */}
          <div>
            <button
              onClick={() => setShowList(!showList)}
              disabled={loading}
              className="flex items-center gap-1.5 text-xs font-semibold text-green-600 hover:text-green-700 transition-colors disabled:text-gray-300"
            >
              <Ticket className="w-3.5 h-3.5" />
              {showList ? t("Hide") : t("View")} {t("Available vouchers")} (
              {vouchers.length})
              {showList ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>

            {showList && (
              <div className="mt-3 space-y-2">
                {vouchers.length === 0 ? (
                  <p className="text-xs text-gray-400 italic py-2">
                    {t("No available vouchers")}
                  </p>
                ) : (
                  vouchers.map((v) => (
                    <VoucherCard
                      key={v.id}
                      voucher={v}
                      orderTotal={orderTotal}
                      isApplied={appliedCode === v.code}
                      onApply={() => handleApplyFromList(v)}
                      onRemove={handleRemove}
                      locale={locale}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
