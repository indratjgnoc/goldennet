import { prisma } from '@/lib/prisma';

type AuditLogInput = {
  userId?: number | null;
  action: string;
  entity?: string | null;
  entityId?: string | number | null;
  description?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export async function createAuditLog(
  input: AuditLogInput,
) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: input.userId ?? null,
        action: input.action,
        entity: input.entity ?? null,
        entityId:
          input.entityId !== undefined &&
          input.entityId !== null
            ? String(input.entityId)
            : null,
        description: input.description ?? null,
        ipAddress: input.ipAddress ?? null,
        userAgent: input.userAgent ?? null,
      },
    });
  } catch (error) {
    console.error('AUDIT LOG ERROR:', error);
  }
}