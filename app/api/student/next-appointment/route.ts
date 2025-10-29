import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const now = new Date()

    // Find the next upcoming appointment for this student
    const nextAppointment = await prisma.appointment.findFirst({
      where: {
        studentId: session.user.id,
        date: {
          gte: now
        },
        status: {
          in: ['PENDING', 'CONFIRMED']
        }
      },
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
        date: 'asc'
      }
    })

    if (!nextAppointment) {
      return NextResponse.json({ 
        success: true, 
        data: null,
        message: 'No upcoming appointments found' 
      })
    }

    return NextResponse.json({
      success: true,
      data: nextAppointment
    })
  } catch (error) {
    console.error('Error fetching next appointment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
