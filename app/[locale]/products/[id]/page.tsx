
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import AddToCartButton from "@/components/products/AddToCartButton";
import { Link } from "@/i18n/navigation";
import { getCatalogData } from "@/lib/catalog-server";
import { formatPriceVnd, getMainImage } from "@/lib/mock-db";

type ProductDetailPageProps = {
    params: Promise<{ locale: "vi" | "en"; id: string }>;
};

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
    const { locale, id } = await params;

    const productId = Number.parseInt(id, 10);
    if (!Number.isFinite(productId)) {
        notFound();
    }

    const [tProducts, tCart, { products, categories }] = await Promise.all([
        getTranslations({ locale, namespace: "ProductsPage" }),
        getTranslations({ locale, namespace: "AddToCart" }),
        getCatalogData(),
    ]);

    const product = products.find((item) => item.id === productId);
    if (!product) {
        notFound();
    }

    const categoryName =
        categories.find((category) => category.id === product.categoryId)?.name ??
        tProducts("detail.categoryFallback");

    const sortedImages = [...product.images].sort(
        (first, second) => (first.sortOrder ?? Number.MAX_SAFE_INTEGER) - (second.sortOrder ?? Number.MAX_SAFE_INTEGER)
    );
    const primaryImage = getMainImage(product.images);

    return (
        <section className="py-8 md:py-12">
            <div className="mx-auto w-full max-w-[1200px] px-4">
                <Link
                    href="/products"
                    locale={locale}
                    className="inline-flex text-sm font-medium text-zinc-600 transition hover:text-zinc-900"
                >
                    {tProducts("detail.backToProducts")}
                </Link>

                <div className="mt-4 grid grid-cols-1 gap-8 lg:grid-cols-[1.05fr_1fr]">
                    <div>
                        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100">
                            <Image
                                src={primaryImage}
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="(max-width: 1024px) 100vw, 55vw"
                            />
                        </div>

                        {sortedImages.length > 1 ? (
                            <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
                                {sortedImages.map((image) => (
                                    <div
                                        key={image.id}
                                        className="relative aspect-square overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100"
                                    >
                                        <Image
                                            src={image.url}
                                            alt={`${product.name} ${image.id}`}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 640px) 33vw, 160px"
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : null}
                    </div>

                    <div className="rounded-2xl border border-zinc-200 bg-white p-5 md:p-7">
                        <p className="text-sm font-medium text-zinc-500">
                            {tProducts("detail.categoryLabel")}: <span className="text-zinc-700">{categoryName}</span>
                        </p>

                        <h1 className="mt-2 text-2xl font-bold text-zinc-900 md:text-3xl">{product.name}</h1>

                        <p className="mt-4 text-3xl font-extrabold text-[#7faa3d]">{formatPriceVnd(product.price, locale)}</p>

                        <p className="mt-3 text-zinc-600">{tProducts("detail.stock", { count: product.stock })}</p>

                        <div className="mt-6">
                            <h2 className="text-base font-semibold text-zinc-900">{tProducts("detail.descriptionTitle")}</h2>
                            <p className="mt-2 whitespace-pre-line leading-7 text-zinc-700">{product.description}</p>
                        </div>

                        <div className="mt-7 max-w-[280px]">
                            <AddToCartButton
                                product={product}
                                labels={{
                                    add: tCart("add"),
                                    added: tCart("added"),
                                    outOfStock: tCart("outOfStock"),
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
