import type React from "react"
import { AuthRedirect } from "@/components/auth/AuthRedirect"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthRedirect>
      {children}
    </AuthRedirect>
  )
} 