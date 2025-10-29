import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, FileText, Users } from "lucide-react"
import Link from "next/link"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

async function getTodaysAppointments(doctorId: string) {
  const today = new Date()
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

  return await prisma.appointment.findMany({
    where: {
      doctorId,
      date: {
        gte: startOfDay,
        lt: endOfDay
      },
      status: {
        in: ['PENDING', 'CONFIRMED']
      }
    },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          studentId: true
        }
      }
    },
    orderBy: {
      timeSlot: 'asc'
    }
  })
}

export default async function DoctorDashboard() {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== 'DOCTOR') {
    return <div>Access denied</div>
  }

  const todaysAppointments = await getTodaysAppointments(session.user.id)

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="container py-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Welcome, Dr. Sarah</h1>
          <p className="text-muted-foreground">Here's your schedule for today: {currentDate}</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Today's Appointments</CardTitle>
                <CardDescription>You have {todaysAppointments.length} appointments scheduled for today.</CardDescription>
              </div>
              <Link href="/doctor/appointments">
                <Button variant="outline" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  View Schedule
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todaysAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-start gap-4 rounded-lg border p-4">
                  <div className="rounded-full bg-green-100 p-2">
                    <Clock className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div>
                        <h3 className="font-medium">
                          {appointment.student.name} (ID: {appointment.student.studentId})
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {appointment.timeSlot} - {appointment.reason}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/doctor/appointments/${appointment.id}`}>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </Link>
                        <Link href={`/doctor/prescriptions/new?appointment=${appointment.id}`}>
                          <Button className="bg-green-600 hover:bg-green-700" size="sm">
                            Write Prescription
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
