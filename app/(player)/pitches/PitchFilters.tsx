"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Lightbulb, Search, Warehouse, X } from "lucide-react"
import { CITIES, FORMATS } from "@/lib/utils/pitch"
import { cn } from "@/lib/utils"

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-all active:scale-95",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-card text-foreground hover:border-foreground/30",
      )}
    >
      {children}
    </button>
  )
}

export function PitchFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [pending, startTransition] = useTransition()
  const [query, setQuery] = useState(params.get("q") ?? "")
  // Skips the debounced sync on mount and right after Reset, which already navigated.
  const skipSync = useRef(true)

  function update(changes: Record<string, string | null>) {
    const next = new URLSearchParams(params.toString())
    for (const [k, v] of Object.entries(changes)) {
      if (v) next.set(k, v)
      else next.delete(k)
    }
    const qs = next.toString()
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }))
  }

  // Debounce typing so every keystroke doesn't hit the server.
  useEffect(() => {
    if (skipSync.current) {
      skipSync.current = false
      return
    }
    const t = setTimeout(() => update({ q: query.trim() || null }), 250)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  const city = params.get("city")
  const format = params.get("format")
  const indoor = params.get("indoor") === "1"
  const lights = params.get("lights") === "1"
  const anyFilter = city || format || indoor || lights || params.get("q")

  return (
    <div className="space-y-3" data-pending={pending || undefined}>
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search pitches, venues or cities"
          aria-label="Search pitches"
          className="h-12 w-full rounded-2xl border border-input bg-card pr-10 pl-10 text-base shadow-soft outline-none transition-shadow placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="absolute top-1/2 right-3 flex size-6 -translate-y-1/2 items-center justify-center rounded-full bg-muted-foreground/20 text-muted-foreground"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none">
        <Chip active={!city} onClick={() => update({ city: null })}>All Cyprus</Chip>
        {CITIES.map((c) => (
          <Chip key={c} active={city === c} onClick={() => update({ city: city === c ? null : c })}>
            {c}
          </Chip>
        ))}
      </div>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none">
        {FORMATS.map((f) => (
          <Chip key={f} active={format === f} onClick={() => update({ format: format === f ? null : f })}>
            {f}
          </Chip>
        ))}
        <span className="mx-1 w-px shrink-0 self-stretch bg-border" aria-hidden />
        <Chip active={indoor} onClick={() => update({ indoor: indoor ? null : "1" })}>
          <Warehouse className="size-4" /> Indoor
        </Chip>
        <Chip active={lights} onClick={() => update({ lights: lights ? null : "1" })}>
          <Lightbulb className="size-4" /> Floodlit
        </Chip>
        {anyFilter && (
          <button
            type="button"
            onClick={() => {
              skipSync.current = query !== ""
              setQuery("")
              startTransition(() => router.replace(pathname, { scroll: false }))
            }}
            className="shrink-0 px-2 text-sm font-medium text-primary"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  )
}
