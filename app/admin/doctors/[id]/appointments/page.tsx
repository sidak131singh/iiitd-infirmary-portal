"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { RoleGuard } from "@/components/auth/RoleGuard"
import { useToast } from "@/hooks/use-toast"
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Search, 
  FileText, 
  User, 
  Stethoscope,
  Filter,
  Eye,
  Calendar as CalendarIcon
} from "lucide-react"

interface Appointment {
  id: string
  date: string
  timeSlot: string
  reason: string
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED"
  notes?: string
  student: {
    id: string
    name: string
    studentId: string
    email: string
    phone?: string
  }
  prescription?: {
    id: string
    diagnosis: string
    medications: Array<{
      id: string
      dosage: string
      frequency: string
      duration: string
      instructions: string
      medicine: {
        name: string
        category: string
        dosage: string
      }
    }>
  }
}

interface Doctor {
  id: string
  name: string
  email: string
  phone?: string
  isCheckedIn: boolean
}

export default function DoctorAppointmentsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedPrescription, setSelectedPrescription] = useState<Appointment["prescription"] | null>(null)

  const doctorId = params.id as string

  const fetchDoctorDetails = async () => {
    try {
      const response = await fetch("/api/admin/doctors")
      if (response.ok) {
        const data = await response.json()
        const doctorData = data.data.find((d: Doctor) => d.id === doctorId)
        if (doctorData) {
          setDoctor(doctorData)
        } else {
          throw new Error("Doctor not found")
        }
      }
    } catch (error) {
      console.error("Failed to fetch doctor details:", error)
      toast({
        title: "Error",
        description: "Failed to fetch doctor details",
        variant: "destructive",
      })
    }
  }

  const fetchAppointments = async () => {
    try {
      const response = await fetch(`/api/appointments?doctorId=${doctorId}`)
      if (response.ok) {
        const data = await response.json()
        setAppointments(data.data || [])
      }
    } catch (error) {
      console.error("Failed to fetch appointments:", error)
      toast({
        title: "Error",
        description: "Failed to fetch appointments",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (doctorId) {
      fetchDoctorDetails()
      fetchAppointments()
    }
  }, [doctorId])

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = 
      appointment.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.reason.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || appointment.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-yellow-100 text-yellow-800"
      case "CONFIRMED": return "bg-blue-100 text-blue-800"
      case "COMPLETED": return "bg-green-100 text-green-800"
      case "CANCELLED": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getAppointmentStats = () => {
    const total = appointments.length
    const pending = appointments.filter(a => a.status === "PENDING").length
    const confirmed = appointments.filter(a => a.status === "CONFIRMED").length
    const completed = appointments.filter(a => a.status === "COMPLETED").length
    const cancelled = appointments.filter(a => a.status === "CANCELLED").length
    
    return { total, pending, confirmed, completed, cancelled }
  }

  const stats = getAppointmentStats()

  if (loading) {
    return (
      <div className="container py-6">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <RoleGuard allowedRoles={["ADMIN"]}>
      <div className="container py-6">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Dr. {doctor?.name}'s Appointments
              </h1>
              <p className="text-muted-foreground">
                View and manage all appointments for this doctor
              </p>
            </div>
          </div>

          {/* Doctor Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                Doctor Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">Dr. {doctor?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{doctor?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={doctor?.isCheckedIn ? "default" : "secondary"}>
                    {doctor?.isCheckedIn ? "Checked In" : "Checked Out"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <p className="text-sm text-muted-foreground">Total</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                <p className="text-sm text-muted-foreground">Pending</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">{stats.confirmed}</div>
                <p className="text-sm text-muted-foreground">Confirmed</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                <p className="text-sm text-muted-foreground">Completed</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
                <p className="text-sm text-muted-foreground">Cancelled</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Appointments ({filteredAppointments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by student name, ID, or reason..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Appointments List */}
              <div className="space-y-3">
                {filteredAppointments.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    {searchTerm || statusFilter !== "all" 
                      ? "No appointments match your search criteria." 
                      : "No appointments found for this doctor."}
                  </div>
                ) : (
                  filteredAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between gap-4">
                        {/* Left side - All appointment info in one line */}
                        <div className="flex-1 flex flex-wrap items-center gap-x-6 gap-y-2">
                          {/* Student Name */}
                          <div className="flex items-center gap-2">
                            <User className="h-3.5 w-3.5 text-blue-600" />
                            <span className="font-semibold text-sm">{appointment.student.name}</span>
                          </div>

                          {/* Student ID / Roll Number */}
                          <div className="flex items-center gap-2">
                            <FileText className="h-3.5 w-3.5 text-gray-600" />
                            <span className="text-sm text-muted-foreground">Roll: {appointment.student.studentId}</span>
                          </div>

                          {/* Date */}
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="h-3.5 w-3.5 text-purple-600" />
                            <span className="text-sm font-medium">
                              {formatDate(appointment.date)}
                            </span>
                          </div>

                          {/* Time */}
                          <div className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 text-orange-600" />
                            <span className="text-sm font-medium">{appointment.timeSlot}</span>
                          </div>
                        </div>
                        
                        {/* Right side - Status and Prescription button */}
                        <div className="flex items-center gap-3">
                          <Badge className={getStatusColor(appointment.status)}>
                            {appointment.status}
                          </Badge>

                          {appointment.prescription && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  size="sm"
                                  onClick={() => setSelectedPrescription(appointment.prescription)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <FileText className="h-3.5 w-3.5 mr-1.5" />
                                  Prescription
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>
                                    Prescription for {appointment.student.name}
                                  </DialogTitle>
                                </DialogHeader>
                                {selectedPrescription && (
                                  <div className="space-y-6">
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                      <h3 className="font-semibold text-blue-900 mb-2">Diagnosis</h3>
                                      <p className="text-blue-800">{selectedPrescription.diagnosis}</p>
                                    </div>
                                    
                                    <div>
                                      <h3 className="font-semibold mb-4">Prescribed Medications</h3>
                                      <div className="space-y-4">
                                        {selectedPrescription.medications.map((med) => (
                                          <div key={med.id} className="border rounded-lg p-4">
                                            <div className="flex justify-between items-start mb-2">
                                              <h4 className="font-medium text-lg">{med.medicine.name}</h4>
                                              <Badge variant="outline">{med.medicine.category}</Badge>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                              <div>
                                                <span className="text-muted-foreground">Dosage:</span>
                                                <p className="font-medium">{med.dosage}</p>
                                              </div>
                                              <div>
                                                <span className="text-muted-foreground">Frequency:</span>
                                                <p className="font-medium">{med.frequency}</p>
                                              </div>
                                              <div>
                                                <span className="text-muted-foreground">Duration:</span>
                                                <p className="font-medium">{med.duration}</p>
                                              </div>
                                              <div>
                                                <span className="text-muted-foreground">Instructions:</span>
                                                <p className="font-medium">{med.instructions}</p>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleGuard>
  )
}