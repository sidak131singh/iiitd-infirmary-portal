"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, LogOut, Home } from "lucide-react"

export default function UnauthorizedPage() {
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    // If no session, redirect to login
    if (!session) {
      router.push("/login")
    }
  }, [session, router])

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/login?signout=true" })
  }

  const handleGoHome = () => {
    if (session?.user?.role) {
      const role = session.user.role
      switch (role) {
        case "ADMIN":
          router.push("/admin/dashboard")
          break
        case "DOCTOR":
          router.push("/doctor/dashboard")
          break
        case "STUDENT":
          router.push("/student/dashboard")
          break
        default:
          router.push("/login")
      }
    } else {
      router.push("/login")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-red-100 p-3">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-red-800">
            Access Denied
          </CardTitle>
          <CardDescription className="text-red-600">
            You don't have permission to access this page
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-gray-600">
            <p>Your current role: <span className="font-medium">{session?.user?.role || "Unknown"}</span></p>
            <p className="mt-2">Please contact the administrator if you believe this is an error.</p>
          </div>
          
          <div className="flex flex-col gap-2">
            <Button 
              onClick={handleGoHome}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Home className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Button>
            
            <Button 
              onClick={handleSignOut}
              variant="outline"
              className="w-full"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
