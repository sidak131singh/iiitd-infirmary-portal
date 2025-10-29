import { NextResponse } from "next/server"
import { withAuth } from "@/lib/rbac"
import { prisma } from "@/lib/prisma"
import { createAuditLog } from "@/lib/audit"

export const PATCH = withAuth(["ADMIN"])(async (req: Request, session: any, context: any) => {
  try {
    const data = await req.json()
    const medicationId = context.params.id
    
    if (!medicationId) {
      return NextResponse.json(
        { success: false, error: "Medication ID is required" },
        { status: 400 }
      )
    }

    // Validate quantity
    if (data.quantity === undefined || data.quantity < 0) {
      return NextResponse.json(
        { success: false, error: "Valid quantity is required" },
        { status: 400 }
      )
    }

    // Update medication quantity
    const medication = await prisma.medicine.update({
      where: { id: medicationId },
      data: { quantity: parseInt(data.quantity) },
      select: {
        id: true,
        name: true,
        category: true,
        quantity: true,
        threshold: true,
        dosage: true,
        price: true,
      }
    })

    await createAuditLog(
      session.user.id, 
      "UPDATE_MEDICATION_QUANTITY", 
      { 
        medicationId: medication.id,
        name: medication.name,
        newQuantity: medication.quantity 
      }, 
      req
    )

    return NextResponse.json({
      success: true,
      data: medication,
      message: "Medication quantity updated successfully"
    })
  } catch (error) {
    console.error("Error updating medication:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update medication" },
      { status: 500 }
    )
  }
})