"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, FileText, Plus, User } from "lucide-react"
import Link from "next/link"
import { RoleGuard } from "@/components/auth/RoleGuard"

interface Appointment {
  id: string
  date: string
  timeSlot: string
  reason: string
  status: string
  doctor: {
    name: string
  }
}

interface AppointmentCount {
  total: number
  pending: number
  confirmed: number
  completed: number
  cancelled: number
}

export default function StudentDashboard() {
  const { data: session } = useSession()
  const [nextAppointment, setNextAppointment] = useState<Appointment | null>(null)
  const [appointmentCount, setAppointmentCount] = useState<AppointmentCount | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch next appointment
        const nextApptResponse = await fetch("/api/student/next-appointment")
        if (nextApptResponse.ok) {
          const nextApptData = await nextApptResponse.json()
          setNextAppointment(nextApptData.data)
        }

        // Fetch appointment count
        const countResponse = await fetch("/api/student/appointments/count")
        if (countResponse.ok) {
          const countData = await countResponse.json()
          setAppointmentCount(countData.data)
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchDashboardData()
    }
  }, [session])

  return (
    <RoleGuard allowedRoles={["STUDENT"]}>
      <div className="container py-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold tracking-tight">
              Welcome, {session?.user?.name || "Student"}
            </h1>
            <p className="text-muted-foreground">
              Here's an overview of your health information and upcoming appointments.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Next Appointment</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                ) : nextAppointment ? (
                  <>
                    <div className="text-2xl font-bold">
                      {new Date(nextAppointment.date).toLocaleDateString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {nextAppointment.timeSlot} with {nextAppointment.doctor.name}
                    </p>
                    <div className="mt-4">
                      <Link href="/student/appointments">
                        <Button variant="outline" size="sm" className="w-full">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-lg font-medium text-muted-foreground">
                      No upcoming appointments
                    </div>
                    <div className="mt-4">
                      <Link href="/student/appointments/book">
                        <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                          Book Appointment
                        </Button>
                      </Link>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? (
                    <div className="animate-pulse h-8 bg-gray-200 rounded w-16"></div>
                  ) : (
                    appointmentCount?.total || 0
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {loading ? (
                    <div className="animate-pulse h-4 bg-gray-200 rounded w-32 mt-1"></div>
                  ) : appointmentCount ? (
                    `${appointmentCount.completed} completed, ${appointmentCount.pending} pending`
                  ) : (
                    "No appointments yet"
                  )}
                </p>
                <div className="mt-4">
                  <Link href="/student/appointments">
                    <Button variant="outline" size="sm" className="w-full">
                      View History
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Link href="/student/appointments/book">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      <Plus className="mr-2 h-4 w-4" /> Book Appointment
                    </Button>
                  </Link>
                  <Link href="/student/profile">
                    <Button variant="outline" size="sm" className="w-full">
                      <User className="mr-2 h-4 w-4" /> Update Profile
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Infirmary Hours</CardTitle>
                <CardDescription>When you can visit the infirmary</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Monday - Friday</span>
                    <span>8:00 AM - 8:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Saturday</span>
                    <span>9:00 AM - 5:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Sunday</span>
                    <span>Closed (Emergency Only)</span>
                  </div>
                  <div className="mt-4 rounded-lg bg-blue-50 p-3 text-sm">
                    <p className="font-medium text-blue-800">Emergency Contact</p>
                    <p className="text-blue-700">+91 98765 43210</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </RoleGuard>
  )
}
