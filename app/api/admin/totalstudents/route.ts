import { NextResponse } from "next/server"
import { withAuth } from "@/lib/rbac"
import { prisma } from "@/lib/prisma"
import { createAuditLog } from "@/lib/audit"

export const GET = withAuth(["ADMIN"])(async (req: Request, session: any) => {
  try {
    const totalStudents = await prisma.user.count({
      where: { role: "STUDENT" }
    })

    // Get students from last month for comparison
    const lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 1)

    const studentsLastMonth = await prisma.user.count({
      where: {
        role: "STUDENT",
        createdAt: {
          gte: lastMonth
        }
      }
    })

    await createAuditLog(session.user.id, "VIEW_TOTAL_STUDENTS", { count: totalStudents }, req)

    return NextResponse.json({
      success: true,
      data: {
        totalStudents,
        newStudentsThisMonth: studentsLastMonth,
        change: studentsLastMonth > 0 ? `+${studentsLastMonth}` : "0"
      }
    })
  } catch (error) {
    console.error("Error fetching total students:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch student count" },
      { status: 500 }
    )
  }
})
