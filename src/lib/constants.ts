// src/lib/constants.ts
export const CATEGORY_COLORS: Record<string, string> = {
  "diatomic-nonmetal": "hsl(205, 65%, 50%)",    // Blue (matches "Phi kim")
  "polyatomic-nonmetal": "hsl(205, 65%, 50%)",  // Blue (matches "Phi kim")
  "noble-gas": "hsl(330, 60%, 55%)",            // Magenta/Dark Pink (matches "Khí hiếm")
  "alkali-metal": "hsl(170, 60%, 45%)",         // Teal (matches "Kim loại kiềm")
  "alkaline-earth-metal": "hsl(25, 60%, 50%)", // Reddish-Orange (matches "Kim loại kiềm thổ")
  "metalloid": "hsl(70, 35%, 45%)",             // Olive/Dark Yellow (matches "Á kim")
  "lanthanide": "hsl(190, 70%, 50%)",           // Medium Blue (matches "Lantan")
  "actinide": "hsl(35, 55%, 55%)",              // Orange-Brown (matches "Actini")
  "transition-metal": "hsl(255, 45%, 50%)",     // Purple-Blue (matches "Kim loại chuyển tiếp")
  "post-transition-metal": "hsl(120, 40%, 40%)",// Green (matches "Kim loại hậu chuyển tiếp")
  
  // Unknown categories matching the dark gray from image
  "unknown": "hsl(0, 0%, 30%)",
  "unknown-properties": "hsl(0, 0%, 30%)",       // Darker Gray (matches "Đặc tính không xác định")
  "unknown, probably metalloid": "hsl(70, 25%, 35%)", // Darker Olive
  "unknown, probably transition metal": "hsl(255, 30%, 40%)", // Darker Purple-Blue
  "unknown, probably post-transition metal": "hsl(120, 30%, 30%)", // Darker Green
  "unknown, predicted to be noble gas": "hsl(330, 40%, 45%)", // Darker Magenta
  "unknown, but predicted to be an alkali metal": "hsl(170, 40%, 35%)" // Darker Teal
};

export function getCategoryColor(category: string): string {
  const normalizedCategory = category.toLowerCase().trim();
  return CATEGORY_COLORS[normalizedCategory] || CATEGORY_COLORS["unknown-properties"];
}
