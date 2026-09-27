import Link from "next/link"
import { LogoMark } from "@/components/brand/Logo"

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div className="pointer-events-none absolute inset-x-0 -top-48 h-[520px] bg-[radial-gradient(ellipse_at_center,oklch(0.7_0.16_155/0.22),transparent_65%)]" />
      <div className="relative w-full max-w-[400px]">
        <div className="mb-8 text-center">
          <Link href="/" aria-label="Mappa home" className="inline-block">
            <LogoMark className="size-14 rounded-2xl shadow-lift" />
          </Link>
          <h1 className="mt-5 text-3xl font-bold">{title}</h1>
          <p className="mt-1.5 text-muted-foreground">{subtitle}</p>
        </div>
        <div className="rounded-3xl bg-card p-6 shadow-lift ring-1 ring-foreground/[0.06] sm:p-8">{children}</div>
        {footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
      </div>
    </div>
  )
}
