"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { completeOnboarding } from "@/lib/api/profile"
import { toast } from "sonner"
import type { Profile } from "@/types/database.types"
import { Trophy, ChevronRight, ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"

const CITIES = ["Nicosia", "Limassol", "Larnaca", "Paphos", "Famagusta", "Other"]
const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced", "Elite"]
const POSITIONS = ["Goalkeeper", "Defender", "Midfielder", "Forward", "Any position"]
const AVAILABILITY_OPTIONS = ["Mornings", "Afternoons", "Evenings", "Weekends"]

const step1Schema = z.object({
  full_name: z.string().min(2, "Enter your full name"),
  home_city: z.string().min(1, "Select your city"),
})
const step2Schema = z.object({
  skill_level: z.string().min(1, "Select your skill level"),
  playing_style: z.string().optional(),
})
const step3Schema = z.object({
  availability: z.string().min(1, "Select availability"),
})

type Step1 = z.infer<typeof step1Schema>
type Step2 = z.infer<typeof step2Schema>
type Step3 = z.infer<typeof step3Schema>

const STEPS = ["Your info", "Skill & style", "Availability"]

interface Props {
  userId: string
  initialProfile: Profile | null
}

export function OnboardingFlow({ userId, initialProfile }: Props) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [data, setData] = useState<Partial<Profile>>({})
  const [saving, setSaving] = useState(false)

  const form1 = useForm<Step1>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      full_name: initialProfile?.full_name ?? "",
      home_city: initialProfile?.home_city ?? "",
    },
  })
  const form2 = useForm<Step2>({
    resolver: zodResolver(step2Schema),
    defaultValues: { skill_level: initialProfile?.skill_level ?? "" },
  })
  const form3 = useForm<Step3>({
    resolver: zodResolver(step3Schema),
    defaultValues: { availability: initialProfile?.availability ?? "" },
  })

  async function handleStep1(values: Step1) {
    setData((d) => ({ ...d, ...values }))
    setStep(1)
  }

  async function handleStep2(values: Step2) {
    setData((d) => ({ ...d, ...values }))
    setStep(2)
  }

  async function handleStep3(values: Step3) {
    const final = { ...data, ...values }
    setSaving(true)
    try {
      await completeOnboarding(userId, final)
      toast.success("Profile set up! Welcome to Mappa.")
      router.push("/home")
      router.refresh()
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#07121D] to-[#172B42] px-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 rounded-2xl bg-primary items-center justify-center mb-4">
            <Trophy className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-white">Set up your profile</h1>
          <p className="mt-1 text-slate-400">Just 3 quick steps</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-6 justify-center">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className={cn(
                  "h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                  i < step
                    ? "bg-primary text-primary-foreground"
                    : i === step
                      ? "bg-primary text-primary-foreground ring-2 ring-white/50"
                      : "bg-white/20 text-white/50",
                )}
              >
                {i < step ? "✓" : i + 1}
              </div>
              <span className={cn("text-sm hidden sm:block", i === step ? "text-white font-medium" : "text-white/50")}>
                {label}
              </span>
              {i < STEPS.length - 1 && (
                <div className={cn("h-px w-6 sm:w-10 mx-1", i < step ? "bg-primary" : "bg-white/20")} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8">
          {step === 0 && (
            <form onSubmit={form1.handleSubmit(handleStep1)} className="space-y-5">
              <h2 className="text-xl font-semibold">About you</h2>
              <div className="space-y-2">
                <Label htmlFor="full_name">Full name</Label>
                <Input id="full_name" placeholder="Alex Papadopoulos" {...form1.register("full_name")} />
                {form1.formState.errors.full_name && (
                  <p className="text-xs text-destructive">{form1.formState.errors.full_name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>City</Label>
                <Select
                  onValueChange={(v: string | null) => form1.setValue("home_city", v ?? "")}
                  defaultValue={form1.getValues("home_city")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Where do you play?" />
                  </SelectTrigger>
                  <SelectContent>
                    {CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                {form1.formState.errors.home_city && (
                  <p className="text-xs text-destructive">{form1.formState.errors.home_city.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full gap-2">
                Continue <ChevronRight className="h-4 w-4" />
              </Button>
            </form>
          )}

          {step === 1 && (
            <form onSubmit={form2.handleSubmit(handleStep2)} className="space-y-5">
              <h2 className="text-xl font-semibold">Your game</h2>
              <div className="space-y-2">
                <Label>Skill level</Label>
                <div className="grid grid-cols-2 gap-2">
                  {SKILL_LEVELS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => form2.setValue("skill_level", s)}
                      className={cn(
                        "border rounded-lg p-3 text-sm font-medium text-left transition-colors",
                        form2.watch("skill_level") === s
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50",
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                {form2.formState.errors.skill_level && (
                  <p className="text-xs text-destructive">{form2.formState.errors.skill_level.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Preferred position (optional)</Label>
                <Select onValueChange={(v: string | null) => form2.setValue("playing_style", v ?? "")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    {POSITIONS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1 gap-2" onClick={() => setStep(0)}>
                  <ChevronLeft className="h-4 w-4" /> Back
                </Button>
                <Button type="submit" className="flex-1 gap-2">
                  Continue <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={form3.handleSubmit(handleStep3)} className="space-y-5">
              <h2 className="text-xl font-semibold">When do you play?</h2>
              <div className="space-y-2">
                <Label>Typical availability</Label>
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABILITY_OPTIONS.map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => form3.setValue("availability", a)}
                      className={cn(
                        "border rounded-lg p-3 text-sm font-medium text-left transition-colors",
                        form3.watch("availability") === a
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50",
                      )}
                    >
                      {a}
                    </button>
                  ))}
                </div>
                {form3.formState.errors.availability && (
                  <p className="text-xs text-destructive">{form3.formState.errors.availability.message}</p>
                )}
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1 gap-2" onClick={() => setStep(1)}>
                  <ChevronLeft className="h-4 w-4" /> Back
                </Button>
                <Button type="submit" className="flex-1" disabled={saving}>
                  {saving ? "Setting up…" : "Finish & play! 🎉"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
