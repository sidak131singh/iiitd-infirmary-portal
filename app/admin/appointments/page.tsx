"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, Stethoscope, Clock, CheckCircle } from "lucide-react"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"

interface Appointment {
  id: string
  date: string
  timeSlot: string
  reason: string
  status: string
  notes?: string
  student: {
    id: string
    name: string
    email: string
    studentId: string
  }
  doctor: {
    id: string
    name: string
    email: string
  }
}

export default function AdminAppointments() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [confirming, setConfirming] = useState<string | null>(null)

  const fetchAppointments = async () => {
    try {
      const response = await fetch("/api/admin/appointments?filter=upcoming")
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

  const handleConfirmAppointment = async (appointmentId: string) => {
    setConfirming(appointmentId)

    try {
      const response = await fetch(`/api/admin/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "CONFIRMED" }),
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Appointment confirmed successfully",
          duration: 3000,
        })
        // Refresh appointments list
        fetchAppointments()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to confirm appointment",
          variant: "destructive",
          duration: 4000,
        })
      }
    } catch (error) {
      console.error("Error confirming appointment:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setConfirming(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { color: "bg-yellow-100 text-yellow-700", label: "Pending" },
      CONFIRMED: { color: "bg-green-100 text-green-700", label: "Confirmed" },
      COMPLETED: { color: "bg-gray-100 text-gray-700", label: "Completed" },
      CANCELLED: { color: "bg-red-100 text-red-700", label: "Cancelled" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING

    return (
      <Badge className={`${config.color} border-0`}>
        {config.label}
      </Badge>
    )
  }

  return (
    <div className="container py-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Appointments</h1>
            <p className="text-muted-foreground">
              Manage and confirm student appointments with doctors
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            {appointments.length} upcoming/current appointments
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4">
            {[1, 2, 3, 4].map((i) => (
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
        ) : appointments.length > 0 ? (
          <div className="grid gap-3">
            {appointments.map((appointment) => (
              <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    {/* Left side - Info */}
                    <div className="flex-1 flex flex-wrap items-center gap-x-6 gap-y-2">
                      {/* Student Info */}
                      <div className="flex items-center gap-2">
                        <div className="rounded-full bg-blue-100 p-1.5">
                          <User className="h-3.5 w-3.5 text-blue-600" />
                        </div>
                        <span className="text-sm text-muted-foreground">Student:</span>
                        <span className="font-semibold text-sm">{appointment.student.name}</span>
                      </div>

                      {/* Doctor Info */}
                      <div className="flex items-center gap-2">
                        <div className="rounded-full bg-green-100 p-1.5">
                          <Stethoscope className="h-3.5 w-3.5 text-green-600" />
                        </div>
                        <span className="text-sm text-muted-foreground">Doctor:</span>
                        <span className="font-semibold text-sm">{appointment.doctor.name}</span>
                      </div>

                      {/* Date and Time */}
                      <div className="flex items-center gap-2">
                        <div className="rounded-full bg-purple-100 p-1.5">
                          <Calendar className="h-3.5 w-3.5 text-purple-600" />
                        </div>
                        <span className="font-semibold text-sm">
                          {format(new Date(appointment.date), "MMM dd, yyyy")}
                        </span>
                        <span className="text-sm text-muted-foreground">at</span>
                        <span className="font-semibold text-sm flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {appointment.timeSlot}
                        </span>
                      </div>
                    </div>

                    {/* Right side - Status and Action */}
                    <div className="flex items-center gap-3">
                      {getStatusBadge(appointment.status)}
                      
                      {appointment.status === "PENDING" && (
                        <Button
                          onClick={() => handleConfirmAppointment(appointment.id)}
                          disabled={confirming === appointment.id}
                          className="bg-green-600 hover:bg-green-700"
                          size="sm"
                        >
                          {confirming === appointment.id ? (
                            <>
                              <Clock className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                              Confirming...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                              Confirm
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No Upcoming Appointments</h3>
              <p className="text-sm text-muted-foreground">
                There are no current or upcoming appointments to display.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
