import { NextResponse } from "next/server"
import { withAuth } from "@/lib/rbac"
import { prisma } from "@/lib/prisma"
import { createAuditLog } from "@/lib/audit"

export const GET = withAuth(["ADMIN", "DOCTOR"])(async (req: Request, session: any, context: any) => {
  try {
    const userId = context.params.id
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        studentId: true,
        phone: true,
        height: true,
        weight: true,
        bloodGroup: true,
        pastMedicalHistory: true,
        currentMedications: true,
        createdAt: true,
        updatedAt: true,
        // Don't return password
      }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      )
    }

    await createAuditLog(
      session.user.id, 
      "VIEW_USER_PROFILE", 
      { 
        viewedUserId: user.id,
        viewedUserRole: user.role,
        viewedUserName: user.name 
      }, 
      req
    )

    return NextResponse.json({
      success: true,
      data: user
    })
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch user" },
      { status: 500 }
    )
  }
})