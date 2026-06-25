import { cn } from "@/lib/utils"

const SKILL_COLORS: Record<string, string> = {
  Beginner: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  Intermediate: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  Advanced: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  Elite: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
}

export function SkillBadge({ level, className }: { level: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        SKILL_COLORS[level] ?? SKILL_COLORS.Intermediate,
        className,
      )}
    >
      {level}
    </span>
  )
}
