import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title?: React.ReactNode
  subtitle?: React.ReactNode
  /** Rendered on the right on wide screens, below the title on phones. */
  action?: React.ReactNode
  back?: { href: string; label: string }
  className?: string
}

export function PageHeader({ title, subtitle, action, back, className }: PageHeaderProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {back && (
        <Link
          href={back.href}
          className="-ml-1.5 inline-flex items-center gap-0.5 rounded-lg py-1 pr-2 pl-0.5 text-sm font-medium text-primary transition-opacity hover:opacity-70"
        >
          <ChevronLeft className="size-5" />
          {back.label}
        </Link>
      )}
      {(title || subtitle || action) && (
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
        <div className="min-w-0">
          {title && <h1 className="text-[28px] leading-tight font-bold md:text-3xl">{title}</h1>}
          {subtitle && <div className="mt-1 text-[15px] text-muted-foreground">{subtitle}</div>}
        </div>
        {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
      </div>
      )}
    </div>
  )
}
