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

function parsePositiveInteger(value: unknown) {
  const number = Number(value);

  if (!Number.isInteger(number) || number <= 0) {
    return null;
  }

  return number;
}

function cleanString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

const SUBSCRIPTION_STATUSES = [
  'PENDING',
  'ACTIVE',
  'SUSPENDED',
  'TERMINATED',
] as const;

type SubscriptionStatus =
  (typeof SUBSCRIPTION_STATUSES)[number];

function isSubscriptionStatus(
  value: unknown,
): value is SubscriptionStatus {
  return (
    typeof value === 'string' &&
    SUBSCRIPTION_STATUSES.includes(
      value as SubscriptionStatus,
    )
  );
}

/**
 * GET /api/subscriptions
 *
 * Admin mengambil seluruh subscription.
 */
export async function GET() {
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

    const subscriptions =
      await prisma.subscription.findMany({
        orderBy: [
          {
            createdAt: 'desc',
          },
        ],
        include: {
          customer: {
            select: {
              id: true,
              customerCode: true,
              name: true,
              phone: true,
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
              isActive: true,
            },
          },
        },
      });

    const data = subscriptions.map((item) => ({
      id: item.id,
      subscriptionCode: item.subscriptionCode,

      status: item.status,

      startDate: item.startDate,
      endDate: item.endDate,

      createdAt: item.createdAt,
      updatedAt: item.updatedAt,

      customer: item.customer,

      package: {
        ...item.package,
        price: Number(item.package.price),
      },
    }));

    return NextResponse.json(
      {
        success: true,
        message:
          'Data subscription berhasil diambil.',
        data,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store',
        },
      },
    );
  } catch (error) {
    console.error(
      'GET /api/subscriptions error:',
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          'Gagal mengambil data subscription.',
        data: null,
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/subscriptions
 *
 * Admin membuat subscription baru.
 */
export async function POST(request: Request) {
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

    const customerId =
      parsePositiveInteger(data.customerId);

    const packageId =
      parsePositiveInteger(data.packageId);

    const subscriptionCode =
      cleanString(data.subscriptionCode)
        .toUpperCase();

    const status = data.status;

    const startDateValue =
      cleanString(data.startDate);

    const endDateValue =
      cleanString(data.endDate);

    // ==========================================
    // VALIDASI CUSTOMER
    // ==========================================

    if (!customerId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Pelanggan wajib dipilih.',
        },
        { status: 400 },
      );
    }

    // ==========================================
    // VALIDASI PACKAGE
    // ==========================================

    if (!packageId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Paket internet wajib dipilih.',
        },
        { status: 400 },
      );
    }

    // ==========================================
    // VALIDASI KODE
    // ==========================================

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

    // ==========================================
    // VALIDASI STATUS
    // ==========================================

    const subscriptionStatus =
      status === undefined
        ? 'PENDING'
        : status;

    if (
      !isSubscriptionStatus(
        subscriptionStatus,
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Status subscription tidak valid.',
        },
        { status: 400 },
      );
    }

    // ==========================================
    // VALIDASI TANGGAL
    // ==========================================

    let startDate: Date | null = null;
    let endDate: Date | null = null;

    if (startDateValue) {
      const parsed = new Date(
        startDateValue,
      );

      if (Number.isNaN(parsed.getTime())) {
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

    if (endDateValue) {
      const parsed = new Date(
        endDateValue,
      );

      if (Number.isNaN(parsed.getTime())) {
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
    // CEK CUSTOMER
    // ==========================================

    const customer =
      await prisma.customer.findUnique({
        where: {
          id: customerId,
        },
        select: {
          id: true,
          customerCode: true,
          name: true,
          status: true,
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

    // ==========================================
    // CEK PACKAGE
    // ==========================================

    const internetPackage =
      await prisma.internetPackage.findUnique({
        where: {
          id: packageId,
        },
        select: {
          id: true,
          name: true,
          code: true,
          speed: true,
          price: true,
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

    // ==========================================
    // CEK KODE DUPLIKAT
    // ==========================================

    const existing =
      await prisma.subscription.findUnique({
        where: {
          subscriptionCode,
        },
        select: {
          id: true,
        },
      });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Kode subscription sudah digunakan.',
        },
        { status: 409 },
      );
    }

    // ==========================================
    // CREATE
    // ==========================================

    const subscription =
      await prisma.subscription.create({
        data: {
          subscriptionCode,
          status: subscriptionStatus,
          startDate,
          endDate,
          customerId,
          packageId,
        },
        include: {
          customer: {
            select: {
              id: true,
              customerCode: true,
              name: true,
              phone: true,
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
              isActive: true,
            },
          },
        },
      });

    // ==========================================
    // AUDIT
    // ==========================================

    await createAuditLog({
      userId: user.id,
      action: 'CREATE',
      entity: 'Subscription',
      entityId: subscription.id,
      description:
        `Membuat subscription ${subscription.subscriptionCode} untuk pelanggan ${subscription.customer.name}.`,
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

    // ==========================================
    // RESPONSE
    // ==========================================

    return NextResponse.json(
      {
        success: true,
        message:
          'Subscription berhasil dibuat.',
        data: {
          id: subscription.id,
          subscriptionCode:
            subscription.subscriptionCode,
          status: subscription.status,
          startDate:
            subscription.startDate,
          endDate:
            subscription.endDate,

          customer:
            subscription.customer,

          package: {
            ...subscription.package,
            price: Number(
              subscription.package.price,
            ),
          },

          createdAt:
            subscription.createdAt,
          updatedAt:
            subscription.updatedAt,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      'POST /api/subscriptions error:',
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