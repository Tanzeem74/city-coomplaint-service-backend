import prisma from "../lib/prisma";

interface AuditLogPayload {
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: string;
}

export const createAuditLog = async (payload: AuditLogPayload) => {
  return prisma.auditLog.create({
    data: {
      userId: payload.userId,
      action: payload.action,
      entityType: payload.entityType,
      entityId: payload.entityId,
      details: payload.details,
    },
  });
};
