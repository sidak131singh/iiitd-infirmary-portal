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

    // Fetch student profile data
    const student = await prisma.user.findUnique({
      where: {
        id: session.user.id
      },
      select: {
        id: true,
        name: true,
        email: true,
        studentId: true,
        phone: true,
        bloodGroup: true,
        pastMedicalHistory: true,
        currentMedications: true,
        height: true,
        weight: true,
        createdAt: true
      }
    })

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: student
    })
  } catch (error) {
    console.error('Error fetching student profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await request.json()
    const { 
      name, 
      phone, 
      bloodGroup, 
      pastMedicalHistory, 
      currentMedications,
      height,
      weight
    } = body

    // Validate height and weight if provided
    if (height !== undefined && height !== null) {
      const heightNum = parseFloat(height)
      if (isNaN(heightNum) || heightNum <= 0 || heightNum > 300) {
        return NextResponse.json(
          { error: 'Invalid height value' },
          { status: 400 }
        )
      }
    }

    if (weight !== undefined && weight !== null) {
      const weightNum = parseFloat(weight)
      if (isNaN(weightNum) || weightNum <= 0 || weightNum > 500) {
        return NextResponse.json(
          { error: 'Invalid weight value' },
          { status: 400 }
        )
      }
    }

    // Validate blood group if provided
    const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown']
    if (bloodGroup && !validBloodGroups.includes(bloodGroup)) {
      return NextResponse.json(
        { error: 'Invalid blood group' },
        { status: 400 }
      )
    }

    // Build update data object (only include provided fields)
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (phone !== undefined) updateData.phone = phone
    if (bloodGroup !== undefined) updateData.bloodGroup = bloodGroup
    if (pastMedicalHistory !== undefined) updateData.pastMedicalHistory = pastMedicalHistory
    if (currentMedications !== undefined) updateData.currentMedications = currentMedications
    if (height !== undefined) updateData.height = height ? parseFloat(height) : null
    if (weight !== undefined) updateData.weight = weight ? parseFloat(weight) : null

    // Update student profile
    const student = await prisma.user.update({
      where: {
        id: session.user.id
      },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        studentId: true,
        phone: true,
        bloodGroup: true,
        pastMedicalHistory: true,
        currentMedications: true,
        height: true,
        weight: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: student
    })
  } catch (error) {
    console.error('Error updating student profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  // PATCH method uses the same logic as PUT for partial updates
  return PUT(request)
}
