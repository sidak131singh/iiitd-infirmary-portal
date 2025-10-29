'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  FileText, 
  Heart, 
  Droplets, 
  Ruler, 
  Weight,
  Pill
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

interface AppointmentDetails {
  id: string
  date: string
  timeSlot: string
  reason: string
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
  notes?: string
  student: {
    id: string
    name: string
    email: string
    studentId: string
    phone: string
    height?: number
    weight?: number
    bloodGroup?: string
    pastMedicalHistory?: string
    currentMedications?: string
    createdAt: string
  }
  doctor: {
    id: string
    name: string
    email: string
  }
  prescription?: {
    id: string
    diagnosis: string
    notes: string
    medications: Array<{
      id: string
      dosage: string
      frequency: string
      duration: string
      instructions: string
      medicine: {
        id: string
        name: string
        category: string
        dosage: string
      }
    }>
  }
}

export default function AppointmentDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()
  const [appointment, setAppointment] = useState<AppointmentDetails | null>(null)
  const [loading, setLoading] = useState(true)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200'
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 hover:bg-green-200'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 hover:bg-red-200'
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  useEffect(() => {
    if (params.id && session) {
      fetchAppointmentDetails()
    }
  }, [params.id, session])

  const fetchAppointmentDetails = async () => {
    try {
      const response = await fetch(`/api/doctor/appointments/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setAppointment(data)
      } else if (response.status === 404) {
        toast({
          title: "Not Found",
          description: "Appointment not found or you don't have access to it",
          variant: "destructive"
        })
        router.push('/doctor/appointments')
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch appointment details",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching appointment details:', error)
      toast({
        title: "Error",
        description: "Failed to fetch appointment details",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading appointment details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!appointment) {
    return (
      <div className="container py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Appointment Not Found</h1>
          <p className="text-muted-foreground mt-2">The appointment you're looking for doesn't exist or you don't have access to it.</p>
          <Link href="/doctor/appointments">
            <Button className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Appointments
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Link href="/doctor/appointments">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Appointments
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight">Appointment Details</h1>
            <p className="text-muted-foreground">
              View detailed information about this appointment
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Appointment Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Appointment Information
                  </CardTitle>
                  <Badge className={getStatusColor(appointment.status)}>
                    {appointment.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Date</p>
                      <p className="text-sm text-muted-foreground">{formatDate(appointment.date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Time</p>
                      <p className="text-sm text-muted-foreground">{appointment.timeSlot}</p>
                    </div>
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium mb-1">Reason for Visit</p>
                  <p className="text-sm text-muted-foreground">{appointment.reason}</p>
                </div>
                {appointment.notes && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium mb-1">Notes</p>
                      <p className="text-sm text-muted-foreground">{appointment.notes}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            {!appointment.prescription && appointment.status !== 'CANCELLED' && (
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                  <CardDescription>
                    Available actions for this appointment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <Link href={`/doctor/prescriptions/new?appointment=${appointment.id}`}>
                      <Button className="bg-green-600 hover:bg-green-700">
                        <FileText className="mr-2 h-4 w-4" />
                        Write Prescription
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Prescription Section */}
            {appointment.prescription ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Prescription
                  </CardTitle>
                  <CardDescription>
                    Prescription details for this appointment
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-1">Diagnosis</p>
                    <p className="text-sm text-muted-foreground">{appointment.prescription.diagnosis}</p>
                  </div>
                  {appointment.prescription.notes && (
                    <div>
                      <p className="text-sm font-medium mb-1">Prescription Notes</p>
                      <p className="text-sm text-muted-foreground">{appointment.prescription.notes}</p>
                    </div>
                  )}
                  {appointment.prescription.medications.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-3">Medications</p>
                      <div className="space-y-3">
                        {appointment.prescription.medications.map((medication) => (
                          <div key={medication.id} className="border rounded-lg p-4 bg-blue-50">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Pill className="h-4 w-4 text-blue-600" />
                                  <h4 className="font-medium text-blue-900">{medication.medicine.name}</h4>
                                  <Badge variant="outline" className="text-xs">
                                    {medication.medicine.category}
                                  </Badge>
                                </div>
                                <div className="grid gap-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Dosage:</span>
                                    <span>{medication.dosage}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Frequency:</span>
                                    <span>{medication.frequency}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Duration:</span>
                                    <span>{medication.duration}</span>
                                  </div>
                                  {medication.instructions && (
                                    <div className="mt-2 p-2 bg-white rounded border">
                                      <span className="text-xs font-medium text-muted-foreground">Instructions:</span>
                                      <p className="text-sm mt-1">{medication.instructions}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : appointment.status !== 'COMPLETED' && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No Prescription Yet</h3>
                  <p className="text-muted-foreground text-center max-w-sm mb-4">
                    This appointment hasn't been completed yet. You can write a prescription once you've seen the patient.
                  </p>
                  <Link href={`/doctor/prescriptions/new?appointment=${appointment.id}`}>
                    <Button className="bg-green-600 hover:bg-green-700">
                      <FileText className="mr-2 h-4 w-4" />
                      Write Prescription
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Patient Info Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center pb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <User className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="font-medium text-lg">{appointment.student.name}</h3>
                  <p className="text-sm text-muted-foreground">ID: {appointment.student.studentId}</p>
                </div>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">{appointment.student.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Phone</p>
                      <p className="text-sm text-muted-foreground">{appointment.student.phone}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Medical Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Medical Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  {appointment.student.height && (
                    <div className="flex items-center gap-3">
                      <Ruler className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Height</p>
                        <p className="text-sm text-muted-foreground">{appointment.student.height} cm</p>
                      </div>
                    </div>
                  )}
                  {appointment.student.weight && (
                    <div className="flex items-center gap-3">
                      <Weight className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Weight</p>
                        <p className="text-sm text-muted-foreground">{appointment.student.weight} kg</p>
                      </div>
                    </div>
                  )}
                  {appointment.student.bloodGroup && (
                    <div className="flex items-center gap-3">
                      <Droplets className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Blood Group</p>
                        <p className="text-sm text-muted-foreground">{appointment.student.bloodGroup}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {appointment.student.pastMedicalHistory && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium mb-2">Past Medical History</p>
                      <p className="text-sm text-muted-foreground">{appointment.student.pastMedicalHistory}</p>
                    </div>
                  </>
                )}
                
                {appointment.student.currentMedications && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium mb-2">Current Medications</p>
                      <p className="text-sm text-muted-foreground">{appointment.student.currentMedications}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}