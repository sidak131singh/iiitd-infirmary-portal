import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'DOCTOR') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const appointmentId = params.id

    const appointment = await prisma.appointment.findUnique({
      where: {
        id: appointmentId,
        doctorId: session.user.id // Ensure doctor can only view their own appointments
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            studentId: true,
            phone: true,
            height: true,
            weight: true,
            bloodGroup: true,
            pastMedicalHistory: true,
            currentMedications: true,
            createdAt: true
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
      }
    })

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    return NextResponse.json(appointment)
  } catch (error) {
    console.error('Error fetching appointment details:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}