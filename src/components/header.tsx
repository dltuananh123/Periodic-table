"use client";

import { LanguageSwitcher } from "./language-switcher";
import { useLanguage } from "@/lib/language-context";
import { getTranslation } from "@/lib/translations";
import { TestTubeDiagonal } from "lucide-react";

export function Header() {
  const { language } = useLanguage();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full max-w-screen-2xl mx-auto px-4 flex h-14 items-center">
        <div className="flex-1" /> {/* Left spacer */}
        <div className="flex items-center justify-center">
          <a className="flex items-center" href="/">
            <TestTubeDiagonal className="h-6 w-6" />
          </a>
        </div>
        <div className="flex-1 flex justify-end">
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
