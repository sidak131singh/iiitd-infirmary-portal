import { NextResponse } from "next/server"
import { withAuth } from "@/lib/rbac"
import { prisma } from "@/lib/prisma"
import { createAuditLog } from "@/lib/audit"

export const GET = withAuth(["STUDENT", "DOCTOR", "ADMIN"])(async (req: Request, session: any) => {
  try {
    const { searchParams } = new URL(req.url)
    const date = searchParams.get("date")
    const status = searchParams.get("status")
    const doctorId = searchParams.get("doctorId")
    
    let where: any = {}
    
    // Role-based filtering
    if (session.user.role === "STUDENT") {
      where.studentId = session.user.id
    } else if (session.user.role === "DOCTOR") {
      where.doctorId = session.user.id
    }
    // ADMIN can see all appointments or filter by specific doctorId
    
    // Allow ADMIN to override doctorId filter
    if (session.user.role === "ADMIN" && doctorId) {
      where.doctorId = doctorId
    }
    
    if (date) {
      const startDate = new Date(date)
      const endDate = new Date(date)
      endDate.setDate(endDate.getDate() + 1)
      
      where.date = {
        gte: startDate,
        lt: endDate
      }
    }
    
    if (status) {
      where.status = status
    }
    
    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        student: { 
          select: { 
            id: true,
            name: true, 
            studentId: true, 
            email: true,
            phone: true 
          } 
        },
        doctor: { 
          select: { 
            id: true,
            name: true, 
            email: true 
          } 
        },
        prescription: {
          include: {
            medications: {
              include: {
                medicine: true
              }
            }
          }
        }
      },
      orderBy: [
        { date: "asc" },
        { timeSlot: "asc" }
      ]
    })
    
    await createAuditLog(session.user.id, "VIEW_APPOINTMENTS", { date, status }, req)
    
    return NextResponse.json({
      success: true,
      data: appointments,
      count: appointments.length
    })
  } catch (error) {
    console.error("Error fetching appointments:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch appointments" },
      { status: 500 }
    )
  }
})

export const POST = withAuth(["STUDENT", "ADMIN"])(async (req: Request, session: any) => {
  try {
    const data = await req.json()
    
    // Validate required fields
    if (!data.date || !data.timeSlot || !data.reason || !data.doctorId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Check if doctor exists and has the DOCTOR role
    const doctor = await prisma.user.findFirst({
      where: {
        id: data.doctorId,
        role: "DOCTOR"
      }
    })

    if (!doctor) {
      return NextResponse.json(
        { success: false, error: "Invalid doctor selected" },
        { status: 400 }
      )
    }

    // Check doctor availability (not on leave)
    const appointmentDate = new Date(data.date)
    const doctorLeave = await prisma.doctorLeave.findFirst({
      where: {
        doctorId: data.doctorId,
        date: {
          gte: new Date(appointmentDate.toDateString()),
          lt: new Date(appointmentDate.getTime() + 24 * 60 * 60 * 1000)
        }
      }
    })

    if (doctorLeave) {
      return NextResponse.json(
        { success: false, error: "Doctor is not available on this date" },
        { status: 400 }
      )
    }

    // Check for conflicting appointments
    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        doctorId: data.doctorId,
        date: appointmentDate,
        timeSlot: data.timeSlot,
        status: {
          not: "CANCELLED"
        }
      }
    })

    if (conflictingAppointment) {
      return NextResponse.json(
        { success: false, error: "This time slot is already booked" },
        { status: 409 }
      )
    }

    const appointment = await prisma.appointment.create({
      data: {
        date: appointmentDate,
        timeSlot: data.timeSlot,
        reason: data.reason,
        notes: data.notes,
        studentId: session.user.role === "STUDENT" ? session.user.id : data.studentId,
        doctorId: data.doctorId,
        status: "PENDING"
      },
      include: {
        student: { 
          select: { 
            name: true, 
            studentId: true, 
            email: true 
          } 
        },
        doctor: { 
          select: { 
            name: true, 
            email: true 
          } 
        }
      }
    })
    
    await createAuditLog(
      session.user.id, 
      "CREATE_APPOINTMENT", 
      { 
        appointmentId: appointment.id,
        doctorId: appointment.doctorId,
        date: appointment.date,
        timeSlot: appointment.timeSlot
      }, 
      req
    )
    
    return NextResponse.json({
      success: true,
      data: appointment,
      message: "Appointment booked successfully"
    })
  } catch (error) {
    console.error("Error creating appointment:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create appointment" },
      { status: 500 }
    )
  }
})
