import { en } from "./en";
import { vi } from "./vi";

export const translations = {
  en,
  vi,
};

export type TranslationKey = keyof typeof en;

export function getTranslation(key: string, language: "en" | "vi"): string {
  const keys = key.split(".");
  let value: any = translations[language];

  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = value[k];
    } else {
      return key;
    }
  }

  return typeof value === "string" ? value : key;
}
