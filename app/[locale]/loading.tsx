import { Loader2 } from "lucide-react";
import { getTranslations } from "next-intl/server";
export default async function Loading() {
  const t = await getTranslations("Header");
  return (
    <div className="w-full min-h-[60vh] bg-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-5">

        <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />

        <p className="text-sm text-gray-600 tracking-wide">
          {t("loading.loading")}
        </p>

        {/* Divider tinh tế */}
        <div className="w-10 h-[1px] bg-gray-200" />

        {/* Sub text */}
        <p className="text-xs text-gray-400 tracking-wide">
          {t("loading.please_wait")}
        </p>

      </div>
    </div>
  );
}
