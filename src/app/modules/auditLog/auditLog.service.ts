import prisma from "../../lib/prisma";

const getAuditLogs = async (query: Record<string, unknown>) => {
  const page = Math.max(Number(query.page) || 1, 1);

  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);

  const skip = (page - 1) * limit;

  const where: any = {};

  if (query.action) {
    where.action = String(query.action);
  }

  if (query.entityType) {
    where.entityType = String(query.entityType);
  }

  if (query.userId) {
    where.userId = String(query.userId);
  }

  const [data, total] = await prisma.$transaction([
    prisma.auditLog.findMany({
      where,
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.auditLog.count({
      where,
    }),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data,
  };
};

export const AuditLogService = {
  getAuditLogs,
};
