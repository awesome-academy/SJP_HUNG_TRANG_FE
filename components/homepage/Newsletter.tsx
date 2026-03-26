"use client";

import { useTranslations } from "next-intl";
import { Playfair, DM_Sans } from "next/font/google";
import Link from "next/link";

const playfair = Playfair({ subsets: ['latin'], weight: ['600', '700'] });
const dmSans = DM_Sans({ subsets: ['latin'], weight: ['400', '500', '700'] });

interface Perk {
  key: string;
}

const PERKS: Perk[] = [
  { key: "exclusive-offers" },
  { key: "new-arrivals" },
  { key: "beauty-tips" }
];

export default function Newsletter() {
  const t = useTranslations("HomePage.newsletter");

  return (
    <section className="bg-[#f0f7f2] w-full py-24 relative overflow-hidden">
      <div className="relative max-w-2xl mx-auto px-5 sm:px-8 text-center"> 
        <p className={`${dmSans.className} text-xs text-[#6dbf82] tracking-[0.3em] uppercase mb-3`}>
          {t("subtitle")}
        </p>

        <h2 className={`${playfair.className} font-light text-[#111] mb-3 text-3xl`}>
          {t("header")} 
          <br />
          <em className="not-italic text-[#2d7a3a] text-2xl">{t("headerHighlight")}</em>
        </h2>

        <p className={`${dmSans.className} text-[#666] text-sm leading-relaxed mb-2`}>
          {t("description")}
        </p>

        <div className="flex flex-wrap justify-center gap-4 mb-8 mt-4">
          {PERKS.map((perk) => (
            <span key={perk.key} className="flex items-center gap-1.5 text-xs">
              <span className="text-[#6dbf82]">✓</span> {t(`perks.${perk.key}`)}
            </span>
          ))}
        </div>

            <Link
              href="/register"
              className={`${dmSans.className} bg-linear-to-r from-[#6dbf82] to-[#2d7a3a] text-white m-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:opacity-90 whitespace-nowrap`}
            >
              {t("cta")}
            </Link>
          </div>
    </section>
  );
}
