import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { Logo } from "@/components/brand/Logo"
import { cn } from "@/lib/utils"

export function PublicHeader({ signedIn = false }: { signedIn?: boolean }) {
  return (
    <header className="glass sticky top-0 z-40 border-b border-border/70">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" aria-label="Mappa home">
          <Logo markClassName="size-7" />
        </Link>
        {signedIn ? (
          <Link href="/home" className={cn(buttonVariants({ size: "sm" }), "rounded-full")}>Open app</Link>
        ) : (
          <div className="flex items-center gap-1">
            <Link href="/login" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "rounded-full")}>Sign in</Link>
            <Link href="/register" className={cn(buttonVariants({ size: "sm" }), "rounded-full")}>Get started</Link>
          </div>
        )}
      </div>
    </header>
  )
}
