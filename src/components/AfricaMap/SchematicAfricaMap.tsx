import { AFRICA_PATHS } from './africaPaths'
import './SchematicAfricaMap.css'

interface SchematicAfricaMapProps {
  activeId?: string | null
  onHover?: (id: string | null) => void
  onClick?: (id: string) => void
  dimmed?: string[] | null
}

export const SchematicAfricaMap = ({
  activeId,
  onHover,
  onClick,
  dimmed,
}: SchematicAfricaMapProps) => {
  return (
    <svg
      className="schematic-africa-map"
      viewBox="15 0 635 710"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Carte de l'Afrique"
    >
      <defs>
        <filter id="schematic-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {AFRICA_PATHS.map((c) => {
        const isActive = activeId === c.id
        const isDim = dimmed ? dimmed.includes(c.id) : false
        const cls = [isActive ? 'active' : '', isDim ? 'dim' : ''].filter(Boolean).join(' ')
        return (
          <path
            key={c.id}
            d={c.d}
            data-id={c.id}
            className={cls}
            fillRule="evenodd"
            filter={isActive ? 'url(#schematic-glow)' : undefined}
            onClick={() => onClick?.(c.id)}
            onMouseEnter={() => onHover?.(c.id)}
            onMouseLeave={() => onHover?.(null)}
          >
            <title>{c.id}</title>
          </path>
        )
      })}
    </svg>
  )
}

export { AFRICA_PATHS }
