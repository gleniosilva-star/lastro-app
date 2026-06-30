// Controle do tema claro/escuro. O tema é aplicado como atributo data-theme
// no <html>; as cores reais vivem em variáveis CSS (src/index.css).
export type ThemeMode = "light" | "dark";

export function getInitialTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem("lastro-theme");
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    /* localStorage indisponível */
  }
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyTheme(mode: ThemeMode) {
  document.documentElement.setAttribute("data-theme", mode);
  try {
    localStorage.setItem("lastro-theme", mode);
  } catch {
    /* ignora */
  }
}
