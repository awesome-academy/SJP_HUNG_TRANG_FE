import { ChevronRight, Mail, MapPin, Phone, User } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function FooterSection({
	title,
	items,
	highlightIndex,
}: {
	title: string;
	items: string[];
	highlightIndex?: number;
}) {
	return (
		<section>
			<h3 className="mb-3 text-[17px] font-bold uppercase tracking-wide text-white lg:text-[18px]">
				{title}
			</h3>
			<ul className="space-y-1.5">
				{items.map((item, index) => {
					const isHighlighted = index === highlightIndex;

					return (
						<li key={item}>
							<a
								href="#"
								className={`group inline-flex items-center gap-1.5 text-[15px] leading-relaxed transition-colors lg:text-[16px] ${
									isHighlighted
										? "font-semibold text-lime-500"
										: "text-zinc-500 hover:text-zinc-300"
								}`}
							>
								<ChevronRight
									className={`h-3.5 w-3.5 ${isHighlighted ? "text-lime-500" : "text-zinc-700 group-hover:text-zinc-400"}`}
								/>
								{item}
							</a>
						</li>
					);
				})}
			</ul>
		</section>
	);
}

type FooterProps = {
	locale: "vi" | "en";
};

export default async function Footer({ locale }: FooterProps) {
	const t = await getTranslations({ locale, namespace: "Footer" });

	const shippingLinks = t.raw("shippingLinks") as string[];
	const supportLinks = t.raw("supportLinks") as string[];
	const infoLinks = t.raw("infoLinks") as string[];
	const accountLinks = t.raw("accountLinks") as string[];

	return (
		<footer className="mt-auto w-full bg-[#050505] font-sans text-white">
			<div className="mx-auto max-w-[1260px] px-6 pb-5 pt-8 lg:px-12 lg:pt-10">
				<div className="grid gap-x-10 gap-y-8 border-b border-zinc-900 pb-7 md:grid-cols-2 xl:grid-cols-[1.9fr_1fr_1fr_1fr_1fr]">
					<Card className="border-zinc-900 bg-zinc-950/40">
						<CardHeader className="pb-3">
								<CardTitle className="text-[17px] font-bold uppercase tracking-wide text-white lg:text-[18px]">
									{t("contactTitle")}
								</CardTitle>
						</CardHeader>


						<CardContent className="space-y-2 text-[15px] leading-relaxed text-zinc-500 lg:text-[16px]">
							<p className="flex items-start gap-2">
								<MapPin className="mt-0.5 h-4 w-4 shrink-0 text-lime-500" />
								{t("addressLine1")}
							</p>
							<p className="flex items-start gap-2">
								<Phone className="mt-0.5 h-4 w-4 shrink-0 text-lime-500" />
								(04) 6674 2332 - (04) 3786 8904
							</p>
							<p className="flex items-start gap-2">
								<Mail className="mt-0.5 h-4 w-4 shrink-0 text-lime-500" />
								<a href="mailto:Support@bizweb.vn" className="font-semibold italic text-lime-500 hover:text-lime-400">
									Support@bizweb.vn
								</a>
							</p>
						</CardContent>
					</Card>

					  <FooterSection title={t("sections.shipping")} items={shippingLinks} />
					  <FooterSection title={t("sections.support")} items={supportLinks} />
					  <FooterSection title={t("sections.info")} items={infoLinks} />

					<section>
						<div className="mb-3 flex items-center gap-2">
							<Avatar className="h-7 w-7 border border-zinc-800">
								<AvatarFallback>
									<User className="h-3.5 w-3.5 text-zinc-800" />
								</AvatarFallback>
							</Avatar>
							<h3 className="text-[17px] font-bold uppercase tracking-wide text-white lg:text-[18px]">{t("sections.account")}</h3>
						</div>
						<ul className="space-y-1.5">
							{accountLinks.map((item) => (
								<li key={item}>
									<Button
										variant="ghost"
										className="h-auto justify-start p-0 text-[15px] text-zinc-500 hover:bg-transparent hover:text-zinc-300 lg:text-[16px]"
									>
										{item}
									</Button>
								</li>
							))}
						</ul>
					</section>
				</div>

				<div className="flex flex-col gap-4 pt-4 md:flex-row md:items-center md:justify-between">
					<p className="text-[13px] text-zinc-600 lg:text-[14px]">{t("copyright")}</p>
				</div>
			</div>
		</footer>
	);
}
