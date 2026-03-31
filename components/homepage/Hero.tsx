"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

export default function Hero() {
  const t = useTranslations("HomePage.hero");
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.transform = "translateY(32px)";
    const timeoutId = window.setTimeout(() => {
      if (!el) return;
      el.style.transition = "opacity 0.9s ease, transform 0.9s ease";
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    }, 100);
    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <section className="relative w-full overflow-hidden">
      <Image
        src="/hero.jpg"
        alt={t("alt")}
        width={1920}
        height={1080}
        className="w-full h-auto"
        priority
      />

      <div className="absolute inset-0 z-10">
        <div className="w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-16 h-full flex items-center">
          <div ref={textRef} className="max-w-lg">
            <h1 className="text-white font-bold leading-[1.05] mb-4 text-3xl sm:text-4xl md:text-5xl lg:text-6xl drop-shadow-lg">
              {t("title.line1")}
              <br />
              <span>{t("title.line2")}</span>
              <br />
              {t("title.line3")}
            </h1>

            <p className="text-white/90 leading-relaxed mb-6 text-sm sm:text-base md:text-lg drop-shadow-md">
              {t("description")}
            </p>

            <div className="flex flex-wrap gap-3 sm:gap-4">
              <button className="bg-white text-[#7db87d] font-semibold px-6 sm:px-8 py-3 rounded-full text-sm sm:text-base transition-all duration-300 hover:scale-[1.03] cursor-pointer">
                {t("cta")}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#333] to-transparent" />
    </section>
  );
}
