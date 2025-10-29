"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { RoleGuard } from "@/components/auth/RoleGuard"
import { useToast } from "@/hooks/use-toast"
import { Users, Search, Plus } from "lucide-react"

interface Student {
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

export default function AdminStudentsPage() {
  const { toast } = useToast()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newStudent, setNewStudent] = useState({
    name: "",
    email: "",
    studentId: "",
    phone: "",
    height: "",
    weight: "",
    bloodGroup: "",
    pastMedicalHistory: "",
    currentMedications: "",
  })

  const fetchStudents = async () => {
    try {
      const response = await fetch("/api/users?role=STUDENT")
      if (response.ok) {
        const data = await response.json()
        setStudents(data.data || [])
      }
    } catch (error) {
      console.error("Failed to fetch students:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Required field validation
    if (!newStudent.name || !newStudent.email || !newStudent.studentId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields: Name, Email, and Student Roll Number",
        variant: "destructive",
      })
      return
    }

    // Height and weight validation - must not be negative
    if (newStudent.height && parseFloat(newStudent.height) < 0) {
      toast({
        title: "Error",
        description: "Height cannot be negative",
        variant: "destructive",
      })
      return
    }

    if (newStudent.weight && parseFloat(newStudent.weight) < 0) {
      toast({
        title: "Error",
        description: "Weight cannot be negative",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newStudent,
          role: "STUDENT",
          height: newStudent.height ? parseFloat(newStudent.height) : undefined,
          weight: newStudent.weight ? parseFloat(newStudent.weight) : undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create student")
      }

      const createdStudent = await response.json()
      
      // Refresh the students list
      fetchStudents()
      
      // Reset form and close dialog
      setNewStudent({
        name: "",
        email: "",
        studentId: "",
        phone: "",
        height: "",
        weight: "",
        bloodGroup: "",
        pastMedicalHistory: "",
        currentMedications: "",
      })
      setIsAddDialogOpen(false)
      
      toast({
        title: "Success",
        description: "Student added successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch("/api/users?role=STUDENT")
        if (response.ok) {
          const data = await response.json()
          setStudents(data.data || [])
        }
      } catch (error) {
        console.error("Failed to fetch students:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [])

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <RoleGuard allowedRoles={["ADMIN"]}>
      <div className="container py-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Student Management</h1>
            <p className="text-muted-foreground">
              Manage student records and information
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Students Overview
              </CardTitle>
              <CardDescription>
                Total students registered: {students.length}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search students by name, email, or student ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => setIsAddDialogOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Student
                </Button>
              </div>

              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredStudents.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {searchTerm ? "No students found matching your search." : "No students registered yet."}
                    </div>
                  ) : (
                    filteredStudents.map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{student.name}</h3>
                            <Badge variant="secondary">{student.studentId}</Badge>
                            {student.bloodGroup && (
                              <Badge variant="outline" className="text-red-600 border-red-200">
                                {student.bloodGroup}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{student.email}</p>
                          {student.phone && (
                            <p className="text-sm text-muted-foreground">{student.phone}</p>
                          )}
                          
                          {/* Medical Information */}
                          <div className="flex gap-4 mt-2">
                            {student.height && student.weight && (
                              <p className="text-xs text-muted-foreground">
                                Physical: {student.height}cm, {student.weight}kg
                              </p>
                            )}
                            {student.currentMedications && student.currentMedications !== 'None' && (
                              <Badge variant="outline" className="text-orange-600 border-orange-200 text-xs">
                                On Medication
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-xs text-muted-foreground mt-1">
                            Registered: {new Date(student.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.location.href = `/admin/students/${student.id}`}
                          >
                            View Details
                          </Button>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Student Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
            <DialogDescription>
              Create a new student account with medical information
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddStudent} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  placeholder="Enter student's full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="studentId">Student Roll Number *</Label>
                <Input
                  id="studentId"
                  value={newStudent.studentId}
                  onChange={(e) => setNewStudent({ ...newStudent, studentId: e.target.value })}
                  placeholder="e.g., 2021001"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                  placeholder="student@iiitd.ac.in"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={newStudent.phone}
                  onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                  placeholder="+91 XXXXXXXXXX"
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-700">
                <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-white text-xs">ℹ</span>
                </div>
                <span className="font-medium">Password Information</span>
              </div>
              <p className="text-blue-600 text-sm mt-1">
                A secure password will be automatically generated and sent to the student's email address.
              </p>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-4">Medical Information</h3>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    step="0.1"
                    min="0"
                    value={newStudent.height}
                    onChange={(e) => setNewStudent({ ...newStudent, height: e.target.value })}
                    placeholder="e.g., 170.5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    min="0"
                    value={newStudent.weight}
                    onChange={(e) => setNewStudent({ ...newStudent, weight: e.target.value })}
                    placeholder="e.g., 65.5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bloodGroup">Blood Group</Label>
                  <Select 
                    value={newStudent.bloodGroup} 
                    onValueChange={(value) => setNewStudent({ ...newStudent, bloodGroup: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2 mt-4">
                <Label htmlFor="pastMedicalHistory">Past Medical History</Label>
                <Textarea
                  id="pastMedicalHistory"
                  value={newStudent.pastMedicalHistory}
                  onChange={(e) => setNewStudent({ ...newStudent, pastMedicalHistory: e.target.value })}
                  placeholder="Enter any past medical conditions, surgeries, or significant health events..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentMedications">Current Medications</Label>
                <Textarea
                  id="currentMedications"
                  value={newStudent.currentMedications}
                  onChange={(e) => setNewStudent({ ...newStudent, currentMedications: e.target.value })}
                  placeholder="List current medications, dosages, and frequency..."
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsAddDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Student"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </RoleGuard>
  )
}