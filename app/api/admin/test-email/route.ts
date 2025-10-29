import { NextResponse } from "next/server"
import { withAuth } from "@/lib/rbac"
import { testEmailConnection } from "@/lib/email"

export const GET = withAuth(["ADMIN"])(async (req: Request, session: any) => {
  try {
    const isEmailConfigured = await testEmailConnection()
    
    return NextResponse.json({
      success: true,
      emailConfigured: isEmailConfigured,
      message: isEmailConfigured 
        ? "Email service is properly configured" 
        : "Email service configuration needs attention"
    })
  } catch (error) {
    console.error("Error testing email configuration:", error)
    return NextResponse.json({
      success: false,
      emailConfigured: false,
      error: "Failed to test email configuration"
    }, { status: 500 })
  }
})