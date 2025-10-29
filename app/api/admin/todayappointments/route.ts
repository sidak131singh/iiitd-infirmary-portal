import { NextResponse } from "next/server"
import { withAuth } from "@/lib/rbac"
import { prisma } from "@/lib/prisma"
import { createAuditLog } from "@/lib/audit"

export const GET = withAuth(["ADMIN"])(async (req: Request, session: any) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todayAppointments = await prisma.appointment.count({
      where: {
        date: {
          gte: today,
          lt: tomorrow
        }
      }
    })

    const completedToday = await prisma.appointment.count({
      where: {
        date: {
          gte: today,
          lt: tomorrow
        },
        status: "COMPLETED"
      }
    })

    const remainingToday = todayAppointments - completedToday

    await createAuditLog(session.user.id, "VIEW_TODAY_APPOINTMENTS", { count: todayAppointments }, req)

    return NextResponse.json({
      success: true,
      data: {
        totalToday: todayAppointments,
        completed: completedToday,
        remaining: remainingToday,
        summary: `${completedToday} completed, ${remainingToday} remaining`
      }
    })
  } catch (error) {
    console.error("Error fetching today's appointments:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch today's appointments" },
      { status: 500 }
    )
  }
})