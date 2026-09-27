import { cn } from "@/lib/utils"

/** A bottom-anchored action bar for phones; renders inline from `md` up unless `always` is set. */
export function StickyActionBar({
  children,
  className,
  always = false,
}: {
  children: React.ReactNode
  className?: string
  always?: boolean
}) {
  return (
    <div
      className={cn(
        "glass fixed inset-x-0 bottom-0 z-40 border-t border-border/70 pb-safe",
        !always && "md:hidden",
        className,
      )}
    >
      <div className="mx-auto flex max-w-3xl items-center gap-4 px-4 pt-3">{children}</div>
    </div>
  )
}
