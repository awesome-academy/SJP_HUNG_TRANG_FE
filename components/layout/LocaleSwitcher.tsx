"use client";

import { Check, Globe } from "lucide-react";

import { usePathname, useRouter } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type FooterLocaleSwitcherProps = {
  locale: "vi" | "en";
  labels: {
    vi: string;
    en: string;
  };
};

export default function FooterLocaleSwitcher({
  locale,
  labels,
}: FooterLocaleSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();

  const switchLocale = (nextLocale: "vi" | "en") => {
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={buttonVariants({
          variant: "outline",
          size: "sm",
          className: "h-8 border-zinc-800 px-2.5 text-zinc-600",
        })}
      >
        <Globe className="h-3.5 w-3.5" />
        {locale.toUpperCase()}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36 border-zinc-800">
        <DropdownMenuItem onSelect={() => switchLocale("vi")}>
          {locale === "vi" ? <Check className="mr-2 h-3.5 w-3.5" /> : <span className="mr-2 h-3.5 w-3.5" />}
          {labels.vi}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => switchLocale("en")}>
          {locale === "en" ? <Check className="mr-2 h-3.5 w-3.5" /> : <span className="mr-2 h-3.5 w-3.5" />}
          {labels.en}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
