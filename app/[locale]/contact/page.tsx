import { getTranslations } from "next-intl/server";

import ContactForms from "@/components/contact/ContactForms";

export default async function ContactPage() {
	const t = await getTranslations("ContactPage");

	return (
		<>
			<section className="bg-[#f6f6f6] pt-8 md:pt-12">
				<div className="mx-auto w-full max-w-[1200px] px-4">
					<h1 className="text-3xl font-medium uppercase tracking-wide text-zinc-800 md:text-[44px]">
						{t("title")}
					</h1>
					<p className="mt-3 max-w-3xl text-sm text-zinc-600 md:text-base">
						{t("subtitle")}
					</p>
				</div>
			</section>
			<ContactForms />
		</>
	);
}
