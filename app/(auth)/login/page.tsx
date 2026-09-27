import { Suspense } from "react"
import Link from "next/link"
import { LoginForm } from "@/components/auth/LoginForm"
import { AuthShell } from "@/components/auth/AuthShell"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Sign in" }

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to book pitches and join games."
      footer={
        <>
          New to Mappa?{" "}
          <Link href="/register" className="font-semibold text-primary hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthShell>
  )
}
