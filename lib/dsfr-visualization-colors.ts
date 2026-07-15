export const dsfrVisualizationColors = [
  "#000091", // Bleu France
  "#00A95F", // Vert Émeraude
  "#A558A0", // Glycine
  "#CE614A", // Tuile
  "#C3992A", // Moutarde
] as const;

export function getDsfrCategoricalColors(values: unknown[]) {
  const categories = Array.from(
    new Set(
      values
        .map((value) => String(value ?? "").trim())
        .filter(Boolean),
    ),
  );

  if (categories.length < 2 || categories.length > dsfrVisualizationColors.length) {
    return [];
  }

  return categories.map((category, index) => ({
    category,
    color: dsfrVisualizationColors[index],
  }));
}
