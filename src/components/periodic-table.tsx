"use client";

import * as React from "react";
import { elementsData } from "@/data/elements";
import { ElementCell } from "./element-cell";
import { Input } from "@/components/ui/input";
import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  XIcon,
  Loader2,
  FlaskConical,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { getCategoryColor } from "@/lib/constants";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { formatChemicalFormula } from "@/lib/utils";
import { useLanguage } from "@/lib/language-context";
import { getTranslation } from "@/lib/translations";
import { useElementTranslation } from "@/hooks/use-element-translation";

import {
  balanceChemicalEquation,
  type BalanceEquationInput,
  type BalanceEquationOutput,
} from "@/ai/flows/balance-chemical-equation-flow";

interface LegendItem {
  label: string;
  categoryKey: keyof typeof import("@/lib/constants").CATEGORY_COLORS | string;
}

const legendItems: LegendItem[] = [
  { label: "Alkali Metal", categoryKey: "alkali-metal" },
  { label: "Alkaline Earth Metal", categoryKey: "alkaline-earth-metal" },
  { label: "Lanthanide", categoryKey: "lanthanide" },
  { label: "Actinide", categoryKey: "actinide" },
  { label: "Transition Metal", categoryKey: "transition-metal" },
  { label: "Post-transition Metal", categoryKey: "post-transition-metal" },
  { label: "Metalloid", categoryKey: "metalloid" },
  { label: "Nonmetal (Polyatomic)", categoryKey: "polyatomic-nonmetal" },
  { label: "Nonmetal (Diatomic)", categoryKey: "diatomic-nonmetal" },
  { label: "Noble Gas", categoryKey: "noble-gas" },
  { label: "Unknown Properties", categoryKey: "unknown-properties" },
];

function LegendKey({ label, color }: { label: string; color: string }) {
  return (
    <div className="flex items-center space-x-2">
      <div
        className="w-3 h-3 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="text-xs text-neutral-300">{label}</span>
    </div>
  );
}

export function PeriodicTable() {
  const { language } = useLanguage();
  const { translateElement } = useElementTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [mounted, setMounted] = useState(false);
  const [equationInput, setEquationInput] = useState("");
  const [isBalancing, setIsBalancing] = useState(false);
  const [balanceResult, setBalanceResult] =
    useState<BalanceEquationOutput | null>(null);
  const [showBalanceDetails, setShowBalanceDetails] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredElements = useMemo(() => {
    if (!searchTerm) return elementsData;
    const lowerSearchTerm = searchTerm.toLowerCase();
    return elementsData.filter((el) => {
      const translatedElement = translateElement(el);
      return (
        el.name.toLowerCase().includes(lowerSearchTerm) ||
        translatedElement.name.toLowerCase().includes(lowerSearchTerm) ||
        el.symbol.toLowerCase().includes(lowerSearchTerm) ||
        el.atomicNumber.toString() === lowerSearchTerm
      );
    });
  }, [searchTerm, language, translateElement]);

  const elementsToDisplay = searchTerm ? filteredElements : elementsData;

  const max_xpos = Math.max(...elementsData.map((el) => el.xpos), 18);
  const max_ypos = Math.max(...elementsData.map((el) => el.ypos), 10);

  if (!mounted) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <p className="text-neutral-400">Loading Periodic Table...</p>
      </div>
    );
  }

  const handleBalanceEquation = async () => {
    if (!equationInput.trim()) {
      return;
    }
    setIsBalancing(true);
    setBalanceResult(null);
    setShowBalanceDetails(false);

    try {
      const input: BalanceEquationInput = {
        unbalancedEquation: equationInput,
        language: language,
      };
      const result = await balanceChemicalEquation(input);
      setBalanceResult(result);
    } catch (error) {
      console.error("Balancing client/flow error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unexpected client-side error occurred.";
      setBalanceResult({
        reactionOccurs: false,
        explanation: `A client-side error occurred: ${errorMessage}`,
        errorMessage: errorMessage,
      });
    } finally {
      setIsBalancing(false);
    }
  };

  const displayEquation = (eqString: string | undefined) => {
    if (!eqString) return "N/A";
    return formatChemicalFormula(
      eqString.replace(/->/g, "→").replace(/=>/g, "⇒")
    );
  };

  const colorCodeEquation = (eqString: string | undefined): React.ReactNode => {
    if (!eqString) return "N/A";
    const parts = eqString.split(/\s*->\s*|\s*=\s*/);
    if (parts.length !== 2) return displayEquation(eqString);

    const reactants = parts[0].split(/\s*\+\s*/);
    const products = parts[1].split(/\s*\+\s*/);
    const separator = eqString.includes("->") ? "→" : "=";

    return (
      <>
        {reactants.map((reactant, index) => (
          <React.Fragment key={`reactant-${index}`}>
            <span className="text-pink-400">{displayEquation(reactant)}</span>
            {index < reactants.length - 1 && (
              <span className="text-foreground"> + </span>
            )}
          </React.Fragment>
        ))}
        <span className="text-foreground"> {separator} </span>
        {products.map((product, index) => (
          <React.Fragment key={`product-${index}`}>
            <span className="text-sky-400">{displayEquation(product)}</span>
            {index < products.length - 1 && (
              <span className="text-foreground"> + </span>
            )}
          </React.Fragment>
        ))}
      </>
    );
  };

  const getAlertTitle = () => {
    if (!balanceResult) return "";
    if (balanceResult.errorMessage) return "Processing Error";
    if (!balanceResult.reactionOccurs) return "Reaction Analysis";
    return "Reaction Details";
  };

  const getAlertIcon = () => {
    if (!balanceResult) return <Terminal className="h-4 w-4" />;
    if (balanceResult.errorMessage)
      return <AlertTriangle className="h-4 w-4" />;
    if (!balanceResult.reactionOccurs) return <XIcon className="h-4 w-4" />;
    return <FlaskConical className="h-4 w-4" />;
  };

  return (
    <div className="w-full px-1 sm:px-2 py-6">
      <div className="mb-6 max-w-md mx-auto relative">
        <Input
          type="text"
          placeholder={getTranslation(
            "common.Search element placeholder",
            language
          )}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="text-base bg-neutral-800 border-neutral-700 placeholder:text-neutral-500 focus:ring-offset-neutral-900"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 text-neutral-400 hover:text-neutral-200"
            onClick={() => setSearchTerm("")}
          >
            <XIcon className="h-4 w-4" />
          </Button>
        )}
      </div>

      {elementsToDisplay.length === 0 && searchTerm && (
        <p className="text-center text-muted-foreground">
          {getTranslation("common.No elements found", language).replace(
            "{searchTerm}",
            searchTerm
          )}
        </p>
      )}

      <div
        className="grid gap-px mx-auto overflow-x-auto p-4 bg-neutral-900 border border-neutral-800"
        style={{
          gridTemplateColumns: `repeat(${max_xpos}, minmax(55px, 1fr))`,
          gridTemplateRows: `repeat(${max_ypos}, minmax(0, auto))`,
          maxWidth: "100%",
          width: "fit-content",
        }}
        aria-label={getTranslation("periodicTable.Periodic Table", language)}
      >
        {elementsToDisplay.map((element) => (
          <ElementCell key={element.atomicNumber} element={element} />
        ))}
      </div>

      <div className="mt-8 max-w-4xl mx-auto px-2">
        <h3 className="text-lg font-semibold text-neutral-200 mb-3 text-center">
          {getTranslation("common.Legend", language)}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-2 justify-center">
          {legendItems.map((item) => (
            <LegendKey
              key={item.categoryKey}
              label={
                getTranslation(`categories.${item.categoryKey}`, language) ||
                item.label
              }
              color={getCategoryColor(item.categoryKey)}
            />
          ))}
        </div>
      </div>

      {/* Chemical Equation Solver Section */}
      <div className="mt-12 max-w-2xl mx-auto px-2">
        <h3 className="text-xl font-semibold text-neutral-200 mb-4 text-center">
          {getTranslation("periodicTable.Chemical Equation Solver", language)}
        </h3>
        <div className="p-6 bg-neutral-800/50 border border-neutral-700 rounded-lg shadow-lg space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            {getTranslation("common.Equation instruction", language)}
            <br />
            Ex: H2 + Cl2 --&gt; 2HCl
          </p>
          <Textarea
            placeholder={getTranslation(
              "common.Equation placeholder",
              language
            )}
            value={equationInput}
            onChange={(e) => setEquationInput(e.target.value)}
            className="text-base bg-card border-neutral-600 placeholder:text-muted-foreground focus:ring-offset-card min-h-[100px] resize-none"
            disabled={isBalancing}
          />
          <Button
            onClick={handleBalanceEquation}
            disabled={isBalancing || !equationInput.trim()}
            className="w-full bg-primary/80 hover:bg-primary text-primary-foreground"
            aria-label="Balance Chemical Equation"
          >
            {isBalancing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              getTranslation(
                "periodicTable.Analyze & Balance Equation",
                language
              )
            )}
          </Button>

          {balanceResult && (
            <>
              {balanceResult.reactionOccurs === true &&
              balanceResult.balancedEquation ? (
                <div className="mt-4 p-4 bg-neutral-900/70 border border-neutral-700 rounded-md shadow-md text-neutral-100">
                  <div className="text-center font-mono text-xl sm:text-2xl mb-3">
                    {colorCodeEquation(balanceResult.balancedEquation)}
                  </div>

                  {balanceResult.reactionConditions && (
                    <div className="text-sm text-amber-300/80 mb-3">
                      <div className="flex items-start">
                        <FlaskConical className="h-4 w-4 mr-2 shrink-0 mt-1" />
                        <div>
                          <span className="font-semibold mr-1">
                            Điều kiện phản ứng:
                          </span>
                          <p className="whitespace-pre-wrap">
                            {balanceResult.reactionConditions}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  {balanceResult.explanation && (
                    <div className="text-sm text-neutral-300 mb-3 italic">
                      <p className="whitespace-pre-wrap">
                        {balanceResult.explanation}
                      </p>
                    </div>
                  )}

                  <div className="text-right">
                    <Button
                      variant="link"
                      className="text-sky-400 hover:text-sky-300 p-0 h-auto text-sm"
                      onClick={() => setShowBalanceDetails(!showBalanceDetails)}
                    >
                      {showBalanceDetails ? (
                        <ChevronUp className="h-4 w-4 mr-1" />
                      ) : (
                        <ChevronDown className="h-4 w-4 mr-1" />
                      )}
                      {showBalanceDetails ? "Ẩn chi tiết" : "Xem chi tiết"}
                    </Button>
                  </div>

                  {showBalanceDetails && (
                    <div className="mt-3 pt-3 border-t border-neutral-700 space-y-2 text-sm">
                      {balanceResult.reactants &&
                        balanceResult.reactants.length > 0 && (
                          <div>
                            <strong className="block text-sm mb-0.5 text-neutral-200">
                              Reactants:
                            </strong>
                            <p className="font-mono text-xs text-neutral-300">
                              {balanceResult.reactants.map((r, i) => (
                                <span key={`reactant-${i}`}>
                                  {displayEquation(r)}
                                  {i < balanceResult.reactants!.length - 1
                                    ? ", "
                                    : ""}
                                </span>
                              ))}
                            </p>
                          </div>
                        )}
                      {balanceResult.products &&
                        balanceResult.products.length > 0 && (
                          <div>
                            <strong className="block text-sm mb-0.5 text-neutral-200">
                              Products:
                            </strong>
                            <p className="font-mono text-xs text-neutral-300">
                              {balanceResult.products.map((p, i) => (
                                <span key={`product-${i}`}>
                                  {displayEquation(p)}
                                  {i < balanceResult.products!.length - 1
                                    ? ", "
                                    : ""}
                                </span>
                              ))}
                            </p>
                          </div>
                        )}
                    </div>
                  )}
                </div>
              ) : (
                <Alert
                  variant={
                    balanceResult.errorMessage || !balanceResult.reactionOccurs
                      ? "destructive"
                      : "default"
                  }
                  className="mt-4"
                >
                  {getAlertIcon()}
                  <AlertTitle>{getAlertTitle()}</AlertTitle>
                  <AlertDescription className="space-y-3 text-sm">
                    {balanceResult.reactionOccurs === false &&
                      balanceResult.noReactionDisplay && (
                        <div className="pt-1">
                          <p className="font-mono text-base p-2 bg-muted/30 rounded text-center">
                            {displayEquation(balanceResult.noReactionDisplay)}
                          </p>
                        </div>
                      )}
                    {balanceResult.explanation && (
                      <div>
                        <strong className="block text-sm mb-0.5">
                          Explanation:
                        </strong>
                        <p className="text-xs whitespace-pre-wrap">
                          {balanceResult.explanation}
                        </p>
                      </div>
                    )}
                    {balanceResult.errorMessage && (
                      <div>
                        <strong className="block text-sm mb-0.5">
                          Error Details:
                        </strong>
                        <p className="text-xs">{balanceResult.errorMessage}</p>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
