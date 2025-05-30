import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import * as React from "react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a chemical formula string into JSX with proper subscripts and superscripts.
 * Examples:
 * "H_2O" -> H₂O
 * "SO_4^2-" -> SO₄²⁻
 * "C_6H_12O_6" -> C₆H₁₂O₆
 * @param formula The chemical formula string. Underscore `_` precedes a subscript, caret `^` precedes a superscript.
 * @returns A React.ReactNode with the formatted chemical formula.
 */
export function formatChemicalFormula(formula: string): React.ReactNode {
  if (!formula) return "";

  const parts: React.ReactNode[] = [];
  let currentSegment = "";
  let i = 0;

  while (i < formula.length) {
    const char = formula[i];

    if (char === '_' || char === '^') {
      if (currentSegment) {
        parts.push(currentSegment);
        currentSegment = "";
      }
      
      const type = char === '_' ? 'sub' : 'sup';
      i++; // Move past '_' or '^'
      
      let scriptContent = "";
      // Check for curly braces for multi-character scripts, e.g., H_2SO_{4} or Fe^{3+}
      if (formula[i] === '{') {
        i++; // Move past '{'
        while (i < formula.length && formula[i] !== '}') {
          scriptContent += formula[i];
          i++;
        }
        if (formula[i] === '}') {
          i++; // Move past '}'
        }
      } else {
        // Single character script or until next special char/end of string
        while (i < formula.length && formula[i] !== '_' && formula[i] !== '^') {
          scriptContent += formula[i];
          i++;
        }
      }
      
      if (scriptContent) {
        if (type === 'sub') {
          parts.push(<sub key={`sub-${parts.length}`}>{scriptContent}</sub>);
        } else {
          parts.push(<sup key={`sup-${parts.length}`}>{scriptContent}</sup>);
        }
      }
      // If we exited the inner while loop because we hit another special char,
      // the outer loop will handle it in the next iteration. So, no need to decrement i here.
      continue; 
    } else {
      currentSegment += char;
      i++;
    }
  }

  if (currentSegment) {
    parts.push(currentSegment);
  }

  return <>{parts}</>;
}
