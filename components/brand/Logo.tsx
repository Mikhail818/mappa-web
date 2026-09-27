import { cn } from "@/lib/utils"

/** The Mappa mark: a map pin whose head is a football. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex size-8 shrink-0 items-center justify-center rounded-[28%] bg-gradient-to-br from-[oklch(0.62_0.16_155)] to-[oklch(0.42_0.12_160)] text-white shadow-soft",
        className,
      )}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" className="size-[62%]" fill="none">
        <path
          d="M12 2.2c-4.2 0-7.6 3.3-7.6 7.5 0 5.4 6.5 11.3 7 11.8.3.3.9.3 1.2 0 .5-.5 7-6.4 7-11.8 0-4.2-3.4-7.5-7.6-7.5Z"
          fill="currentColor"
        />
        <circle cx="12" cy="9.7" r="3.6" fill="oklch(0.45 0.12 158)" />
        <path d="m12 7.9 1.7 1.25-.65 2h-2.1l-.65-2L12 7.9Z" fill="currentColor" />
      </svg>
    </span>
  )
}

export function Logo({ className, markClassName }: { className?: string; markClassName?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-lg font-bold tracking-tight", className)}>
      <LogoMark className={markClassName} />
      Mappa
    </span>
  )
}
