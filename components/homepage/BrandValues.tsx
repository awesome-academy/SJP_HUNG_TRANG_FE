"use client";

import { ReactNode } from "react";
import { Playfair, DM_Sans } from "next/font/google";
import { Sprout, Star, Truck, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";

const playfair = Playfair({ subsets: ["latin"], weight: ["600", "700"] });
const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "700"] });

interface Value {
  icon: ReactNode;
  key: string;
}

const VALUES: Value[] = [
  { icon: <Sprout />, key: "natural" },
  { icon: <Star />, key: "design" },
  { icon: <Truck />, key: "delivery" },
  { icon: <ShieldCheck />, key: "quality" }
];

export default function BrandValues() {
  const t = useTranslations("HomePage.brandValues");

  return (
    <section className="w-full py-20 relative overflow-hidden bg-gradient-to-b from-[#6dbf82] to-[#2d7a3a]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-16">
        <div className="text-center mb-14">
          <p className={`${dmSans.className} text-xs text-white tracking-[0.3em] font-semibold uppercase mb-3`}>
            {t("subtitle")}
          </p>
          <h2 className={`${playfair.className} text-white text-2xl font-light`}>
            {t("title")}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {VALUES.map((v, i) => (
            <div
              key={v.key}
              className="bg-white group relative p-8 rounded-2xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="bg-gray-100 text-[#a8d5b5] w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                {v.icon}
              </div>

              <p className={`${dmSans.className} absolute top-8 right-7 text-5xl font-light select-none`}>
                0{i + 1}
              </p>

              <h3 className={`${playfair.className} text-black font-medium mb-3 text-lg`}>
                {t(`items.${v.key}.label`)}
              </h3>
              <p className={`${dmSans.className} text-[#666] text-sm leading-relaxed`}>
                {t(`items.${v.key}.desc`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
