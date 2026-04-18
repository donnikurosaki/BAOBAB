interface GlyphProps {
  className?: string
  stroke?: string
  size?: number
}

export const BaobabGlyph = ({ className, stroke = 'rgba(212,175,55,0.55)', size = 140 }: GlyphProps) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    stroke={stroke}
    strokeWidth="1.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M50 85 L50 55" />
    <path d="M50 55 C 35 52, 25 40, 20 28" />
    <path d="M50 55 C 65 52, 75 40, 80 28" />
    <path d="M50 58 C 44 45, 36 38, 28 35" />
    <path d="M50 58 C 56 45, 64 38, 72 35" />
    <ellipse cx="20" cy="25" rx="10" ry="6" />
    <ellipse cx="80" cy="25" rx="10" ry="6" />
    <ellipse cx="28" cy="32" rx="8" ry="5" />
    <ellipse cx="72" cy="32" rx="8" ry="5" />
    <path d="M30 85 Q 50 82, 70 85" strokeDasharray="2 3" />
  </svg>
)

export const InstrumentGlyph = ({ className, stroke = 'rgba(212,175,55,0.6)', size = 140 }: GlyphProps) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    stroke={stroke}
    strokeWidth="1"
    aria-hidden="true"
  >
    <circle cx="50" cy="60" r="26" />
    <path d="M50 34 L50 14 M46 18 L54 18 M46 22 L54 22" />
    <path d="M38 50 L62 50 M38 58 L62 58 M38 66 L62 66" />
  </svg>
)
