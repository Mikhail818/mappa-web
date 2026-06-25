import { cn } from "@/lib/utils"

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  pending: { label: "Pending", cls: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300" },
  confirmed: { label: "Confirmed", cls: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" },
  completed: { label: "Completed", cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  cancelled: { label: "Cancelled", cls: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" },
  declined: { label: "Declined", cls: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" },
  disputed: { label: "Disputed", cls: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300" },
  requested: { label: "Requested", cls: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300" },
  open: { label: "Open", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" },
  full: { label: "Full", cls: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" },
  no_show: { label: "No Show", cls: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" },
  approved: { label: "Approved", cls: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" },
  rejected: { label: "Rejected", cls: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" },
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const { label, cls } = STATUS_MAP[status] ?? { label: status, cls: "bg-muted text-muted-foreground" }
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", cls, className)}>
      {label}
    </span>
  )
}
