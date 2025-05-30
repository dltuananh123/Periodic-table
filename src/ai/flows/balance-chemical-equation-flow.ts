"use server";
/**
 * @fileOverview A chemical equation balancing and analysis AI agent.
 *
 * - balanceChemicalEquation - A function that handles the chemical equation balancing/analysis process.
 * - BalanceEquationInput - The input type for the balanceChemicalEquation function.
 * - BalanceEquationOutput - The return type for the balanceChemicalEquation function.
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";

const BalanceEquationInputSchema = z.object({
  unbalancedEquation: z
    .string()
    .min(1, "Equation cannot be empty.")
    .describe(
      "The chemical equation to be analyzed or balanced. Examples: 'H_2 + O_2 -> H_2O', 'Fe + Cl_2 = FeCl_3', 'AgNO_3 + NaCl -> AgCl + NaNO_3', 'Water + Stone -> Gold'. Use underscore for subscripts."
    ),
  language: z
    .enum(["en", "vi"])
    .describe(
      "The language to use for the response (en for English, vi for Vietnamese)"
    ),
});
export type BalanceEquationInput = z.infer<typeof BalanceEquationInputSchema>;

const BalanceEquationOutputSchema = z.object({
  reactionOccurs: z
    .boolean()
    .describe(
      "Whether the input describes a chemical reaction that can reasonably occur (possibly after balancing)."
    ),
  balancedEquation: z
    .string()
    .optional()
    .describe(
      "The balanced chemical equation if the reaction occurs. Coefficients should be integers (omit if 1). Use '->' or '=' as separator. Format subscripts like H_2O."
    ),
  explanation: z
    .string()
    .describe(
      "If reactionOccurs is false, this explains why the reaction doesn't occur or is not valid. If reactionOccurs is true, this can be an optional, very brief high-level summary of the reaction type or significance (NOT balancing steps). This should be in the tone of a high school chemistry teacher."
    ),
  reactants: z
    .array(z.string())
    .optional()
    .describe(
      "List of reactant formulas, formatted with underscores for subscripts (e.g., 'H_2', 'O_2'). Only if reactionOccurs is true."
    ),
  products: z
    .array(z.string())
    .optional()
    .describe(
      "List of product formulas, formatted with underscores for subscripts (e.g., 'H_2O'). Only if reactionOccurs is true."
    ),
  reactionConditions: z
    .string()
    .optional()
    .describe(
      "If reactionOccurs is true, describe typical conditions for the reaction considering Temperature, Pressure, Catalyst, and Other specific conditions. Format as a multi-line string or clearly delineated. E.g., 'Nhiệt độ: 25°C (thường)\\nÁp suất: 1 atm (thường)\\nChất xúc tác: không cần\\nĐiều kiện khác: Cần tia lửa'. Use 'thường' for standard/room conditions if no specific value is critical. Use 'không cần' for catalysts if none are specifically required. Use 'không' for 'Điều kiện khác' if none. Only if reactionOccurs is true and conditions are known/relevant."
    ),
  noReactionDisplay: z
    .string()
    .optional()
    .describe(
      "Formatted string like 'INPUT_EQUATION => X'. Only if reactionOccurs is false. Ensure INPUT_EQUATION part also uses underscore for subscripts."
    ),
  errorMessage: z
    .string()
    .optional()
    .describe(
      "Error message if AI processing failed for reasons other than the reaction itself not occurring (e.g., API key issue, service error)."
    ),
});
export type BalanceEquationOutput = z.infer<typeof BalanceEquationOutputSchema>;

export async function balanceChemicalEquation(
  input: BalanceEquationInput
): Promise<BalanceEquationOutput> {
  try {
    const result = await balanceEquationFlow(input);
    return result;
  } catch (error) {
    console.error("Error in balanceChemicalEquation flow:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred during processing.";
    let specificExplanation =
      "The chemical equation could not be processed due to an internal error or an issue with the AI model.";

    if (
      errorMessage.includes("API_KEY") ||
      errorMessage.includes("FAILED_PRECONDITION") ||
      errorMessage.includes("permission")
    ) {
      specificExplanation = `The AI service could not be reached. This is often due to a missing, invalid, or improperly restricted API key. 
      Please ensure your GEMINI_API_KEY environment variable is correctly set up and has the necessary permissions. 
      You can typically set this in a .env.local file in your project root.
      Error details: ${errorMessage}`;
    } else if (
      errorMessage.includes("AI model returned an empty or invalid response")
    ) {
      specificExplanation = `The AI model provided an unexpected response. This might be a temporary issue with the model or the query. Please try again. Details: ${errorMessage}`;
    }

    return {
      reactionOccurs: false,
      explanation: specificExplanation,
      errorMessage: errorMessage,
    };
  }
}

const prompt = ai.definePrompt({
  name: "balanceChemicalEquationPrompt",
  input: { schema: BalanceEquationInputSchema },
  output: { schema: BalanceEquationOutputSchema },
  system:
    "You are a friendly and helpful high school chemistry teacher. Explain concepts clearly and simply, using language a student would understand. Avoid overly technical jargon unless necessary, and if so, explain it briefly. When providing chemical formulas, always use underscores for subscripts (e.g., H_2O, Fe_2(SO_4)_3). Respond in the language specified by the user (English or Vietnamese).",
  prompt: `Analyze the input chemical equation: '{{{unbalancedEquation}}}'
Language: {{{language}}}

Follow these instructions precisely:

1.  Determine if the input describes a chemical reaction that can reasonably occur and be balanced or analyzed.
    *   If it's a valid chemical reaction that can proceed (even if it needs balancing):
        *   Set 'reactionOccurs' to true.
        *   Balance the equation. Provide the balanced equation in the 'balancedEquation' field. Use integer coefficients; omit if 1.
        *   In the 'explanation' field, provide a very brief, one-sentence high-level summary of the reaction in the specified language.
        *   For 'reactionConditions', always consider and report on the following four aspects in the specified language:
            *   **Temperature:** (e.g., "Temperature: 25°C", "Temperature: 1000 K", "Temperature: standard" if it occurs at room temperature)
            *   **Pressure:** (e.g., "Pressure: 1 atm", "Pressure: 200 bar", "Pressure: standard" if it occurs at standard atmospheric pressure)
            *   **Catalyst:** (e.g., "Catalyst: Pt", "Catalyst: concentrated H_2SO_4", "Catalyst: not required" if no specific catalyst is needed)
            *   **Other conditions:** (e.g., "Other conditions: UV light required", "Other conditions: stirring needed", "Other conditions: none" if no other specific conditions are needed)
            *   Format these conditions clearly, possibly as a multi-line string or a well-delineated single string. Only provide this field if conditions are known or generally applicable.
        *   List the individual reactant formulas in the 'reactants' array and product formulas in the 'products' array.
        *   Do NOT populate the 'noReactionDisplay' field.
    *   If the input string does NOT describe a chemical reaction that can reasonably occur:
        *   Set 'reactionOccurs' to false.
        *   Set the 'noReactionDisplay' field to a string formatted exactly as: '{{{unbalancedEquation}}} => X'. Ensure the '{{{unbalancedEquation}}}' part here also uses underscore notation for any subscripts if present in the original input.
        *   In the 'explanation' field, clearly explain *why* this reaction does not occur or is not valid from a chemical perspective in the specified language.
        *   Do NOT provide 'balancedEquation', 'reactants', 'products', or 'reactionConditions'.

2.  For ALL chemical formulas you output (in 'balancedEquation', 'reactants', 'products', and the equation part of 'noReactionDisplay'), YOU MUST use underscores for subscripts (e.g., H_2O, Fe_2(SO_4)_3, C_6H_12O_6). Do not use actual subscript characters.

Example Input 1 (English): 'H_2 + O_2 -> H_2O', language: 'en'
Expected Output 1 (JSON object for a successful reaction):
{
  "reactionOccurs": true,
  "balancedEquation": "2H_2 + O_2 -> 2H_2O",
  "explanation": "This reaction forms water from hydrogen and oxygen gases.",
  "reactants": ["H_2", "O_2"],
  "products": ["H_2O"],
  "reactionConditions": "Temperature: standard\nPressure: standard\nCatalyst: not required\nOther conditions: Requires spark or heat to initiate."
}

Example Input 2 (Vietnamese): 'Fe + O_2 -> Fe_2O_3', language: 'vi'
Expected Output 2 (JSON object for a successful reaction):
{
  "reactionOccurs": true,
  "balancedEquation": "4Fe + 3O_2 -> 2Fe_2O_3",
  "explanation": "Đây là phản ứng hình thành rỉ sét (sắt(III) oxit).",
  "reactants": ["Fe", "O_2"],
  "products": ["Fe_2O_3"],
  "reactionConditions": "Nhiệt độ: thường\nÁp suất: thường\nChất xúc tác: không cần\nĐiều kiện khác: Xảy ra khi có sự hiện diện của không khí ẩm (oxy và hơi nước)."
}

Example Input 3 (English): 'Gold + Water -> Hydrogen', language: 'en'
Expected Output 3 (JSON object for a non-reaction):
{
  "reactionOccurs": false,
  "noReactionDisplay": "Gold + Water -> Hydrogen => X",
  "explanation": "Gold is a very unreactive metal and does not react with water to produce hydrogen under normal conditions. This reaction is not chemically feasible without extreme conditions not typically considered in basic chemistry."
}

Example Input 4 (Vietnamese): 'Vàng + Nước -> Hydro', language: 'vi'
Expected Output 4 (JSON object for a non-reaction):
{
  "reactionOccurs": false,
  "noReactionDisplay": "Vàng + Nước -> Hydro => X",
  "explanation": "Vàng là một kim loại rất trơ và không phản ứng với nước để tạo ra khí hydro trong điều kiện bình thường. Phản ứng này không khả thi về mặt hóa học nếu không có các điều kiện cực đoan không thường được xem xét trong hóa học cơ bản."
}

Provide your response as a valid JSON object conforming to the defined output schema.
`,
});

const balanceEquationFlow = ai.defineFlow(
  {
    name: "balanceEquationFlow",
    inputSchema: BalanceEquationInputSchema,
    outputSchema: BalanceEquationOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error(
        "AI model returned an empty or invalid response that does not match the expected schema."
      );
    }
    return output;
  }
);
