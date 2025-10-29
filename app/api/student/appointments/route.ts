import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Fetch all appointments for the student
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const upcoming = searchParams.get('upcoming')

    // Build where clause
    const whereClause: any = {
      studentId: session.user.id
    }

    // Filter by status if provided
    if (status) {
      whereClause.status = status
    }

    // Filter by upcoming appointments if requested
    if (upcoming === 'true') {
      whereClause.date = {
        gte: new Date()
      }
      whereClause.status = {
        in: ['PENDING', 'CONFIRMED']
      }
    }

    // Fetch appointments
    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: appointments
    })
  } catch (error) {
    console.error('Error fetching appointments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Book a new appointment
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await request.json()
    const { doctorId, date, timeSlot, reason } = body

    // Validate required fields
    if (!doctorId || !date || !timeSlot || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields: doctorId, date, timeSlot, reason' },
        { status: 400 }
      )
    }

    // Validate date is in the future
    const appointmentDate = new Date(date)
    if (appointmentDate < new Date()) {
      return NextResponse.json(
        { error: 'Appointment date must be in the future' },
        { status: 400 }
      )
    }

    // Check if doctor exists
    const doctor = await prisma.user.findUnique({
      where: { id: doctorId }
    })

    if (!doctor || doctor.role !== 'DOCTOR') {
      return NextResponse.json(
        { error: 'Invalid doctor ID' },
        { status: 400 }
      )
    }

    // Check if the time slot is already booked
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        doctorId,
        date: appointmentDate,
        timeSlot,
        status: {
          in: ['PENDING', 'CONFIRMED']
        }
      }
    })

    if (existingAppointment) {
      return NextResponse.json(
        { error: 'This time slot is already booked. Please choose another time.' },
        { status: 409 }
      )
    }

    // Create the appointment
    const appointment = await prisma.appointment.create({
      data: {
        studentId: session.user.id,
        doctorId,
        date: appointmentDate,
        timeSlot,
        reason,
        status: 'PENDING'
      },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Appointment booked successfully',
      data: appointment
    }, { status: 201 })
  } catch (error) {
    console.error('Error booking appointment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
