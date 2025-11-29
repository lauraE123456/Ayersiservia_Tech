export const colorMap = {
  Bajo: "success", // verde
  Medio: "warning", // amarillo
  Alto: "warning", // naranja no existe, warning es lo más cercano
  "Muy Alto": "error", // rojo
  Crítico: "error", // rojo fuerte
};
//riesgo churn score
export const getChurnColor = (score: any) => {
  // 1. Rango Crítico y Muy Alto (81 - 100) -> ROJO
  if (score > 80) return "error";

  // 2. Rango Alto (61 - 80) -> NARANJA (Warning suele ser naranja en Material UI)
  if (score > 60) return "warning";

  // 3. Rango Medio (31 - 60) -> AMARILLO (O "info" si quieres otro tono)
  // Nota: Si usas Material UI, "warning" cubre amarillo/naranja.
  if (score > 30) return "warning";

  // 4. Rango Bajo (0 - 30) -> VERDE
  return "success";
};
