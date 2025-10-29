import { getServerSession } from "next-auth"
import { authOptions } from "./auth"
import { NextResponse } from "next/server"
import { createAuditLog } from "./audit"

export function withAuth(allowedRoles?: string[]) {
  return function(
    handler: (req: Request, session: any, context?: any) => Promise<Response>
  ) {
    return async function(req: Request, context?: any) {
      try {
        const session = await getServerSession(authOptions)
        
        if (!session || !session.user) {
          return NextResponse.json(
            { error: "Unauthorized - Please login" }, 
            { status: 401 }
          )
        }
        
        if (allowedRoles && !allowedRoles.includes(session.user.role)) {
          return NextResponse.json(
            { error: "Forbidden - Insufficient permissions" }, 
            { status: 403 }
          )
        }
        
        // Log the API access
        await createAuditLog(
          session.user.id, 
          `API_ACCESS_${req.method}`, 
          { url: req.url, role: session.user.role }, 
          req
        )
        
        return await handler(req, session, context)
      } catch (error) {
        console.error("Auth middleware error:", error)
        return NextResponse.json(
          { error: "Internal server error" }, 
          { status: 500 }
        )
      }
    }
  }
}

export async function requireRole(roles: string[]) {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user) {
    throw new Error("Unauthorized")
  }
  
  if (!roles.includes(session.user.role)) {
    throw new Error("Forbidden")
  }
  
  return session
}

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  return session?.user || null
}
