"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/common/StatusBadge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { approveApplication, rejectApplication } from "@/lib/api/admin"
import { formatTimeAgo } from "@/lib/utils/format"
import { toast } from "sonner"
import { Check, X } from "lucide-react"

type Application = {
  id: string; status: string; created_at: string
  contact_name: string; contact_phone: string; contact_email: string
  business_name: string; business_type: string
  venue_name: string; venue_city: string; venue_description: string | null
  applicant: { full_name: string; email: string | null } | null
}

export function ApplicationsReview({ applications, adminId }: { applications: Application[]; adminId: string }) {
  const router = useRouter()
  const [actioning, setActioning] = useState<string | null>(null)

  async function handleApprove(id: string) {
    setActioning(id)
    try { await approveApplication(adminId, id); toast.success("Application approved"); router.refresh() }
    catch (e) { toast.error((e as Error).message) }
    finally { setActioning(null) }
  }

  async function handleReject(id: string) {
    setActioning(id)
    try { await rejectApplication(adminId, id); toast.success("Application rejected"); router.refresh() }
    catch (e) { toast.error((e as Error).message) }
    finally { setActioning(null) }
  }

  const pending = applications.filter((a) => a.status === "pending")
  const approved = applications.filter((a) => a.status === "approved")
  const rejected = applications.filter((a) => a.status === "rejected")

  function AppCard({ a, showActions }: { a: Application; showActions?: boolean }) {
    return (
      <Card>
        <CardContent className="pt-4 pb-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold">{a.venue_name}</p>
              <p className="text-sm text-muted-foreground">{a.business_name} · {a.venue_city}</p>
            </div>
            <StatusBadge status={a.status} />
          </div>
          <div className="text-sm grid grid-cols-2 gap-x-4 gap-y-1">
            <div><span className="text-muted-foreground">Contact: </span>{a.contact_name}</div>
            <div><span className="text-muted-foreground">Phone: </span>{a.contact_phone}</div>
            <div><span className="text-muted-foreground">Email: </span>{a.contact_email}</div>
            <div><span className="text-muted-foreground">Type: </span>{a.business_type}</div>
          </div>
          {a.venue_description && (
            <p className="text-xs text-muted-foreground italic">&ldquo;{a.venue_description}&rdquo;</p>
          )}
          <p className="text-xs text-muted-foreground">Submitted {formatTimeAgo(a.created_at)}</p>
          {showActions && (
            <div className="flex gap-2 pt-1">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 gap-1 border-green-500 text-green-600 hover:bg-green-50"
                disabled={actioning === a.id}
                onClick={() => handleApprove(a.id)}
              >
                <Check className="h-3 w-3" /> Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 gap-1 border-red-400 text-red-500 hover:bg-red-50"
                disabled={actioning === a.id}
                onClick={() => handleReject(a.id)}
              >
                <X className="h-3 w-3" /> Reject
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Tabs defaultValue="pending">
      <TabsList>
        <TabsTrigger value="pending">Pending {pending.length > 0 && `(${pending.length})`}</TabsTrigger>
        <TabsTrigger value="approved">Approved</TabsTrigger>
        <TabsTrigger value="rejected">Rejected</TabsTrigger>
      </TabsList>
      <div className="mt-4 space-y-3">
        <TabsContent value="pending">
          {pending.length === 0
            ? <p className="text-muted-foreground text-sm">No pending applications</p>
            : pending.map((a) => <AppCard key={a.id} a={a} showActions />)}
        </TabsContent>
        <TabsContent value="approved">
          {approved.length === 0
            ? <p className="text-muted-foreground text-sm">None</p>
            : approved.map((a) => <AppCard key={a.id} a={a} />)}
        </TabsContent>
        <TabsContent value="rejected">
          {rejected.length === 0
            ? <p className="text-muted-foreground text-sm">None</p>
            : rejected.map((a) => <AppCard key={a.id} a={a} />)}
        </TabsContent>
      </div>
    </Tabs>
  )
}
