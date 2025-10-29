import { NextResponse } from "next/server"
import { withAuth } from "@/lib/rbac"
import { prisma } from "@/lib/prisma"
import { createAuditLog } from "@/lib/audit"

export const GET = withAuth(["ADMIN"])(async (req: Request, session: any) => {
  try {
    const doctors = await prisma.user.findMany({
      where: { role: "DOCTOR" },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        // isCheckedIn: true, // Commented due to Prisma client issues
        createdAt: true,
      },
      orderBy: { name: "asc" }
    })

    // Get appointment counts separately
    const doctorsWithStats = await Promise.all(
      doctors.map(async (doctor) => {
        const totalAppointments = await prisma.appointment.count({
          where: { doctorId: doctor.id }
        })

        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        const todayAppointments = await prisma.appointment.count({
          where: {
            doctorId: doctor.id,
            date: {
              gte: today,
              lt: tomorrow
            }
          }
        })

        const pendingAppointments = await prisma.appointment.count({
          where: {
            doctorId: doctor.id,
            status: {
              in: ["PENDING", "CONFIRMED"]
            }
          }
        })

        return {
          ...doctor,
          isCheckedIn: false, // Default to false until Prisma client is regenerated
          totalAppointments,
          todayAppointments,
          pendingAppointments
        }
      })
    )
    
    await createAuditLog(session.user.id, "VIEW_DOCTORS", {}, req)
    
    return NextResponse.json({
      success: true,
      data: doctorsWithStats,
      count: doctorsWithStats.length
    })
  } catch (error) {
    console.error("Error fetching doctors:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch doctors" },
      { status: 500 }
    )
  }
})

export const PATCH = withAuth(["ADMIN"])(async (req: Request, session: any) => {
  try {
    const { doctorId, isCheckedIn } = await req.json()
    
    if (!doctorId || typeof isCheckedIn !== "boolean") {
      return NextResponse.json(
        { success: false, error: "Doctor ID and check-in status are required" },
        { status: 400 }
      )
    }

    // Verify the user is a doctor
    const doctor = await prisma.user.findFirst({
      where: { 
        id: doctorId,
        role: "DOCTOR" 
      },
      select: { id: true, name: true, email: true }
    })

    if (!doctor) {
      return NextResponse.json(
        { success: false, error: "Doctor not found" },
        { status: 404 }
      )
    }

    // Update check-in status using raw SQL for now (until Prisma client regeneration)
    const updatedDoctor = await prisma.$executeRaw`
      UPDATE users SET "isCheckedIn" = ${isCheckedIn} WHERE id = ${doctorId}
    `

    // Fetch the updated doctor data
    const doctorData = await prisma.user.findUnique({
      where: { id: doctorId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true
      }
    })

    if (!doctorData) {
      return NextResponse.json(
        { success: false, error: "Doctor not found after update" },
        { status: 404 }
      )
    }

    await createAuditLog(
      session.user.id, 
      "UPDATE_DOCTOR_CHECKIN", 
      { 
        doctorId,
        doctorName: doctor.name,
        isCheckedIn,
        previousStatus: !isCheckedIn 
      }, 
      req
    )
    
    return NextResponse.json({
      success: true,
      data: { ...doctorData, isCheckedIn },
      message: `Dr. ${doctor.name} has been ${isCheckedIn ? 'checked in' : 'checked out'}`
    })
  } catch (error) {
    console.error("Error updating doctor check-in status:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update doctor check-in status" },
      { status: 500 }
    )
  }
})