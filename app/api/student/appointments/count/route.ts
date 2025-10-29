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

    // Get total count of all appointments
    const totalCount = await prisma.appointment.count({
      where: {
        studentId: session.user.id
      }
    })

    // Get count by status
    const pendingCount = await prisma.appointment.count({
      where: {
        studentId: session.user.id,
        status: 'PENDING'
      }
    })

    const confirmedCount = await prisma.appointment.count({
      where: {
        studentId: session.user.id,
        status: 'CONFIRMED'
      }
    })

    const completedCount = await prisma.appointment.count({
      where: {
        studentId: session.user.id,
        status: 'COMPLETED'
      }
    })

    const cancelledCount = await prisma.appointment.count({
      where: {
        studentId: session.user.id,
        status: 'CANCELLED'
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        total: totalCount,
        pending: pendingCount,
        confirmed: confirmedCount,
        completed: completedCount,
        cancelled: cancelledCount
      }
    })
  } catch (error) {
    console.error('Error fetching appointment count:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
