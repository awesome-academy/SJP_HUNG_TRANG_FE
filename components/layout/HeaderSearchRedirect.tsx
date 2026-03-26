"use client";

import { useEffect } from "react";

import { useRouter } from "@/i18n/navigation";

export default function HeaderSearchRedirect() {
  const router = useRouter();

  useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const button = target?.closest("button");

      if (!button || !button.closest("header")) {
        return;
      }

      const hasSearchIcon = Boolean(button.querySelector("svg.lucide-search"));
      if (!hasSearchIcon) {
        return;
      }

      event.preventDefault();
      router.push("/search");
    };

    document.addEventListener("click", onDocumentClick);

    return () => {
      document.removeEventListener("click", onDocumentClick);
    };
  }, [router]);

  return null;
}
