import Link from "next/link"
import { cn } from "@/lib/utils"

/** Segmented control shared by the two halves of the Play tab. */
export function PlaySwitch({ active }: { active: "lobbies" | "matches" }) {
  const items = [
    { key: "lobbies", label: "Open games", href: "/lobbies" },
    { key: "matches", label: "My 1v1s", href: "/matches" },
  ] as const
  return (
    <div className="grid grid-cols-2 gap-1 rounded-2xl bg-muted p-1 sm:inline-grid sm:w-80" role="tablist">
      {items.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          role="tab"
          aria-selected={active === item.key}
          className={cn(
            "rounded-xl py-2 text-center text-sm font-semibold transition-all",
            active === item.key ? "bg-card text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {item.label}
        </Link>
      ))}
    </div>
  )
}
