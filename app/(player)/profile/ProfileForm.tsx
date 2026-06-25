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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { updateProfile } from "@/lib/api/profile"
import { toast } from "sonner"
import type { Profile } from "@/types/database.types"
import { SkillBadge } from "@/components/common/SkillBadge"

const CITIES = ["Nicosia", "Limassol", "Larnaca", "Paphos", "Famagusta", "Other"]
const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced", "Elite"]
const AVAILABILITY_OPTIONS = ["Mornings", "Afternoons", "Evenings", "Weekends"]

const schema = z.object({
  full_name: z.string().min(2),
  home_city: z.string().min(1),
  skill_level: z.string().min(1),
  availability: z.string().min(1),
  bio: z.string().max(300).optional(),
  playing_style: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

export function ProfileForm({ profile, userId }: { profile: Profile; userId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, setValue, watch, formState: { errors, isDirty } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: profile.full_name,
      home_city: profile.home_city,
      skill_level: profile.skill_level,
      availability: profile.availability,
      bio: profile.bio ?? "",
      playing_style: profile.playing_style ?? "",
    },
  })

  async function onSubmit(values: FormValues) {
    setLoading(true)
    try {
      await updateProfile(userId, values)
      toast.success("Profile updated!")
      router.refresh()
    } catch { toast.error("Failed to update profile") }
    finally { setLoading(false) }
  }

  const initials = profile.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()

  return (
    <div className="space-y-6">
      {/* Avatar + stats */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile.avatar_url ?? undefined} />
              <AvatarFallback className="text-2xl bg-primary/10 text-primary font-bold">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xl font-bold">{watch("full_name")}</p>
              <div className="flex items-center gap-2 mt-1">
                <SkillBadge level={watch("skill_level")} />
                <span className="text-sm text-muted-foreground">{watch("home_city")}</span>
              </div>
              <div className="flex gap-3 mt-2 text-sm text-muted-foreground">
                <span>{profile.wins}W</span>
                <span>{profile.losses}L</span>
                <span>{profile.xp} XP</span>
              </div>
            </div>
          </div>
          {profile.referral_code && (
            <div className="mt-3 p-2 bg-muted rounded-lg text-sm">
              Referral code: <span className="font-mono font-bold">{profile.referral_code}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Edit Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full name</Label>
              <Input id="full_name" {...register("full_name")} />
              {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>City</Label>
                <Select onValueChange={(v: string | null) => setValue("home_city", v ?? "", { shouldDirty: true })} defaultValue={profile.home_city}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Skill level</Label>
                <Select onValueChange={(v: string | null) => setValue("skill_level", v ?? "", { shouldDirty: true })} defaultValue={profile.skill_level}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{SKILL_LEVELS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Availability</Label>
              <Select onValueChange={(v: string | null) => setValue("availability", v ?? "", { shouldDirty: true })} defaultValue={profile.availability}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{AVAILABILITY_OPTIONS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="playing_style">Preferred position</Label>
              <Input id="playing_style" {...register("playing_style")} placeholder="e.g. Midfielder" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" rows={3} placeholder="Tell other players about yourself…" {...register("bio")} />
              {errors.bio && <p className="text-xs text-destructive">{errors.bio.message}</p>}
            </div>
            <Button type="submit" disabled={loading || !isDirty} className="w-full">
              {loading ? "Saving…" : "Save Changes"}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
