"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import Link from "next/link"
import { Trophy, ArrowLeft } from "lucide-react"

const schema = z.object({ email: z.string().email("Enter a valid email") })
type FormValues = z.infer<typeof schema>

export default function ResetPasswordPage() {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(values: FormValues) {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    })
    setLoading(false)
    if (error) { toast.error(error.message); return }
    setSent(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#07121D] to-[#172B42] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 rounded-2xl bg-primary items-center justify-center mb-4">
            <Trophy className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-white">Reset password</h1>
          <p className="mt-1 text-slate-400">We&apos;ll email you a reset link</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8">
          {sent ? (
            <div className="text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="font-medium">Check your email</p>
              <p className="text-sm text-muted-foreground">We&apos;ve sent a password reset link. It may take a minute to arrive.</p>
              <Link href="/login" className="block text-sm text-primary hover:underline">Back to sign in</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending…" : "Send reset link"}
              </Button>
              <Link href="/login" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground justify-center">
                <ArrowLeft className="h-3 w-3" /> Back to sign in
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
