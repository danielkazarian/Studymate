import type React from "react"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-black">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-6 py-8 max-w-7xl">{children}</div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
