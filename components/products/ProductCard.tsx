import Image from "next/image";

import { Link } from "@/i18n/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPriceVnd, getMainImage, type Product } from "@/lib/mock-db";

type ProductCardProps = {
  product: Product;
  locale: "vi" | "en";
};

export default function ProductCard({ product, locale }: ProductCardProps) {
  return (
    <Link href={`/products/${product.id}`} locale={locale} className="block h-full">
      <Card className="h-full border-zinc-200 bg-white py-0 transition hover:-translate-y-0.5 hover:shadow-md">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-xl bg-zinc-100">
          <Image
            src={getMainImage(product.images)}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          />
        </div>
        <CardHeader className="pb-1">
          <CardTitle className="line-clamp-2 min-h-[44px] text-[15px] font-semibold text-zinc-900">
            {product.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <p className="text-[16px] font-bold text-[#7faa3d]">{formatPriceVnd(product.price, locale)}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
