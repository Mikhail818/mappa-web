"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { ChevronLeft, ChevronRight, Check } from "lucide-react"
import { cn } from "@/lib/utils"

const BUSINESS_TYPES = [
  { value: "private_club", label: "Private Club" },
  { value: "public_facility", label: "Public Facility" },
  { value: "municipality", label: "Municipality" },
  { value: "other", label: "Other" },
]

const schema = z.object({
  contact_name: z.string().min(2),
  contact_phone: z.string().min(8),
  contact_email: z.string().email(),
  business_name: z.string().min(2),
  business_type: z.string().min(1),
  venue_name: z.string().min(2),
  venue_city: z.string().min(1),
  venue_address: z.string().optional(),
  venue_description: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

const STEPS = ["Personal Info", "Business Info", "Venue Details", "Review"]

export function ApplyOwnerForm({ userId, profile }: {
  userId: string
  profile: { full_name: string; email: string | null } | null
}) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, setValue, watch, trigger, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      contact_name: profile?.full_name ?? "",
      contact_email: profile?.email ?? "",
    },
  })

  async function nextStep() {
    const fields: (keyof FormValues)[][] = [
      ["contact_name", "contact_phone", "contact_email"],
      ["business_name", "business_type"],
      ["venue_name", "venue_city"],
    ]
    const valid = await trigger(fields[step])
    if (valid) setStep((s) => s + 1)
  }

  async function onSubmit(values: FormValues) {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from("venue_owner_applications").insert({
      user_id: userId, ...values,
    })
    setLoading(false)
    if (error) { toast.error(error.message); return }
    toast.success("Application submitted! We'll be in touch.")
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center gap-1 flex-1">
            <div className={cn(
              "h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
              i < step ? "bg-primary text-primary-foreground" : i === step ? "bg-primary text-primary-foreground ring-2 ring-primary/30" : "bg-muted text-muted-foreground",
            )}>
              {i < step ? <Check className="h-3 w-3" /> : i + 1}
            </div>
            <span className={cn("text-xs hidden sm:block truncate", i === step ? "font-medium" : "text-muted-foreground")}>{label}</span>
            {i < STEPS.length - 1 && <div className={cn("flex-1 h-px", i < step ? "bg-primary" : "bg-muted")} />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardContent className="pt-6 space-y-4">
            {step === 0 && (
              <>
                <h2 className="font-semibold">Personal Info</h2>
                <div className="space-y-2"><Label>Full name</Label><Input {...register("contact_name")} />{errors.contact_name && <p className="text-xs text-destructive">{errors.contact_name.message}</p>}</div>
                <div className="space-y-2"><Label>Phone</Label><Input type="tel" {...register("contact_phone")} placeholder="+357 99 000000" />{errors.contact_phone && <p className="text-xs text-destructive">{errors.contact_phone.message}</p>}</div>
                <div className="space-y-2"><Label>Email</Label><Input type="email" {...register("contact_email")} />{errors.contact_email && <p className="text-xs text-destructive">{errors.contact_email.message}</p>}</div>
              </>
            )}
            {step === 1 && (
              <>
                <h2 className="font-semibold">Business Info</h2>
                <div className="space-y-2"><Label>Business name</Label><Input {...register("business_name")} />{errors.business_name && <p className="text-xs text-destructive">{errors.business_name.message}</p>}</div>
                <div className="space-y-2">
                  <Label>Business type</Label>
                  <Select onValueChange={(v: string | null) => setValue("business_type", v ?? "")}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>{BUSINESS_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                  </Select>
                  {errors.business_type && <p className="text-xs text-destructive">{errors.business_type.message}</p>}
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <h2 className="font-semibold">Venue Details</h2>
                <div className="space-y-2"><Label>Venue name</Label><Input {...register("venue_name")} />{errors.venue_name && <p className="text-xs text-destructive">{errors.venue_name.message}</p>}</div>
                <div className="space-y-2"><Label>City</Label><Input {...register("venue_city")} />{errors.venue_city && <p className="text-xs text-destructive">{errors.venue_city.message}</p>}</div>
                <div className="space-y-2"><Label>Address (optional)</Label><Input {...register("venue_address")} /></div>
                <div className="space-y-2"><Label>Description (optional)</Label><Textarea rows={3} {...register("venue_description")} /></div>
              </>
            )}
            {step === 3 && (
              <div className="space-y-3 text-sm">
                <h2 className="font-semibold">Review & Submit</h2>
                {Object.entries(watch()).map(([k, v]) => v ? (
                  <div key={k} className="flex justify-between">
                    <span className="text-muted-foreground capitalize">{k.replace(/_/g, " ")}</span>
                    <span className="text-right max-w-[60%] truncate">{String(v)}</span>
                  </div>
                ) : null)}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              {step > 0 && (
                <Button type="button" variant="outline" className="flex-1 gap-2" onClick={() => setStep((s) => s - 1)}>
                  <ChevronLeft className="h-4 w-4" /> Back
                </Button>
              )}
              {step < 3 ? (
                <Button type="button" className="flex-1 gap-2" onClick={nextStep}>
                  Continue <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? "Submitting…" : "Submit Application"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
