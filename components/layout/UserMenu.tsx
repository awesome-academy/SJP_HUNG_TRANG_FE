"use client";

import { useSession, signOut } from "next-auth/react";
import { User, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/constants/router";

type UserMenuProps = {
  labels: {
    signIn: string;
    signOut: string;
    profile: string;
  };
  locale: "vi" | "en";
};

export default function UserMenu({ labels, locale }: UserMenuProps) {
  const { data: session, status } = useSession();

  if (status === "loading") return null;

  if (!session) {
    return (
      <Link
        href={ROUTES.LOGIN}
        locale={locale}
        className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-zinc-900 hover:text-[#7faa3d] transition-colors"
      >
        <User className="h-4 w-4" />
        {labels.signIn}
      </Link>
    );
  }

  const displayName = session.user?.name ?? session.user?.email ?? "User";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1.5 text-zinc-900 hover:bg-zinc-100 hover:text-zinc-900 px-2"
        >
          <User className="h-4 w-4 shrink-0" />
          <span className="max-w-[100px] truncate text-[13px] font-semibold">
            {displayName}
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48 border-zinc-200 bg-white text-zinc-900">
        <DropdownMenuLabel className="text-xs text-zinc-500 font-normal truncate">
          {session.user?.email}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-zinc-100" />

        <DropdownMenuItem asChild>
          <Link href="" locale={locale} className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            {labels.profile}
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-zinc-100" />

        <DropdownMenuItem
          onClick={() => signOut({ callbackUrl: ROUTES.HOME })}
          className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          {labels.signOut}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
