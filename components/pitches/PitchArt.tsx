import { cn } from "@/lib/utils"

interface PitchArtProps {
  /** Any stable id — varies the angle slightly so a grid of cards isn't uniform. */
  seed?: string
  surface?: string
  indoor?: boolean
  className?: string
  /** Fainter markings for when text sits on top. */
  subtle?: boolean
  children?: React.ReactNode
}

const PALETTES = {
  grass: ["oklch(0.58 0.15 145)", "oklch(0.47 0.13 150)"],
  turf: ["oklch(0.6 0.16 158)", "oklch(0.45 0.12 162)"],
  indoor: ["oklch(0.5 0.1 200)", "oklch(0.36 0.08 230)"],
} as const

function hash(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

/** Top-down pitch illustration used where venues have no photos. */
export function PitchArt({ seed = "", surface, indoor, className, subtle, children }: PitchArtProps) {
  const palette = indoor || surface === "indoor" ? PALETTES.indoor : surface === "natural_grass" ? PALETTES.grass : PALETTES.turf
  const tilt = (hash(seed) % 7) - 3

  return (
    <div
      className={cn("relative isolate overflow-hidden", className)}
      style={{ background: `linear-gradient(160deg, ${palette[0]}, ${palette[1]})` }}
    >
      <svg
        viewBox="0 0 400 240"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 -z-10 size-full"
        style={{ transform: `rotate(${tilt}deg) scale(1.12)` }}
        aria-hidden
      >
        {Array.from({ length: 10 }).map((_, i) => (
          <rect key={i} x={i * 40} y="0" width="20" height="240" fill="white" opacity="0.045" />
        ))}
        <g fill="none" stroke="white" strokeOpacity={subtle ? 0.2 : 0.55} strokeWidth="2.5">
          <rect x="24" y="20" width="352" height="200" rx="2" />
          <line x1="200" y1="20" x2="200" y2="220" />
          <circle cx="200" cy="120" r="34" />
          <rect x="24" y="68" width="52" height="104" />
          <rect x="324" y="68" width="52" height="104" />
          <rect x="24" y="96" width="18" height="48" />
          <rect x="358" y="96" width="18" height="48" />
        </g>
        <circle cx="200" cy="120" r="3.5" fill="white" fillOpacity={subtle ? 0.3 : 0.7} />
      </svg>
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/35 via-transparent to-white/5" />
      {children}
    </div>
  )
}
