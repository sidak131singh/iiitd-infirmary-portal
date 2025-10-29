"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  FileText, 
  User, 
  Calendar, 
  Clock,
  Pill
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

interface Medicine {
  id: string
  name: string
  category: string
  dosage: string
  quantity: number
}

interface Medication {
  medicineId: string
  medicine?: Medicine
  dosage: string
  frequency: string
  duration: string
  instructions: string
}

interface AppointmentInfo {
  id: string
  date: string
  timeSlot: string
  reason: string
  student: {
    name: string
    studentId: string
  }
}

export default function WritePrescriptionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const { toast } = useToast()
  
  const appointmentId = searchParams.get('appointment')
  
  const [appointment, setAppointment] = useState<AppointmentInfo | null>(null)
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [diagnosis, setDiagnosis] = useState('')
  const [notes, setNotes] = useState('')
  const [medications, setMedications] = useState<Medication[]>([
    { medicineId: '', dosage: '', frequency: '', duration: '', instructions: '' }
  ])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (appointmentId && session) {
      fetchData()
    }
  }, [appointmentId, session])

  const fetchData = async () => {
    try {
      // Fetch appointment details and medicines in parallel
      const [appointmentResponse, medicinesResponse] = await Promise.all([
        fetch(`/api/doctor/appointments/${appointmentId}`),
        fetch('/api/doctor/prescriptions')
      ])

      if (appointmentResponse.ok) {
        const appointmentData = await appointmentResponse.json()
        setAppointment({
          id: appointmentData.id,
          date: appointmentData.date,
          timeSlot: appointmentData.timeSlot,
          reason: appointmentData.reason,
          student: appointmentData.student
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch appointment details",
          variant: "destructive"
        })
        router.push('/doctor/appointments')
        return
      }

      if (medicinesResponse.ok) {
        const medicinesData = await medicinesResponse.json()
        setMedicines(medicinesData)
      } else {
        toast({
          title: "Warning",
          description: "Failed to fetch medicines list",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: "Error",
        description: "Failed to load prescription form",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddMedication = () => {
    setMedications([...medications, { 
      medicineId: '', 
      dosage: '', 
      frequency: '', 
      duration: '', 
      instructions: '' 
    }])
  }

  const handleRemoveMedication = (index: number) => {
    if (medications.length > 1) {
      setMedications(medications.filter((_, i) => i !== index))
    }
  }

  const handleMedicationChange = (index: number, field: keyof Medication, value: string) => {
    const updated = [...medications]
    updated[index] = { ...updated[index], [field]: value }
    
    // If medicine is selected, populate default dosage
    if (field === 'medicineId' && value) {
      const medicine = medicines.find(m => m.id === value)
      if (medicine && !updated[index].dosage) {
        updated[index].dosage = medicine.dosage
      }
    }
    
    setMedications(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!diagnosis.trim()) {
      toast({
        title: "Error",
        description: "Diagnosis is required",
        variant: "destructive"
      })
      return
    }

    // Filter out empty medications
    const validMedications = medications.filter(med => 
      med.medicineId && med.dosage && med.frequency && med.duration
    )

    setSubmitting(true)

    try {
      const response = await fetch('/api/doctor/prescriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          appointmentId,
          diagnosis: diagnosis.trim(),
          notes: notes.trim(),
          medications: validMedications
        })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Prescription created successfully",
        })
        router.push(`/doctor/appointments/${appointmentId}`)
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to create prescription",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error creating prescription:', error)
      toast({
        title: "Error",
        description: "Failed to create prescription",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
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

  if (loading) {
    return (
      <div className="container py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading prescription form...</p>
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
          <p className="text-muted-foreground mt-2">The appointment you're trying to create a prescription for doesn't exist.</p>
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
          <Link href={`/doctor/appointments/${appointmentId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Appointment
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight">Write Prescription</h1>
            <p className="text-muted-foreground">
              Create a prescription for this appointment
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Appointment Info Sidebar */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Appointment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{appointment.student.name}</p>
                  <p className="text-xs text-muted-foreground">ID: {appointment.student.studentId}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Date</p>
                  <p className="text-xs text-muted-foreground">{formatDate(appointment.date)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Time</p>
                  <p className="text-xs text-muted-foreground">{appointment.timeSlot}</p>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium mb-1">Reason</p>
                <p className="text-xs text-muted-foreground">{appointment.reason}</p>
              </div>
            </CardContent>
          </Card>

          {/* Prescription Form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Prescription Information
                  </CardTitle>
                  <CardDescription>
                    Provide diagnosis and treatment details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="diagnosis">Diagnosis *</Label>
                    <Textarea
                      id="diagnosis"
                      placeholder="Enter the diagnosis..."
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      className="mt-1"
                      rows={3}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any additional instructions or notes..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="mt-1"
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Pill className="h-5 w-5" />
                        Medications
                      </CardTitle>
                      <CardDescription>
                        Add medications and dosage instructions
                      </CardDescription>
                    </div>
                    <Button type="button" variant="outline" onClick={handleAddMedication}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Medication
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {medications.map((medication, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Medication {index + 1}</h4>
                        {medications.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveMedication(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <Label>Medicine *</Label>
                          <Select
                            value={medication.medicineId}
                            onValueChange={(value) => handleMedicationChange(index, 'medicineId', value)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select medicine" />
                            </SelectTrigger>
                            <SelectContent>
                              {medicines.map((medicine) => (
                                <SelectItem key={medicine.id} value={medicine.id}>
                                  <div className="flex items-center gap-2">
                                    <span>{medicine.name}</span>
                                    <Badge variant="outline" className="text-xs">
                                      {medicine.category}
                                    </Badge>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label>Dosage *</Label>
                          <Input
                            placeholder="e.g., 500mg"
                            value={medication.dosage}
                            onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        
                        <div>
                          <Label>Frequency *</Label>
                          <Select
                            value={medication.frequency}
                            onValueChange={(value) => handleMedicationChange(index, 'frequency', value)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Once a day">Once a day</SelectItem>
                              <SelectItem value="Twice a day">Twice a day</SelectItem>
                              <SelectItem value="Three times a day">Three times a day</SelectItem>
                              <SelectItem value="Four times a day">Four times a day</SelectItem>
                              <SelectItem value="As needed">As needed</SelectItem>
                              <SelectItem value="Every 4 hours">Every 4 hours</SelectItem>
                              <SelectItem value="Every 6 hours">Every 6 hours</SelectItem>
                              <SelectItem value="Every 8 hours">Every 8 hours</SelectItem>
                              <SelectItem value="Before meals">Before meals</SelectItem>
                              <SelectItem value="After meals">After meals</SelectItem>
                              <SelectItem value="Before bedtime">Before bedtime</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label>Duration *</Label>
                          <Select
                            value={medication.duration}
                            onValueChange={(value) => handleMedicationChange(index, 'duration', value)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1 day">1 day</SelectItem>
                              <SelectItem value="2 days">2 days</SelectItem>
                              <SelectItem value="3 days">3 days</SelectItem>
                              <SelectItem value="5 days">5 days</SelectItem>
                              <SelectItem value="7 days">7 days</SelectItem>
                              <SelectItem value="10 days">10 days</SelectItem>
                              <SelectItem value="14 days">14 days</SelectItem>
                              <SelectItem value="21 days">21 days</SelectItem>
                              <SelectItem value="30 days">30 days</SelectItem>
                              <SelectItem value="Until finished">Until finished</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div>
                        <Label>Special Instructions</Label>
                        <Textarea
                          placeholder="e.g., Take with food, avoid alcohol..."
                          value={medication.instructions}
                          onChange={(e) => handleMedicationChange(index, 'instructions', e.target.value)}
                          className="mt-1"
                          rows={2}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="flex justify-end gap-4">
                <Link href={`/doctor/appointments/${appointmentId}`}>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Create Prescription
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}