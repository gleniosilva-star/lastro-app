// Símbolo oficial da marca Lastro (âncora) como SVG.
// Use color="#FFFFFF" em fundos escuros e color="#0A2540" em fundos claros.
// O anel esmeralda (#10B981) é fixo, parte da identidade.
export default function AnchorMark({ size = 48, color = "#0A2540" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none" role="img" aria-label="Lastro">
      <circle cx="28" cy="11" r="5" stroke="#10B981" strokeWidth="3" />
      <line x1="28" y1="16" x2="28" y2="45" stroke={color} strokeWidth="3" strokeLinecap="round" />
      <line x1="18" y1="21" x2="38" y2="21" stroke={color} strokeWidth="3" strokeLinecap="round" />
      <path d="M13 37 Q13 48 28 48 Q43 48 43 37" stroke={color} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
