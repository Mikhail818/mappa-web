"use client"

import { useRouter, usePathname } from "next/navigation"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"

const CITIES = ["Nicosia", "Limassol", "Larnaca", "Paphos", "Famagusta"]
const FORMATS = ["5v5", "6v6", "7v7", "8v8", "9v9", "11v11"]
const SURFACES = ["artificial_turf", "natural_grass", "hybrid", "indoor"]

interface Props {
  initialCity?: string
  initialFormat?: string
  initialSurface?: string
}

export function PitchFilters({ initialCity = "", initialFormat = "", initialSurface = "" }: Props) {
  const router = useRouter()
  const pathname = usePathname()

  function update(key: string, value: string) {
    const params = new URLSearchParams(window.location.search)
    if (value) params.set(key, value)
    else params.delete(key)
    router.push(`${pathname}?${params.toString()}`)
  }

  const hasFilters = initialCity || initialFormat || initialSurface

  return (
    <div className="flex flex-wrap gap-3">
      <Select value={initialCity} onValueChange={(v: string | null) => update("city", v ?? "")}>
        <SelectTrigger className="w-36">
          <SelectValue placeholder="All cities" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All cities</SelectItem>
          {CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={initialFormat} onValueChange={(v: string | null) => update("format", v ?? "")}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Any format" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Any format</SelectItem>
          {FORMATS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={initialSurface} onValueChange={(v: string | null) => update("surface", v ?? "")}>
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Any surface" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Any surface</SelectItem>
          {SURFACES.map((s) => <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>)}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={() => router.push(pathname)}>
          Clear
        </Button>
      )}
    </div>
  )
}
