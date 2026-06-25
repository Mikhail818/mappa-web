import { RegisterForm } from "@/components/auth/RegisterForm"
import { Trophy } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Create Account" }

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#07121D] to-[#172B42] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 rounded-2xl bg-primary items-center justify-center mb-4">
            <Trophy className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-white">Join Mappa</h1>
          <p className="mt-1 text-slate-400">Find players & book pitches in Cyprus</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8">
          <RegisterForm />
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
