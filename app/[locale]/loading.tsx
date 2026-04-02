"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

export default function Loading() {
  const t = useTranslations("Header");

  return (
    <div className="w-full min-h-[60vh] bg-white flex items-center justify-center">
      <div
        className="flex flex-col items-center gap-5"
        role="status"
        aria-live="polite"
      >
        <Loader2
          className="w-5 h-5 text-gray-400 animate-spin"
          aria-hidden="true"
        />

        <p className="text-sm text-gray-600 tracking-wide">
          {t("loading.loading")}
        </p>

        <div className="w-10 h-[1px] bg-gray-200" />

        <p className="text-xs text-gray-400 tracking-wide">
          {t("loading.please_wait")}
        </p>
      </div>
    </div>
  );
}
