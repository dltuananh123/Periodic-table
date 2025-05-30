"use client";

import type { ElementData } from "@/data/elements";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { getCategoryColor } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { useElementTranslation } from "@/hooks/use-element-translation";

interface ElementCellProps {
  element: ElementData;
}

export function ElementCell({ element }: ElementCellProps) {
  const { translateElement, translateProperty } = useElementTranslation();
  const translatedElement = translateElement(element);
  const categoryColor = getCategoryColor(element.category);
  const textColor = "text-neutral-50"; // Default to light text for dark backgrounds

  // Format atomic mass to handle both number and string values
  // Round to 1 decimal place for high school level display
  const formatAtomicMass = (mass: number | string) => {
    if (typeof mass === "number") {
      return (mass as number).toFixed(1);
    }
    return mass;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div
          className={`p-1 border border-neutral-800 flex flex-col items-center justify-between text-center cursor-pointer transition-all duration-200 hover:scale-110 hover:ring-1 hover:ring-neutral-400 hover:z-10 relative ${textColor}`}
          style={{
            gridColumnStart: element.xpos,
            gridRowStart: element.ypos,
            backgroundColor: categoryColor,
            minHeight: "75px",
            aspectRatio: "1 / 1", // Make cells square
          }}
          aria-label={`${translateProperty("Element")}: ${
            translatedElement.name
          }, ${translateProperty("Atomic Number")}: ${element.atomicNumber}`}
          role="button"
          tabIndex={0}
        >
          <div className="flex justify-between w-full">
            <div className="text-[11px] font-light pl-0.5 pt-0.5">
              {element.atomicNumber}
            </div>
            <div className="text-[10px] font-light pr-0.5 pt-0.5">
              {formatAtomicMass(element.atomicMass)}
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold my-0.5">
            {element.symbol}
          </div>
          <div className="text-[11px] sm:text-[12px] truncate w-full leading-tight pb-0.5 font-medium">
            {translatedElement.name}
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 shadow-xl rounded-md p-4 bg-popover text-popover-foreground border border-neutral-700"
        side="top"
        align="center"
      >
        <div className="space-y-2">
          <h3
            className="font-bold text-xl text-neutral-50 -m-4 mb-2 p-3 rounded-t-md"
            style={{ backgroundColor: categoryColor }}
          >
            {translatedElement.name} ({element.symbol}) - #
            {element.atomicNumber}
          </h3>

          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            <span className="font-semibold">
              {translateProperty("Atomic Mass")}:
            </span>
            <span>{element.atomicMass.toLocaleString()}</span>

            <span className="font-semibold">
              {translateProperty("Period")}:
            </span>
            <span>{element.period}</span>

            <span className="font-semibold">{translateProperty("Group")}:</span>
            <span>{element.group}</span>

            <span className="font-semibold">
              {translateProperty("Category")}:
            </span>
            <Badge
              style={{ backgroundColor: categoryColor }}
              className={`capitalize ${textColor} border-neutral-400`}
            >
              {translatedElement.category.replace(/-/g, " ")}
            </Badge>
          </div>

          {element.electronConfigurationSemantic && (
            <div className="text-sm">
              <p className="font-semibold mt-2">
                {translateProperty("Electron Configuration")}:
              </p>
              <p className="text-xs break-words">
                {element.electronConfigurationSemantic}
              </p>
            </div>
          )}

          {element.summary && (
            <div className="text-sm mt-2 pt-2 border-t border-border">
              <p className="font-semibold">{translateProperty("Summary")}:</p>
              <p className="text-xs">{translatedElement.summary}</p>
            </div>
          )}

          {element.discoveredBy && (
            <p className="text-xs mt-1">
              <span className="font-semibold">
                {translateProperty("Discovered By")}:
              </span>{" "}
              {element.discoveredBy}
            </p>
          )}
          <p className="text-xs mt-1">
            <span className="font-semibold">
              {translateProperty("Shells")}:
            </span>{" "}
            {element.shells.join(", ")}
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
