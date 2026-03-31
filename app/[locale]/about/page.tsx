import Image from "next/image";
import { getTranslations } from "next-intl/server";

export default async function AboutPage() {
	const t = await getTranslations("AboutPage");

	return (
		<main className="w-full bg-[#f3f3f3] py-8 md:py-12">
			<section className="mx-auto w-full max-w-[1400px] px-4">
				<h1 className="mb-6 text-3xl font-medium uppercase tracking-wide text-zinc-800 md:mb-8 md:text-[36px]">
					{t("title")}
				</h1>

				<div className="grid grid-cols-1 gap-7 lg:grid-cols-[1fr_1fr] lg:gap-10">
					<div className="overflow-hidden bg-zinc-100 flex">
                        <Image
                            src="/images/about-us.jpg"
                            alt={t("imageAlt")}
                            width={900}
                            height={560}
                            className="h-[300px] w-full scale-[0.85] object-cover md:h-[420px] lg:h-[560px]"
                            priority
                        />
                        </div>

					<div className="flex flex-col gap-6 pt-1 md:pt-3">
						<Image
							src="/images/logo.png"
							alt={t("brandAlt")}
							width={340}
							height={120}
							className="h-auto w-[240px] object-contain md:w-[340px]"
						/>

						<h2 className="text-2xl font-semibold uppercase leading-tight text-zinc-800 md:text-[24px] md:leading-[1.15]">
							{t("heading")}
						</h2>

						<div className="space-y-4 text-lg leading-relaxed text-zinc-600 md:text-[16px] md:leading-[1.35]">
							<p>{t("paragraphs")}</p>
						</div>
					</div>
				</div>
			</section>
		</main>
	);
}
