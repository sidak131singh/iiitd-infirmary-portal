"use client"

import type React from "react"
import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { RoleGuard } from "@/components/auth/RoleGuard"

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    // Prevent browser back button from accessing cached pages
    const handlePopState = () => {
      if (!session) {
        router.replace("/login")
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [session, router])

  return (
    <RoleGuard allowedRoles={["STUDENT"]}>
      <div className="min-h-screen flex flex-col">
        <Header userType="student" userName={session?.user?.name || "Student"} />
        <main className="flex-1">{children}</main>
      </div>
    </RoleGuard>
  )
}
