import Link from "next/link"
import { RegisterForm } from "@/components/auth/RegisterForm"
import { AuthShell } from "@/components/auth/AuthShell"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Create account" }

export default function RegisterPage() {
  return (
    <AuthShell
      title="Join Mappa"
      subtitle="Free forever for players. Takes about a minute."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthShell>
  )
}
