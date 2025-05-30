import { useLanguage } from "@/lib/language-context";
import { getTranslation } from "@/lib/translations";
import { ElementData } from "@/data/elements";
import { elementsSummaryVi } from "@/lib/translations/elements-summary-vi";

export function useElementTranslation() {
  const { language } = useLanguage();

  const translateElement = (element: ElementData) => {
    if (language === "en") {
      return element;
    }

    // Get the translated name from the elements object in translations
    const translatedName = getTranslation(`elements.${element.name}`, language);
    // Get the translated summary
    const translatedSummary =
      language === "vi" ? elementsSummaryVi[element.name] : element.summary;

    return {
      ...element,
      name: translatedName || element.name, // Fallback to original name if translation not found
      category: getTranslation(`categories.${element.category}`, language),
      summary: translatedSummary || element.summary, // Fallback to original summary if translation not found
    };
  };

  const translateProperty = (property: string) => {
    return getTranslation(`periodicTable.${property}`, language);
  };

  return {
    translateElement,
    translateProperty,
  };
}
