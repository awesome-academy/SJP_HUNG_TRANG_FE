import Image from "next/image";
import { ChevronDown, Menu, Search, ShoppingCart } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import LocaleSwitcher from "@/components/layout/LocaleSwitcher";

type HeaderProps = {
	locale: "vi" | "en";
};

export default async function Header({ locale }: HeaderProps) {
	const t = await getTranslations({ locale, namespace: "Header" });

	const navItems = [
		{ label: t("nav.home"), href: "/" },
		{ label: t("nav.about"), href: "#" },
		{ label: t("nav.products"), href: "#", active: false, hasDropdown: false },
		{ label: t("nav.news"), href: "#" },
		{ label: t("nav.map"), href: "#" },
		{ label: t("nav.contact"), href: "#" },
	];

	return (
		<header className="w-full border-b border-zinc-200 bg-white font-sans text-zinc-900">
			<div className="mx-auto flex h-[92px] w-full max-w-[1440px] items-center gap-4 px-4 lg:px-8">
				<Link href="/" locale={locale} className="shrink-0 pl-[50px]">
					<Image
						src="/images/logo.png"
						alt={t("logoAlt")}
						width={240}
						height={60}
						className="h-auto w-[100px] object-contain lg:w-[180px]"
						priority
					/>
				</Link>

				<nav className="hidden flex-1 items-center justify-center gap-9 lg:flex">
					{navItems.map((item) => (
						<Link
							key={item.label}
							href={item.href}
							className={`inline-flex items-center gap-1 text-[14px] font-bold uppercase tracking-tight transition-colors ${
								item.active ? "text-[#7faa3d]" : "text-zinc-900 hover:text-[#7faa3d]"
							}`}
						>
							{item.label}
							{item.hasDropdown ? <ChevronDown className="h-5 w-5" /> : null}
						</Link>
					))}
				</nav>

				<div className="ml-auto hidden items-center gap-2 lg:flex">
					<Button variant="ghost" size="icon" className="text-zinc-900 hover:bg-zinc-100 hover:text-zinc-900">
						<ShoppingCart className="h-5 w-5" />
						<span className="sr-only">{t("actions.cart")}</span>
					</Button>
					<Button variant="ghost" size="icon" className="text-zinc-900 hover:bg-zinc-100 hover:text-zinc-900">
						<Search className="h-5 w-5" />
						<span className="sr-only">{t("actions.search")}</span>
					</Button>
					<div className="h-6 w-px bg-zinc-300"></div>
					<LocaleSwitcher
						locale={locale}
						labels={{ vi: t("locale.vi"), en: t("locale.en") }}
					/>
				</div>

				<div className="ml-auto lg:hidden">
					<DropdownMenu>
						<DropdownMenuTrigger
							className={buttonVariants({
								variant: "outline",
								size: "icon",
								className: "border-zinc-300 text-zinc-900",
							})}
						>
							<Menu className="h-5 w-5" />
							<span className="sr-only">{t("actions.menu")}</span>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-52 border-zinc-200 bg-white text-zinc-900">
							{navItems.map((item) => (
								<DropdownMenuItem key={item.label} className="font-semibold uppercase text-[13px]">
									{item.label}
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</header>
	);
}
