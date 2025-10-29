import { NextResponse } from "next/server"
import { withAuth } from "@/lib/rbac"
import { prisma } from "@/lib/prisma"
import { createAuditLog } from "@/lib/audit"

export const GET = withAuth(["ADMIN"])(async (req: Request, session: any) => {
  try {
    const totalDoctors = await prisma.user.count({
      where: { role: "DOCTOR" }
    })

    const lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 1)

    const doctorsLastMonth = await prisma.user.count({
      where: {
        role: "DOCTOR",
        createdAt: {
          gte: lastMonth
        }
      }
    })

    await createAuditLog(session.user.id, "VIEW_TOTAL_DOCTORS", { count: totalDoctors }, req)

    return NextResponse.json({
      success: true,
      data: {
        totalDoctors,
        newDoctorsThisMonth: doctorsLastMonth,
        change: doctorsLastMonth > 0 ? `+${doctorsLastMonth}` : "0"
      }
    })
  } catch (error) {
    console.error("Error fetching total doctors:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch doctor count" },
      { status: 500 }
    )
  }
})