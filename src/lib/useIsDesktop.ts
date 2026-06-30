import { useState, useEffect } from "react";

// Detecta se a tela é desktop (>= 768px), acompanhando o redimensionamento.
// Mesmo ponto de quebra usado em App.tsx.
export function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return isDesktop;
}
