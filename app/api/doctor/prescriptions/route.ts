import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'DOCTOR') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await request.json()
    const { 
      appointmentId, 
      diagnosis, 
      notes, 
      medications 
    } = body

    // Validate required fields
    if (!appointmentId || !diagnosis) {
      return NextResponse.json(
        { error: 'Appointment ID and diagnosis are required' },
        { status: 400 }
      )
    }

    // Check if appointment exists and belongs to the doctor
    const appointment = await prisma.appointment.findUnique({
      where: {
        id: appointmentId,
        doctorId: session.user.id
      },
      include: {
        student: true
      }
    })

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found or access denied' },
        { status: 404 }
      )
    }

    // Check if prescription already exists for this appointment
    const existingPrescription = await prisma.prescription.findUnique({
      where: { appointmentId }
    })

    if (existingPrescription) {
      return NextResponse.json(
        { error: 'Prescription already exists for this appointment' },
        { status: 400 }
      )
    }

    // Create prescription with medications in a transaction
    const prescription = await prisma.$transaction(async (tx) => {
      // Create the prescription
      const newPrescription = await tx.prescription.create({
        data: {
          diagnosis,
          notes: notes || '',
          appointmentId,
          doctorId: session.user.id,
          studentId: appointment.studentId
        }
      })

      // Add medications if provided
      if (medications && Array.isArray(medications) && medications.length > 0) {
        const prescriptionMedications = await Promise.all(
          medications.map(async (med: any) => {
            // Validate medicine exists
            const medicine = await tx.medicine.findUnique({
              where: { id: med.medicineId }
            })

            if (!medicine) {
              throw new Error(`Medicine with ID ${med.medicineId} not found`)
            }

            return tx.prescriptionMedication.create({
              data: {
                prescriptionId: newPrescription.id,
                medicineId: med.medicineId,
                dosage: med.dosage,
                frequency: med.frequency,
                duration: med.duration,
                instructions: med.instructions || ''
              }
            })
          })
        )

        // Return prescription with medications
        return tx.prescription.findUnique({
          where: { id: newPrescription.id },
          include: {
            medications: {
              include: {
                medicine: true
              }
            },
            appointment: {
              include: {
                student: {
                  select: {
                    id: true,
                    name: true,
                    studentId: true
                  }
                }
              }
            }
          }
        })
      }

      // Return prescription without medications
      return tx.prescription.findUnique({
        where: { id: newPrescription.id },
        include: {
          appointment: {
            include: {
              student: {
                select: {
                  id: true,
                  name: true,
                  studentId: true
                }
              }
            }
          }
        }
      })
    })

    // Update appointment status to completed
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: 'COMPLETED' }
    })

    return NextResponse.json(prescription, { status: 201 })
  } catch (error) {
    console.error('Error creating prescription:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to fetch all medicines for prescription creation
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'DOCTOR') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const medicines = await prisma.medicine.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        dosage: true,
        quantity: true
      },
      where: {
        quantity: {
          gt: 0 // Only show medicines that are in stock
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(medicines)
  } catch (error) {
    console.error('Error fetching medicines:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}