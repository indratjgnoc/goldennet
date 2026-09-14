import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/session';
import { createAuditLog } from '@/lib/audit';

const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN'] as const;

function isAdminRole(role: string) {
  return ADMIN_ROLES.includes(
    role as (typeof ADMIN_ROLES)[number],
  );
}

function parseId(value: string) {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return id;
}

function cleanString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

const STATUS_VALUES = [
  'PENDING',
  'ACTIVE',
  'SUSPENDED',
  'TERMINATED',
] as const;

type SubscriptionStatus =
  (typeof STATUS_VALUES)[number];

function isValidStatus(
  value: unknown,
): value is SubscriptionStatus {
  return (
    typeof value === 'string' &&
    STATUS_VALUES.includes(
      value as SubscriptionStatus,
    )
  );
}

/**
 * Validasi perpindahan status subscription.
 *
 * PENDING
 *   └── ACTIVE
 *   └── TERMINATED
 *
 * ACTIVE
 *   └── SUSPENDED
 *   └── TERMINATED
 *
 * SUSPENDED
 *   └── ACTIVE
 *   └── TERMINATED
 *
 * TERMINATED
 *   └── tidak bisa berubah lagi
 */
function isAllowedTransition(
  current: SubscriptionStatus,
  next: SubscriptionStatus,
) {
  if (current === next) {
    return true;
  }

  const transitions: Record<
    SubscriptionStatus,
    SubscriptionStatus[]
  > = {
    PENDING: ['ACTIVE', 'TERMINATED'],
    ACTIVE: ['SUSPENDED', 'TERMINATED'],
    SUSPENDED: ['ACTIVE', 'TERMINATED'],
    TERMINATED: [],
  };

  return transitions[current].includes(next);
}

/**
 * GET /api/subscriptions/[id]
 *
 * Detail subscription.
 */
export async function GET(
  _request: Request,
  context: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Anda harus login.',
        },
        { status: 401 },
      );
    }

    if (!isAdminRole(user.role)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Anda tidak memiliki akses.',
        },
        { status: 403 },
      );
    }

    const { id: idParam } = await context.params;
    const id = parseId(idParam);

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: 'ID subscription tidak valid.',
        },
        { status: 400 },
      );
    }

    const subscription =
      await prisma.subscription.findUnique({
        where: {
          id,
        },
        include: {
          customer: {
            select: {
              id: true,
              customerCode: true,
              name: true,
              phone: true,
              email: true,
              address: true,
              status: true,
            },
          },
          package: {
            select: {
              id: true,
              name: true,
              code: true,
              speed: true,
              price: true,
              description: true,
              isPopular: true,
              isActive: true,
            },
          },
        },
      });

    if (!subscription) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Subscription tidak ditemukan.',
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message:
          'Detail subscription berhasil diambil.',
        data: {
          id: subscription.id,
          subscriptionCode:
            subscription.subscriptionCode,
          status: subscription.status,
          startDate: subscription.startDate,
          endDate: subscription.endDate,
          createdAt: subscription.createdAt,
          updatedAt: subscription.updatedAt,
          customer: subscription.customer,
          package: {
            ...subscription.package,
            price: Number(
              subscription.package.price,
            ),
          },
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(
      'GET /api/subscriptions/[id] error:',
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          'Gagal mengambil detail subscription.',
      },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/subscriptions/[id]
 *
 * Update subscription.
 */
export async function PATCH(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Anda harus login.',
        },
        { status: 401 },
      );
    }

    if (!isAdminRole(user.role)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Anda tidak memiliki akses.',
        },
        { status: 403 },
      );
    }

    const { id: idParam } = await context.params;
    const id = parseId(idParam);

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: 'ID subscription tidak valid.',
        },
        { status: 400 },
      );
    }

    const existing =
      await prisma.subscription.findUnique({
        where: {
          id,
        },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
            },
          },
          package: {
            select: {
              id: true,
              name: true,
              price: true,
              isActive: true,
            },
          },
        },
      });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Subscription tidak ditemukan.',
        },
        { status: 404 },
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: 'Format JSON tidak valid.',
        },
        { status: 400 },
      );
    }

    if (
      !body ||
      typeof body !== 'object' ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: 'Format data tidak valid.',
        },
        { status: 400 },
      );
    }

    const data =
      body as Record<string, unknown>;

    // ==========================================
    // KODE SUBSCRIPTION
    // ==========================================

    let subscriptionCode =
      existing.subscriptionCode;

    if (
      data.subscriptionCode !== undefined
    ) {
      subscriptionCode = cleanString(
        data.subscriptionCode,
      ).toUpperCase();

      if (subscriptionCode.length < 3) {
        return NextResponse.json(
          {
            success: false,
            message:
              'Kode subscription minimal 3 karakter.',
          },
          { status: 400 },
        );
      }

      if (subscriptionCode.length > 50) {
        return NextResponse.json(
          {
            success: false,
            message:
              'Kode subscription maksimal 50 karakter.',
          },
          { status: 400 },
        );
      }

      if (
        !/^[A-Z0-9_-]+$/.test(
          subscriptionCode,
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              'Kode subscription hanya boleh berisi huruf, angka, underscore, atau tanda strip.',
          },
          { status: 400 },
        );
      }

      if (
        subscriptionCode !==
        existing.subscriptionCode
      ) {
        const duplicate =
          await prisma.subscription.findUnique({
            where: {
              subscriptionCode,
            },
            select: {
              id: true,
            },
          });

        if (
          duplicate &&
          duplicate.id !== existing.id
        ) {
          return NextResponse.json(
            {
              success: false,
              message:
                'Kode subscription sudah digunakan.',
            },
            { status: 409 },
          );
        }
      }
    }

    // ==========================================
    // CUSTOMER
    // ==========================================

    let customerId =
      existing.customerId;

    if (data.customerId !== undefined) {
      const parsedCustomerId =
        parseId(String(data.customerId));

      if (!parsedCustomerId) {
        return NextResponse.json(
          {
            success: false,
            message:
              'ID pelanggan tidak valid.',
          },
          { status: 400 },
        );
      }

      const customer =
        await prisma.customer.findUnique({
          where: {
            id: parsedCustomerId,
          },
          select: {
            id: true,
            name: true,
          },
        });

      if (!customer) {
        return NextResponse.json(
          {
            success: false,
            message:
              'Pelanggan tidak ditemukan.',
          },
          { status: 404 },
        );
      }

      customerId = parsedCustomerId;
    }

    // ==========================================
    // PACKAGE
    // ==========================================

    let packageId =
      existing.packageId;

    if (data.packageId !== undefined) {
      const parsedPackageId =
        parseId(String(data.packageId));

      if (!parsedPackageId) {
        return NextResponse.json(
          {
            success: false,
            message:
              'ID paket internet tidak valid.',
          },
          { status: 400 },
        );
      }

      const internetPackage =
        await prisma.internetPackage.findUnique({
          where: {
            id: parsedPackageId,
          },
          select: {
            id: true,
            name: true,
            isActive: true,
          },
        });

      if (!internetPackage) {
        return NextResponse.json(
          {
            success: false,
            message:
              'Paket internet tidak ditemukan.',
          },
          { status: 404 },
        );
      }

      if (!internetPackage.isActive) {
        return NextResponse.json(
          {
            success: false,
            message:
              'Paket internet sedang tidak aktif.',
          },
          { status: 400 },
        );
      }

      packageId = parsedPackageId;
    }

    // ==========================================
    // STATUS
    // ==========================================

    let nextStatus: SubscriptionStatus =
      existing.status;

    if (data.status !== undefined) {
      if (!isValidStatus(data.status)) {
        return NextResponse.json(
          {
            success: false,
            message:
              'Status subscription tidak valid.',
          },
          { status: 400 },
        );
      }

      nextStatus = data.status;

      if (
        !isAllowedTransition(
          existing.status,
          nextStatus,
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              `Perubahan status ${existing.status} → ${nextStatus} tidak diperbolehkan.`,
          },
          { status: 400 },
        );
      }
    }

    // ==========================================
    // TANGGAL
    // ==========================================

    let startDate =
      existing.startDate;

    let endDate =
      existing.endDate;

    if (data.startDate !== undefined) {
      const value = cleanString(
        data.startDate,
      );

      if (!value) {
        startDate = null;
      } else {
        const parsed = new Date(value);

        if (
          Number.isNaN(
            parsed.getTime(),
          )
        ) {
          return NextResponse.json(
            {
              success: false,
              message:
                'Tanggal mulai tidak valid.',
            },
            { status: 400 },
          );
        }

        startDate = parsed;
      }
    }

    if (data.endDate !== undefined) {
      const value = cleanString(
        data.endDate,
      );

      if (!value) {
        endDate = null;
      } else {
        const parsed = new Date(value);

        if (
          Number.isNaN(
            parsed.getTime(),
          )
        ) {
          return NextResponse.json(
            {
              success: false,
              message:
                'Tanggal berakhir tidak valid.',
            },
            { status: 400 },
          );
        }

        endDate = parsed;
      }
    }

    if (
      startDate &&
      endDate &&
      endDate < startDate
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Tanggal berakhir tidak boleh lebih awal dari tanggal mulai.',
        },
        { status: 400 },
      );
    }

    // ==========================================
    // UPDATE
    // ==========================================

    const updated =
      await prisma.subscription.update({
        where: {
          id,
        },
        data: {
          subscriptionCode,
          customerId,
          packageId,
          status: nextStatus,
          startDate,
          endDate,
        },
        include: {
          customer: {
            select: {
              id: true,
              customerCode: true,
              name: true,
              phone: true,
              email: true,
              address: true,
              status: true,
            },
          },
          package: {
            select: {
              id: true,
              name: true,
              code: true,
              speed: true,
              price: true,
              description: true,
              isPopular: true,
              isActive: true,
            },
          },
        },
      });

    // ==========================================
    // AUDIT
    // ==========================================

    const changes: string[] = [];

    if (
      existing.subscriptionCode !==
      updated.subscriptionCode
    ) {
      changes.push(
        `kode ${existing.subscriptionCode} → ${updated.subscriptionCode}`,
      );
    }

    if (
      existing.customerId !==
      updated.customerId
    ) {
      changes.push(
        `pelanggan ID ${existing.customerId} → ${updated.customerId}`,
      );
    }

    if (
      existing.packageId !==
      updated.packageId
    ) {
      changes.push(
        `paket ID ${existing.packageId} → ${updated.packageId}`,
      );
    }

    if (
      existing.status !==
      updated.status
    ) {
      changes.push(
        `status ${existing.status} → ${updated.status}`,
      );
    }

    if (
      String(existing.startDate) !==
      String(updated.startDate)
    ) {
      changes.push('tanggal mulai diubah');
    }

    if (
      String(existing.endDate) !==
      String(updated.endDate)
    ) {
      changes.push('tanggal berakhir diubah');
    }

    await createAuditLog({
      userId: user.id,
      action: 'UPDATE',
      entity: 'Subscription',
      entityId: updated.id,
      description:
        changes.length > 0
          ? `Memperbarui subscription ${updated.subscriptionCode}: ${changes.join(', ')}.`
          : `Memperbarui subscription ${updated.subscriptionCode}.`,
      ipAddress:
        request.headers.get(
          'x-forwarded-for',
        ) ??
        request.headers.get(
          'x-real-ip',
        ) ??
        null,
      userAgent:
        request.headers.get(
          'user-agent',
        ) ?? null,
    });

    return NextResponse.json(
      {
        success: true,
        message:
          'Subscription berhasil diperbarui.',
        data: {
          id: updated.id,
          subscriptionCode:
            updated.subscriptionCode,
          status: updated.status,
          startDate: updated.startDate,
          endDate: updated.endDate,
          customer: updated.customer,
          package: {
            ...updated.package,
            price: Number(
              updated.package.price,
            ),
          },
          createdAt: updated.createdAt,
          updatedAt: updated.updatedAt,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(
      'PATCH /api/subscriptions/[id] error:',
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          'Terjadi kesalahan pada server.',
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/subscriptions/[id]
 *
 * Subscription tidak benar-benar dihapus.
 *
 * Karena subscription merupakan histori
 * pelanggan, DELETE digunakan sebagai
 * terminate subscription.
 */
export async function DELETE(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Anda harus login.',
        },
        { status: 401 },
      );
    }

    if (!isAdminRole(user.role)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Anda tidak memiliki akses.',
        },
        { status: 403 },
      );
    }

    const { id: idParam } = await context.params;
    const id = parseId(idParam);

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: 'ID subscription tidak valid.',
        },
        { status: 400 },
      );
    }

    const existing =
      await prisma.subscription.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
          subscriptionCode: true,
          status: true,
          customer: {
            select: {
              name: true,
            },
          },
        },
      });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Subscription tidak ditemukan.',
        },
        { status: 404 },
      );
    }

    if (
      existing.status ===
      'TERMINATED'
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Subscription sudah berstatus TERMINATED.',
        },
        { status: 400 },
      );
    }

    const updated =
      await prisma.subscription.update({
        where: {
          id,
        },
        data: {
          status: 'TERMINATED',
        },
        select: {
          id: true,
          subscriptionCode: true,
          status: true,
          updatedAt: true,
        },
      });

    await createAuditLog({
      userId: user.id,
      action: 'TERMINATE',
      entity: 'Subscription',
      entityId: updated.id,
      description:
        `Mengakhiri subscription ${updated.subscriptionCode} milik ${existing.customer.name}.`,
      ipAddress:
        request.headers.get(
          'x-forwarded-for',
        ) ??
        request.headers.get(
          'x-real-ip',
        ) ??
        null,
      userAgent:
        request.headers.get(
          'user-agent',
        ) ?? null,
    });

    return NextResponse.json(
      {
        success: true,
        message:
          'Subscription berhasil diakhiri.',
        data: updated,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(
      'DELETE /api/subscriptions/[id] error:',
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          'Terjadi kesalahan pada server.',
      },
      { status: 500 },
    );
  }
}