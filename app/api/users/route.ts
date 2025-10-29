import { NextResponse } from "next/server"
import { withAuth } from "@/lib/rbac"
import { prisma } from "@/lib/prisma"
import { createAuditLog } from "@/lib/audit"
import { generateRandomPassword, sendPasswordEmail } from "@/lib/email"
import bcrypt from "bcryptjs"

export const GET = withAuth(["ADMIN"])(async (req: Request, session: any) => {
  try {
    const { searchParams } = new URL(req.url)
    const role = searchParams.get("role")
    
    const where: any = {}
    if (role) where.role = role

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        studentId: true,
        phone: true,
        // Medical fields (primarily for students) - commented due to Prisma client issues
        // height: true,
        // weight: true,
        // bloodGroup: true,
        // pastMedicalHistory: true,
        // currentMedications: true,
        createdAt: true,
        // Don't return password
      },
      orderBy: { createdAt: "desc" }
    })
    
    await createAuditLog(session.user.id, "VIEW_USERS", { role }, req)
    
    return NextResponse.json({
      success: true,
      data: users,
      count: users.length
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch users" },
      { status: 500 }
    )
  }
})

export const POST = withAuth(["ADMIN"])(async (req: Request, session: any) => {
  try {
    const data = await req.json()
    
    // Validate required fields (password is no longer required as it will be generated)
    if (!data.email || !data.name || !data.role) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: email, name, and role" },
        { status: 400 }
      )
    }

    // Additional validation for students
    if (data.role === "STUDENT" && !data.studentId) {
      return NextResponse.json(
        { success: false, error: "Student ID is required for students" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "User with this email already exists" },
        { status: 409 }
      )
    }

    // Check if student ID already exists (for students)
    if (data.role === "STUDENT" && data.studentId) {
      const existingStudent = await prisma.user.findUnique({
        where: { studentId: data.studentId }
      })

      if (existingStudent) {
        return NextResponse.json(
          { success: false, error: "Student ID already exists" },
          { status: 409 }
        )
      }
    }

    // Generate a random strong password
    const generatedPassword = generateRandomPassword(12)
    
    // Hash password
    const hashedPassword = await bcrypt.hash(generatedPassword, 12)
    
    // Prepare user data
    const userData: any = {
      email: data.email,
      name: data.name,
      password: hashedPassword,
      role: data.role,
      phone: data.phone,
    }

    // Add student-specific fields
    if (data.role === "STUDENT") {
      userData.studentId = data.studentId
      if (data.height) userData.height = parseFloat(data.height)
      if (data.weight) userData.weight = parseFloat(data.weight)
      if (data.bloodGroup) userData.bloodGroup = data.bloodGroup
      if (data.pastMedicalHistory) userData.pastMedicalHistory = data.pastMedicalHistory
      if (data.currentMedications) userData.currentMedications = data.currentMedications
    } else if (data.role === "DOCTOR") {
      // Add doctor-specific fields if needed in the future
      userData.studentId = null
    } else {
      // Admin or other roles
      userData.studentId = null
    }
    
    const user = await prisma.user.create({
      data: userData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        studentId: true,
        phone: true,
        // height: true,
        // weight: true,
        // bloodGroup: true,
        // pastMedicalHistory: true,
        // currentMedications: true,
        createdAt: true
      }
    })
    
    // Send password email to the user
    try {
      await sendPasswordEmail(
        user.email,
        user.name,
        user.studentId || user.email, // Use studentId for students, email for others
        generatedPassword
      )
    } catch (emailError) {
      console.error("Error sending password email:", emailError)
      // Don't fail the user creation if email fails, but log it
      await createAuditLog(
        session.user.id,
        "EMAIL_SEND_FAILED",
        {
          userId: user.id,
          email: user.email,
          error: emailError instanceof Error ? emailError.message : "Unknown error"
        },
        req
      )
    }
    
    await createAuditLog(
      session.user.id, 
      "CREATE_USER", 
      { 
        userId: user.id, 
        role: user.role,
        email: user.email,
        studentId: user.studentId 
      }, 
      req
    )
    
    return NextResponse.json({
      success: true,
      data: user,
      message: `${data.role.toLowerCase().charAt(0).toUpperCase() + data.role.toLowerCase().slice(1)} created successfully. Password has been sent to ${user.email}`
    })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create user" },
      { status: 500 }
    )
  }
})
