"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Users, Pill, Clock } from "lucide-react"
import Link from "next/link"
import { RoleGuard } from "@/components/auth/RoleGuard"

interface DashboardStats {
  totalStudents: number
  newStudentsThisMonth: number
  studentChange: string
  totalDoctors: number
  newDoctorsThisMonth: number
  doctorChange: string
  todayAppointments: number
  completedAppointments: number
  remainingAppointments: number
  appointmentSummary: string
  totalMedicines: number
  lowStockItems: number
  pharmacySummary: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    newStudentsThisMonth: 0,
    studentChange: "0",
    totalDoctors: 0,
    newDoctorsThisMonth: 0,
    doctorChange: "0",
    todayAppointments: 0,
    completedAppointments: 0,
    remainingAppointments: 0,
    appointmentSummary: "",
    totalMedicines: 0,
    lowStockItems: 0,
    pharmacySummary: ""
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        // Fetch all stats in parallel
        const [studentsRes, doctorsRes, appointmentsRes, pharmacyRes] = await Promise.all([
          fetch("/api/admin/totalstudents"),
          fetch("/api/admin/totaldoctors"),
          fetch("/api/admin/todayappointments"),
          fetch("/api/admin/pharmacyitems")
        ])

        const studentsData = studentsRes.ok ? await studentsRes.json() : { data: { totalStudents: 0, newStudentsThisMonth: 0, change: "0" } }
        const doctorsData = doctorsRes.ok ? await doctorsRes.json() : { data: { totalDoctors: 0, newDoctorsThisMonth: 0, change: "0" } }
        const appointmentsData = appointmentsRes.ok ? await appointmentsRes.json() : { data: { totalToday: 0, completed: 0, remaining: 0, summary: "" } }
        const pharmacyData = pharmacyRes.ok ? await pharmacyRes.json() : { data: { totalMedicines: 0, lowStockItems: 0, summary: "" } }

        setStats({
          totalStudents: studentsData.data.totalStudents,
          newStudentsThisMonth: studentsData.data.newStudentsThisMonth,
          studentChange: studentsData.data.change,
          totalDoctors: doctorsData.data.totalDoctors,
          newDoctorsThisMonth: doctorsData.data.newDoctorsThisMonth,
          doctorChange: doctorsData.data.change,
          todayAppointments: appointmentsData.data.totalToday,
          completedAppointments: appointmentsData.data.completed,
          remainingAppointments: appointmentsData.data.remaining,
          appointmentSummary: appointmentsData.data.summary,
          totalMedicines: pharmacyData.data.totalMedicines,
          lowStockItems: pharmacyData.data.lowStockItems,
          pharmacySummary: pharmacyData.data.summary
        })
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardStats()
  }, [])

  if (loading) {
    return (
      <RoleGuard allowedRoles={["ADMIN"]}>
        <div className="container py-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </RoleGuard>
    )
  }

  return (
    <RoleGuard allowedRoles={["ADMIN"]}>
      <div className="container py-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage infirmary operations and monitor key metrics.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalStudents}</div>
                <p className="text-xs text-muted-foreground">{stats.studentChange} from last month</p>
                <div className="mt-4">
                  <Link href="/admin/students">
                    <Button variant="outline" size="sm" className="w-full">
                      View Students
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Doctors</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalDoctors}</div>
                <p className="text-xs text-muted-foreground">{stats.doctorChange} from last month</p>
                <div className="mt-4">
                  <Link href="/admin/doctors">
                    <Button variant="outline" size="sm" className="w-full">
                      Manage Doctors
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.todayAppointments}</div>
                <p className="text-xs text-muted-foreground">{stats.appointmentSummary}</p>
                <div className="mt-4">
                  <Link href="/admin/appointments">
                    <Button variant="outline" size="sm" className="w-full">
                      View Schedule
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pharmacy Items</CardTitle>
                <Pill className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalMedicines}</div>
                <p className="text-xs text-muted-foreground">{stats.pharmacySummary}</p>
                <div className="mt-4">
                  <Link href="/admin/pharmacy">
                    <Button variant="outline" size="sm" className="w-full">
                      Manage Inventory
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Recent Appointments</CardTitle>
                <CardDescription>Overview of today's appointments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 text-sm font-medium text-muted-foreground">
                    <div>Student</div>
                    <div>Doctor</div>
                    <div>Status</div>
                  </div>
                  <div className="space-y-2">
                    {stats.todayAppointments === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">
                        No appointments scheduled for today
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        {stats.completedAppointments} completed, {stats.remainingAppointments} remaining
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Low Stock Alert</CardTitle>
                <CardDescription>Medicines running low</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 text-sm font-medium text-muted-foreground">
                    <div>Medication</div>
                    <div className="text-right">Status</div>
                  </div>
                  <div className="space-y-2">
                    {stats.lowStockItems === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">
                        All medicines in stock
                      </div>
                    ) : (
                      <div className="text-center py-4 text-yellow-600">
                        {stats.lowStockItems} items need restocking
                      </div>
                    )}
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
