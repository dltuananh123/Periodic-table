"use client";

import { useLanguage } from "@/lib/language-context";
import { getTranslation } from "@/lib/translations";

export function PageTitle() {
  const { language } = useLanguage();
  const title = getTranslation("periodicTable.Periodic Table", language);

  return (
    <header className="text-center mb-8 px-4">
      <h1 className="text-4xl sm:text-5xl font-bold text-neutral-100">
        {title}
      </h1>
    </header>
  );
}
