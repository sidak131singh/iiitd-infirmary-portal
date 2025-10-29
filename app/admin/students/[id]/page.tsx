"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RoleGuard } from "@/components/auth/RoleGuard"
import { ArrowLeft, User, Phone, Mail, Calendar, Activity, Pill, FileText } from "lucide-react"
import { useRouter } from "next/navigation"

interface StudentProfile {
  id: string
  name: string
  email: string
  studentId: string
  phone?: string
  height?: number
  weight?: number
  bloodGroup?: string
  pastMedicalHistory?: string
  currentMedications?: string
  createdAt: string
}

interface StudentProfilePageProps {
  params: {
    id: string
  }
}

export default function StudentProfilePage({ params }: StudentProfilePageProps) {
  const [student, setStudent] = useState<StudentProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const response = await fetch(`/api/users/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setStudent(data.data)
        } else {
          console.error("Failed to fetch student")
        }
      } catch (error) {
        console.error("Error fetching student:", error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchStudent()
    }
  }, [params.id])

  const calculateBMI = (height?: number, weight?: number) => {
    if (!height || !weight) return null
    const heightInM = height / 100
    const bmi = weight / (heightInM * heightInM)
    return bmi.toFixed(1)
  }

  const getBMIStatus = (bmi: number) => {
    if (bmi < 18.5) return { status: "Underweight", color: "text-blue-600" }
    if (bmi < 25) return { status: "Normal", color: "text-green-600" }
    if (bmi < 30) return { status: "Overweight", color: "text-yellow-600" }
    return { status: "Obese", color: "text-red-600" }
  }

  if (loading) {
    return (
      <RoleGuard allowedRoles={["ADMIN", "DOCTOR"]}>
        <div className="container py-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </RoleGuard>
    )
  }

  if (!student) {
    return (
      <RoleGuard allowedRoles={["ADMIN", "DOCTOR"]}>
        <div className="container py-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Student Not Found</h1>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>
        </div>
      </RoleGuard>
    )
  }

  const bmi = calculateBMI(student.height, student.weight)
  const bmiStatus = bmi ? getBMIStatus(parseFloat(bmi)) : null

  return (
    <RoleGuard allowedRoles={["ADMIN", "DOCTOR"]}>
      <div className="container py-6">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Student Profile</h1>
              <p className="text-muted-foreground">Detailed medical information and records</p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Basic Information */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <p className="text-lg font-semibold">{student.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Student ID</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary">{student.studentId}</Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p>{student.email}</p>
                  </div>
                </div>
                {student.phone && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <p>{student.phone}</p>
                    </div>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Registered</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p>{new Date(student.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Medical Information */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Medical Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Physical Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <label className="text-sm font-medium text-muted-foreground">Height</label>
                    <p className="text-2xl font-bold text-blue-600">
                      {student.height ? `${student.height} cm` : 'Not recorded'}
                    </p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <label className="text-sm font-medium text-muted-foreground">Weight</label>
                    <p className="text-2xl font-bold text-green-600">
                      {student.weight ? `${student.weight} kg` : 'Not recorded'}
                    </p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <label className="text-sm font-medium text-muted-foreground">BMI</label>
                    <p className={`text-2xl font-bold ${bmiStatus?.color || 'text-muted-foreground'}`}>
                      {bmi || 'N/A'}
                    </p>
                    {bmiStatus && (
                      <p className={`text-xs ${bmiStatus.color}`}>{bmiStatus.status}</p>
                    )}
                  </div>
                </div>

                {/* Blood Group */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Blood Group</label>
                  <div className="mt-2">
                    {student.bloodGroup ? (
                      <Badge variant="outline" className="text-red-600 border-red-200 text-lg px-3 py-1">
                        {student.bloodGroup}
                      </Badge>
                    ) : (
                      <p className="text-muted-foreground">Not recorded</p>
                    )}
                  </div>
                </div>

                {/* Current Medications */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Pill className="h-4 w-4" />
                    Current Medications
                  </label>
                  <div className="mt-2 p-3 border rounded-lg bg-muted/50">
                    <p className="text-sm">
                      {student.currentMedications || 'No current medications'}
                    </p>
                  </div>
                </div>

                {/* Past Medical History */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Past Medical History
                  </label>
                  <div className="mt-2 p-3 border rounded-lg bg-muted/50">
                    <p className="text-sm whitespace-pre-wrap">
                      {student.pastMedicalHistory || 'No past medical history recorded'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Appointment
            </Button>
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              View Medical Records
            </Button>
            <Button variant="outline">
              <User className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          </div>
        </div>
      </div>
    </RoleGuard>
  )
}