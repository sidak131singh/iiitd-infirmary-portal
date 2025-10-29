import { NextResponse } from "next/server"
import { withAuth } from "@/lib/rbac"
import { prisma } from "@/lib/prisma"
import { createAuditLog } from "@/lib/audit"

export const GET = withAuth(["ADMIN"])(async (req: Request, session: any) => {
  try {
    // Get all medications with their details
    const medications = await prisma.medicine.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        quantity: true,
        threshold: true,
        dosage: true,
        price: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { name: "asc" }
    })

    const totalMedicines = medications.length
    const lowStockItems = medications.filter(med => med.quantity <= med.threshold).length

    await createAuditLog(session.user.id, "VIEW_PHARMACY_ITEMS", { total: totalMedicines, lowStock: lowStockItems }, req)

    return NextResponse.json({
      success: true,
      data: {
        medications,
        totalMedicines,
        lowStockItems,
        summary: `${lowStockItems} low stock items`
      }
    })
  } catch (error) {
    console.error("Error fetching pharmacy items:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch pharmacy items" },
      { status: 500 }
    )
  }
})

export const POST = withAuth(["ADMIN"])(async (req: Request, session: any) => {
  try {
    const data = await req.json()
    
    // Validate required fields
    if (!data.name || !data.category || data.quantity === undefined || data.threshold === undefined) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Create new medication
    const medication = await prisma.medicine.create({
      data: {
        name: data.name,
        category: data.category,
        quantity: parseInt(data.quantity),
        threshold: parseInt(data.threshold),
        dosage: data.dosage || "N/A", // Default dosage if not provided
        price: data.price ? parseFloat(data.price) : 0.0,
      },
      select: {
        id: true,
        name: true,
        category: true,
        quantity: true,
        threshold: true,
        dosage: true,
        price: true,
        createdAt: true,
      }
    })

    await createAuditLog(
      session.user.id, 
      "CREATE_MEDICATION", 
      { 
        medicationId: medication.id,
        name: medication.name,
        category: medication.category 
      }, 
      req
    )

    return NextResponse.json({
      success: true,
      data: medication,
      message: "Medication added successfully"
    })
  } catch (error) {
    console.error("Error creating medication:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create medication" },
      { status: 500 }
    )
  }
})