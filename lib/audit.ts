import { prisma } from "./prisma"

export async function createAuditLog(
  userId: string,
  action: string,
  details?: any,
  req?: Request
) {
  try {
    const ipAddress = req?.headers.get('x-forwarded-for') || 
                      req?.headers.get('x-real-ip') || 
                      'unknown'
    
    const userAgent = req?.headers.get('user-agent') || 'unknown'

    await prisma.auditLog.create({
      data: {
        userId,
        action,
        details: details ? JSON.parse(JSON.stringify(details)) : null,
        ipAddress,
        userAgent
      }
    })
  } catch (error) {
    console.error("Failed to create audit log:", error)
  }
}

export async function getAuditLogs(
  userId?: string,
  action?: string,
  limit: number = 50
) {
  const where: any = {}
  
  if (userId) where.userId = userId
  if (action) where.action = action

  return await prisma.auditLog.findMany({
    where,
    include: {
      user: {
        select: {
          name: true,
          email: true,
          role: true
        }
      }
    },
    orderBy: { timestamp: 'desc' },
    take: limit
  })
}
