"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { DM_Sans } from "next/font/google";
import { Heart, Star } from "lucide-react";
import { useTranslations } from "next-intl";

const dmSans = DM_Sans({ subsets: ['latin'], weight: ['400', '500', '700'] });

interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  image: string;
  label: string;
  rating: number;
}

const PRODUCTS = [
    {
        id: 1,
        name: "Nước hoa Blanc Forêt",
        brand: "Maison de Fleur",
        price: 1_490_000,
        image: "/skincare.jpg",
        label: "New",
        rating: 5.0
    },
    {
        id: 2,
        name: "Nước hoa Blanc Forêt",
        brand: "Maison de Fleur",
        price: 1_490_000,
        image: "/skincare.jpg",
        label: "New",
        rating: 5.0
    },
    {
        id: 3,
        name: "Nước hoa Blanc Forêt",
        brand: "Maison de Fleur",
        price: 1_490_000,
        image: "/skincare.jpg",
        label: "New",
        rating: 5.0
    },
    {
        id: 4,
        name: "Nước hoa Blanc Forêt",
        brand: "Maison de Fleur",
        price: 1_490_000,
        image: "/skincare.jpg",
        label: "New",
        rating: 5.0
    },{
        id: 5,
        name: "Nước hoa Blanc Forêt",
        brand: "Maison de Fleur",
        price: 1_490_000,
        image: "/skincare.jpg",
        label: "New",
        rating: 5.0
    },
    {
        id: 6,
        name: "Nước hoa Blanc Forêt",
        brand: "Maison de Fleur",
        price: 1_490_000,
        image: "/skincare.jpg",
        label: "New",
        rating: 5.0
    },
    {
        id: 7,
        name: "Nước hoa Blanc Forêt",
        brand: "Maison de Fleur",
        price: 1_490_000,
        image: "/skincare.jpg",
        label: "New",
        rating: 5.0
    },
    {
        id: 8,
        name: "Nước hoa Blanc Forêt",
        brand: "Maison de Fleur",
        price: 1_490_000,
        image: "/skincare.jpg",
        label: "New",
        rating: 5.0
    },
]

function formatPrice(p: number): string {
  const locale =
    typeof window !== "undefined" && window.navigator?.language
      ? window.navigator.language
      : "vi-VN";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "VND",
  }).format(p);
}

interface ProductCardProps {
  product: Product;
}

function ProductCard({ product }: ProductCardProps) {
  const t = useTranslations("HomePage.newArrivals");
  const [added, setAdded] = useState<boolean>(false);
  const [wished, setWished] = useState<boolean>(false);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleAdd = (): void => {
    setAdded(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setAdded(false);
    }, 1800);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="bg-white group flex flex-col border border-[#e0e0e0] rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="h-64 relative overflow-hidden bg-[#f5f8f5]">
        <Image
          src={product.image}
          alt={product.name}
          className="absolute inset-0 object-cover transition-transform duration-500 group-hover:scale-105"
          fill
        />

        <span className={`${dmSans.className} bg-[#a8d5b5] text-[#0e0e0e] absolute top-3 left-3 text-[10px] font-semibold px-2.5 py-1 rounded-full tracking-wide`}>
          {product.label}
        </span>

        <button
          onClick={() => setWished(!wished)}
          className="bg-white absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 cursor-pointer hover:bg-[#6dbf82] hover:text-white"
          >
            <Heart className={wished ? "fill-[#6dbf82] text-white" : "text-[#6dbf82]"}/>
        </button>

        <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={handleAdd}
            className={`${dmSans.className} bg-[#6dbf82] text-white w-full py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer hover:bg-[#a8d5b5]`}
          >
            {added ? t("addedToCart") : t("addToCart")}
          </button>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-1 flex-1">
        <p className={`${dmSans.className} text-[10px] text-[#aaa] tracking-widest uppercase`}>
          {product.brand}
        </p>
        <p className={`${dmSans.className} text-[#111] text-sm font-medium leading-snug line-clamp-2`}>
          {product.name}
        </p>
        <div className="flex items-center justify-between mt-auto pt-3">
          <p className={`${dmSans.className} font-semibold text-sm`}>
            {formatPrice(product.price)}
          </p>
          <div className="flex items-center gap-1">
            <Star className="fill-[#f5c518] text-[#f5c518]" size={16} />
            <span className={`${dmSans.className} text-[13px] text-[#888]`}>
              {product.rating}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewArrivals() {
  const t = useTranslations("HomePage.newArrivals");

  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6 mb-10">
          <div>
            <p className={`${dmSans.className} text-2xl font-bold tracking-[0.3em] uppercase mb-2 text-[#6dbf82]`}>
              {t("header")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {PRODUCTS.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

        <div className="flex justify-center mt-12">
          <button
            className={`${dmSans.className} px-10 py-3.5 rounded-full text-sm font-medium border transition-all duration-300 hover:bg-[#6dbf82] hover:text-white hover:border-[#6dbf82] cursor-pointer`}
          >
            {t("viewAll")}
          </button>
        </div>
      </div>
    </section>
  );
}
