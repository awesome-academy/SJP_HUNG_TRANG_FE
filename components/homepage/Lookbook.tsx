"use client";

import { useState, useRef } from "react";
import { TouchEvent } from "react";
import { Playfair, DM_Sans } from "next/font/google";
import { ChevronLeft, ChevronRight, Instagram } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

const playfair = Playfair({ subsets: ['latin'], weight: ['600', '700'] });
const dmSans = DM_Sans({ subsets: ['latin'], weight: ['400', '500', '700'] });

interface Look {
  id: number;
  image: string;
  caption: string;
  tag: string;
}

const LOOKS: Look[] = [
  { id: 1, image: "/lookbook.jpg", caption: "Phong cách tối giản, tinh tế", tag: "#trangphucngay" },
  { id: 2, image: "/lookbook.jpg", caption: "Nét duyên dáng mỗi ngày", tag: "#lookoftheday" },
  { id: 3, image: "/lookbook.jpg", caption: "Phụ kiện hoàn chỉnh set đồ", tag: "#accessories" },
  { id: 4, image: "/lookbook.jpg", caption: "Sắc xanh của thiên nhiên", tag: "#sustainablefashion" },
  { id: 5, image: "/lookbook.jpg", caption: "Thanh lịch từng chi tiết", tag: "#ootd" },
  { id: 6, image: "/lookbook.jpg", caption: "Vẻ đẹp không cần cố gắng", tag: "#effortlessstyle" },
];

export default function Lookbook() {
  const t = useTranslations("HomePage.lookbook");
  const [active, setActive] = useState<number>(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const startX = useRef<number | null>(null);

  const VISIBLE = 3;
  const maxIndex = LOOKS.length - VISIBLE;
  const totalDots = LOOKS.length - VISIBLE + 1;

  const prev = () =>
    setActive((a) => Math.max(0, a - 1));

  const next = () =>
    setActive((a) => Math.min(maxIndex, a + 1));

  const onTouchStart = (e: TouchEvent<HTMLDivElement>): void => {
    startX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: TouchEvent<HTMLDivElement>): void => {
    if (startX.current === null) return;
    const diff = startX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev();
    startX.current = null;
  };

  const navFns: Array<() => void> = [prev, next];

  return (
    <section className="bg-[#fafcfa] w-full py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-16">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className={`${dmSans.className} text-2xl font-bold tracking-[0.3em] uppercase mb-2 text-[#6dbf82]`}>
              {t("header")}
            </p>
            <h2 className={`${playfair.className} font-light text-[#111] text-lg`}>
              {t("subheader")}
            </h2>
          </div>

          <div className="flex gap-2">
            {navFns.map((fn, i) => (
              <button
                key={i}
                onClick={fn}
                className="w-11 h-11 rounded-full border flex items-center justify-center transition-all duration-200 hover:bg-[#6dbf82] hover:border-[#6dbf82] hover:text-white cursor-pointer"
              >
                {i === 0 ? <ChevronLeft /> : <ChevronRight />}
              </button>
            ))}
          </div>
        </div>

        {/* Slider */}
       <div
        className="relative overflow-hidden rounded-3xl"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        >
        <div
            ref={trackRef}
            className="flex transition-transform duration-500 ease-out"
            style={{
            transform: `translateX(calc(-${active} * (100%/3 + 16px/3)))`,
            }}
        >
            {LOOKS.map((look, i) => (
            <div
                key={look.id}
                onClick={() => setActive(i)}
                className="w-[calc((100%-32px)/3)] mr-4 group relative shrink-0 cursor-pointer rounded-2xl overflow-hidden"
            >
                <div className="aspect-[3/4] overflow-hidden">
                <Image
                    src={look.image}
                    alt={look.caption}
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    width={400}
                    height={533}
                />
                </div>

                {/* overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* text */}
                <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <p className={`${dmSans.className} text-[#a8d5b5] text-xs mb-1`}>
                    {look.tag}
                </p>
                <p className={`${playfair.className} text-white text-sm font-medium`}>
                    {look.caption}
                </p>
                </div>
            </div>
            ))}
        </div>
        </div>
        {/* Dots */}
        <div className="flex justify-center gap-2 mt-6">
        {Array.from({ length: totalDots }).map((_, i) => (
            <button
            key={i}
            onClick={() => setActive(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
                i === active ? "w-6 bg-[#a8d5b5]" : "w-2 bg-[#dde8e0]"
            }`}
            />
        ))}
        </div>
      </div>
    </section>
  );
}
