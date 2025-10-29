"use client"

import { useState, useEffect } from "react"
import { signIn, signOut, getSession, useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, LogIn } from "lucide-react"

export default function LoginPage() {
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [redirecting, setRedirecting] = useState(false)
  const router = useRouter()

  // Check if user was just logged out
  const wasLoggedOut = searchParams.get('signout') === 'true'

  // Prevent browser back/forward cache
  useEffect(() => {
    // Disable back/forward cache
    if (typeof window !== 'undefined') {
      window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
          // Page was restored from bfcache, reload it
          window.location.reload()
        }
      })

      // Prevent caching
      window.addEventListener('beforeunload', () => {
        window.scrollTo(0, 0)
      })

      // Set cache control headers via meta tags
      const metaTag = document.createElement('meta')
      metaTag.httpEquiv = 'Cache-Control'
      metaTag.content = 'no-cache, no-store, must-revalidate'
      document.head.appendChild(metaTag)

      const pragmaTag = document.createElement('meta')
      pragmaTag.httpEquiv = 'Pragma'
      pragmaTag.content = 'no-cache'
      document.head.appendChild(pragmaTag)

      const expiresTag = document.createElement('meta')
      expiresTag.httpEquiv = 'Expires'
      expiresTag.content = '0'
      document.head.appendChild(expiresTag)
    }
  }, [])

  // Force session refresh on component mount
  useEffect(() => {
    const checkSession = async () => {
      const currentSession = await getSession()
      if (currentSession && !wasLoggedOut) {
        setRedirecting(true)
        const role = currentSession.user.role
        setTimeout(() => {
          switch (role) {
            case "ADMIN":
              router.replace("/admin/dashboard")
              break
            case "DOCTOR":
              router.replace("/doctor/dashboard")
              break
            case "STUDENT":
              router.replace("/student/dashboard")
              break
            default:
              router.replace("/")
          }
        }, 500)
      }
    }

    if (status !== "loading") {
      checkSession()
    }
  }, [status, wasLoggedOut, router])

  // Additional session check for authenticated status
  useEffect(() => {
    if (status === "authenticated" && session?.user && !wasLoggedOut) {
      setRedirecting(true)
      const role = session.user.role
      setTimeout(() => {
        switch (role) {
          case "ADMIN":
            router.replace("/admin/dashboard")
            break
          case "DOCTOR":
            router.replace("/doctor/dashboard")
            break
          case "STUDENT":
            router.replace("/student/dashboard")
            break
          default:
            router.replace("/")
        }
      }, 500)
    }
  }, [session, status, router, wasLoggedOut])

  useEffect(() => {
    // Always sign out when visiting the login page
    signOut({ redirect: false })
  }, [])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Show redirecting state
  if (redirecting || (session?.user && !wasLoggedOut)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password")
      } else {
        // Get session to determine redirect path
        const session = await getSession()
        if (session?.user) {
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
              router.push("/")
          }
        }
      }
    } catch (error) {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-blue-600 p-3">
              <LogIn className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Infirmary Portal Login
          </CardTitle>
          <CardDescription className="text-center">
            IIIT Delhi - College Infirmary Management System
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@iiitd.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-sm mb-2">Demo Credentials:</h3>
            <div className="text-xs space-y-1 text-gray-600">
              <p><strong>Admin:</strong> admin@iiitd.ac.in / admin123</p>
              <p><strong>Doctor:</strong> dr.smith@iiitd.ac.in / doctor123</p>
              <p><strong>Student:</strong> john.doe@iiitd.ac.in / student123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
