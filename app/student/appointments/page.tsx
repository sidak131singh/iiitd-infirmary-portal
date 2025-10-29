"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, Plus } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"

interface Appointment {
  id: string
  date: string
  timeSlot: string
  reason: string
  status: string
  notes?: string
  doctor: {
    id: string
    name: string
    email: string
  }
}

export default function StudentAppointments() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("upcoming")
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState<string | null>(null)

  const fetchAppointments = async () => {
    try {
      const response = await fetch("/api/student/appointments")
      if (response.ok) {
        const result = await response.json()
        setAppointments(result.data || [])
      }
    } catch (error) {
      console.error("Failed to fetch appointments:", error)
      toast({
        title: "Error",
        description: "Failed to load appointments",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session) {
      fetchAppointments()
    }
  }, [session])

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) {
      return
    }

    setCancelling(appointmentId)

    try {
      const response = await fetch(`/api/student/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "CANCELLED" }),
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Appointment cancelled successfully",
          duration: 3000,
        })
        // Refresh appointments list
        fetchAppointments()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to cancel appointment",
          variant: "destructive",
          duration: 4000,
        })
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setCancelling(null)
    }
  }

  // Filter appointments
  const upcomingAppointments = appointments.filter(
    (apt) => 
      new Date(apt.date) >= new Date() && 
      apt.status !== "CANCELLED" && 
      apt.status !== "COMPLETED"
  )

  const pastAppointments = appointments.filter(
    (apt) => 
      new Date(apt.date) < new Date() || 
      apt.status === "COMPLETED" || 
      apt.status === "CANCELLED"
  )

  return (
    <div className="container py-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">My Appointments</h1>
            <p className="text-muted-foreground">View and manage your appointments with infirmary doctors.</p>
          </div>
          <Link href="/student/appointments/book">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" /> Book Appointment
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="upcoming" onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-4">
            {loading ? (
              <div className="grid gap-4">
                {[1, 2].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="animate-pulse flex gap-4">
                        <div className="rounded-full bg-gray-200 h-12 w-12"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : upcomingAppointments.length > 0 ? (
              <div className="grid gap-4">
                {upcomingAppointments.map((appointment) => (
                  <Card key={appointment.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="rounded-full bg-blue-100 p-3">
                            <Calendar className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">{appointment.reason}</h3>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(appointment.date), "PPP")} at {appointment.timeSlot}
                            </p>
                            <p className="text-sm font-medium mt-1">{appointment.doctor.name}</p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 md:items-end">
                          <span
                            className={`text-sm px-2 py-1 rounded-full ${
                              appointment.status === "CONFIRMED"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {appointment.status}
                          </span>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleCancelAppointment(appointment.id)}
                              disabled={cancelling === appointment.id}
                            >
                              {cancelling === appointment.id ? "Cancelling..." : "Cancel"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Clock className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium">No Upcoming Appointments</h3>
                <p className="mt-2 text-sm text-gray-500">You don't have any upcoming appointments scheduled.</p>
                <Link href="/student/appointments/book">
                  <Button className="mt-4 bg-blue-600 hover:bg-blue-700">Book an Appointment</Button>
                </Link>
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-4">
            {loading ? (
              <div className="grid gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="animate-pulse flex gap-4">
                        <div className="rounded-full bg-gray-200 h-12 w-12"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : pastAppointments.length > 0 ? (
              <div className="grid gap-4">
                {pastAppointments.map((appointment) => (
                  <Card key={appointment.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="rounded-full bg-gray-100 p-3">
                            <Calendar className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">{appointment.reason}</h3>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(appointment.date), "PPP")} at {appointment.timeSlot}
                            </p>
                            <p className="text-sm font-medium mt-1">{appointment.doctor.name}</p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 md:items-end">
                          <span 
                            className={`text-sm px-2 py-1 rounded-full ${
                              appointment.status === "COMPLETED" 
                                ? "bg-gray-100 text-gray-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {appointment.status}
                          </span>
                          {appointment.status === "COMPLETED" && (
                            <div className="flex gap-2">
                              <Link href={`/student/prescriptions?appointment=${appointment.id}`}>
                                <Button variant="outline" size="sm">
                                  View Details
                                </Button>
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Clock className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium">No Past Appointments</h3>
                <p className="mt-2 text-sm text-gray-500">You don't have any past appointment records.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
