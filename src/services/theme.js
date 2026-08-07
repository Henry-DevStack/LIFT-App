import { db } from "./storage";

// Presets de cor pra facilitar a escolha (além do seletor livre).
export const ACCENT_PRESETS = [
  { name: "Limão", hex: "#c8f751" },
  { name: "Ciano", hex: "#4fd6e8" },
  { name: "Laranja", hex: "#ff9b52" },
  { name: "Rosa", hex: "#ff6fa5" },
  { name: "Roxo", hex: "#b58bff" },
  { name: "Azul", hex: "#5b9dff" },
  { name: "Vermelho", hex: "#ff6f6f" },
  { name: "Amarelo", hex: "#ffcf5c" },
  { name: "Verde", hex: "#5cd68a" },
  { name: "Menta", hex: "#5ce8c5" },
];

// Escurece um hex em uma porcentagem (0-1), pra gerar a variante "dim"
// usada em hovers/estados ativos sem o usuário precisar escolher duas cores.
function darken(hex, amount = 0.18) {
  const n = hex.replace("#", "");
  const r = Math.round(parseInt(n.slice(0, 2), 16) * (1 - amount));
  const g = Math.round(parseInt(n.slice(2, 4), 16) * (1 - amount));
  const b = Math.round(parseInt(n.slice(4, 6), 16) * (1 - amount));
  return `#${[r, g, b].map((v) => Math.max(0, v).toString(16).padStart(2, "0")).join("")}`;
}

export function applyTheme(accentHex) {
  const accentDim = darken(accentHex);
  document.documentElement.style.setProperty("--accent", accentHex);
  document.documentElement.style.setProperty("--accent-dim", accentDim);
  return { accent: accentHex, accentDim };
}

export function initTheme() {
  const theme = db.getTheme();
  applyTheme(theme.accent);
  return theme;
}

export function setAccent(accentHex) {
  const theme = applyTheme(accentHex);
  db.saveTheme(theme);
  return theme;
}

export function getAccentColor() {
  const value = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
  return value || "#c8f751";
}
