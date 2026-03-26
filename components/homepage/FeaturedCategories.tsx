"use client";

import Image from "next/image";
import { Playfair, DM_Sans } from "next/font/google";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

const playfair = Playfair({ subsets: ['latin'], weight: ['600', '700'] });
const dmSans = DM_Sans({ subsets: ['latin'], weight: ['400', '500', '700'] });


const CATEGORIES = [
  {
    id: 1,
    title: "Trang sức tinh xảo",
    sub: "Bộ sưu tập mới 2025",
    image: "/earrings.jpg",
    tag: "Jewelry",
  },
  {
    id: 2,
    title: "Hương thơm tự nhiên",
    sub: "Chiết xuất từ thiên nhiên",
    image: "/earrings.jpg",
    tag: "Perfume",
  },
  {
    id: 3,
    title: "Thời trang bền vững",
    sub: "Eco-friendly · Ethical",
    image: "/earrings.jpg",
    tag: "Fashion",
  },
];

export default function FeaturedCategories() {
  const t = useTranslations("HomePage.featuredCategories");
  
  return (
    <section className="w-full py-20 bg-[#fafcfa]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className={`${dmSans.className} text-2xl font-bold tracking-[0.3em] uppercase mb-2 text-[#6dbf82]`}>
              {t("header")}
            </p>
            <h2 className={`${playfair.className} font-light text-[#111] text-lg`}>
              {t("subheader")}
            </h2>
          </div>
          <Link href="#" className={`${dmSans.className} group font-normal shrink-0 text-[#6dbf82] flex items-center gap-2  hover:translate-x-1 transition-all duration-300`}>
            {t("viewAll")}
            <ArrowRight className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 gap-4 lg:grid-rows-2 lg:h-[560px]">
          {CATEGORIES.map((cat) => (
            <div key={cat.id} className="group relative overflow-hidden rounded-3xl cursor-pointer lg:col-span-1 lg:row-span-2">
              <Image
                src={cat.image}
                alt={cat.title}
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                width={800}
                height={560}
              />

              {/* Gradient */}
              <div className="absolute inset-0 transition-opacity duration-300 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100"/>

              {/* Tag pill */}
              <div className="absolute top-4 left-4">
                <span className={`${dmSans.className} text-[10px] tracking-[0.2em] uppercase px-3 py-1 rounded-full font-medium bg-white text-green-500`}>
                  {cat.tag}
                </span>
              </div>

              {/* Content bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <p className={` ${playfair.className} text-white text-xl font-bold mb-1 leading-tight`}>
                  {cat.title}
                </p>
                <p className={` ${dmSans.className} text-green-200 text-xs mb-4`}>
                  {cat.sub}
                </p>

                {/* Slide up */}
                <div className="overflow-hidden h-0 group-hover:h-9 transition-all duration-300">
                  <button className={`${dmSans.className} bg-[#a8d5b5] flex items-center gap-2 text-sm font-medium px-5 py-2 rounded-full transition-all cursor-pointer hover:bg-[#6dbf82]`}>
                    {t("viewDetails")}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
