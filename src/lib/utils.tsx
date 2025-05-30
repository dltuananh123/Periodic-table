
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import * as React from "react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a chemical formula string into JSX with proper subscripts and superscripts.
 * Examples:
 * "H_2O" -> H₂O
 * "SO_4^2-" -> SO₄²⁻
 * "C_6H_12O_6" -> C₆H₁₂O₆
 * "Fe_2(SO_4)_3" -> Fe₂(SO₄)₃
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
        // Handle unbraced script content
        while (i < formula.length) {
          const nextChar = formula[i];
          // Stop conditions for unbraced scripts
          if (nextChar === '_' || nextChar === '^' || nextChar === ' ' || nextChar === '(' || nextChar === ')') {
            break;
          }

          if (type === 'sub') {
            if (nextChar >= '0' && nextChar <= '9') { // Unbraced subscripts are only digits
              scriptContent += nextChar;
              i++;
            } else {
              break; // Not a digit, so stop subscript parsing for this segment
            }
          } else { // type === 'sup'
            // Unbraced superscripts can be more varied (digits, +, -)
            // This will take characters until a stop condition is met
            scriptContent += nextChar;
            i++;
          }
        }
      }
      
      if (scriptContent) {
        if (type === 'sub') {
          parts.push(<sub key={`sub-${parts.length}-${scriptContent}`}>{scriptContent}</sub>);
        } else {
          parts.push(<sup key={`sup-${parts.length}-${scriptContent}`}>{scriptContent}</sup>);
        }
      }
      continue; 
    } else {
      currentSegment += char;
      i++;
    }
  }

  if (currentSegment) {
    parts.push(currentSegment);
  }

  // If the formula was empty or only contained formatting characters that resulted in no actual content
  if (parts.length === 0 && formula.trim().length > 0 && !formula.match(/[a-zA-Z0-9()]/)) {
     return formula; // Return original if it's just symbols like "->" or "=> X" but parts is empty
  }
  if (parts.length === 0 && !formula) return null;
  if (parts.length === 0 && formula) return formula;


  return <>{parts.map((part, index) => <React.Fragment key={index}>{part}</React.Fragment>)}</>;
}
