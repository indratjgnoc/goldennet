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

function parsePositiveNumber(value: unknown) {
  const number = Number(value);

  if (!Number.isFinite(number) || number <= 0) {
    return null;
  }

  return number;
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

export async function GET(request: Request) {
  try {
    const adminMode =
      new URL(request.url).searchParams.get('admin') === 'true';

    if (adminMode) {
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

      const packages = await prisma.internetPackage.findMany({
        orderBy: [
          {
            isPopular: 'desc',
          },
          {
            speed: 'asc',
          },
          {
            name: 'asc',
          },
        ],
      });

      const data = packages.map((item) => ({
        id: item.id,
        name: item.name,
        code: item.code,
        speed: item.speed,
        price: Number(item.price),
        description: item.description,
        isPopular: item.isPopular,
        isActive: item.isActive,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }));

      return NextResponse.json(
        {
          success: true,
          message: 'Data paket berhasil diambil.',
          data,
        },
        {
          status: 200,
          headers: {
            'Cache-Control': 'no-store',
          },
        },
      );
    }

    // ==============================
    // PUBLIC GET
    // ==============================

    const packages = await prisma.internetPackage.findMany({
      where: {
        isActive: true,
      },
      orderBy: [
        {
          isPopular: 'desc',
        },
        {
          speed: 'asc',
        },
      ],
      select: {
        id: true,
        name: true,
        code: true,
        speed: true,
        price: true,
        description: true,
        isPopular: true,
      },
    });

    const data = packages.map((item) => ({
      id: item.id,
      name: item.name,
      code: item.code,
      speed: item.speed,
      price: Number(item.price),
      description: item.description,
      isPopular: item.isPopular,
    }));

    return NextResponse.json(
      {
        success: true,
        message: 'Data paket berhasil diambil.',
        data,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=60, s-maxage=60',
        },
      },
    );
  } catch (error) {
    console.error('GET /api/packages error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Gagal mengambil data paket.',
        data: null,
      },
      {
        status: 500,
      },
    );
  }
}

/**
 * POST /api/packages
 *
 * Admin membuat paket internet baru.
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
        {
          status: 401,
        },
      );
    }

    if (!isAdminRole(user.role)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Anda tidak memiliki akses.',
        },
        {
          status: 403,
        },
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
        {
          status: 400,
        },
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
        {
          status: 400,
        },
      );
    }

    const data = body as Record<string, unknown>;

    const name = cleanString(data.name);
    const code = cleanString(data.code).toUpperCase();
    const description = cleanString(data.description);

    const speed = parsePositiveInteger(data.speed);
    const price = parsePositiveNumber(data.price);

    const isPopular =
      typeof data.isPopular === 'boolean'
        ? data.isPopular
        : false;

    const isActive =
      typeof data.isActive === 'boolean'
        ? data.isActive
        : true;

    if (name.length < 3) {
      return NextResponse.json(
        {
          success: false,
          message: 'Nama paket minimal 3 karakter.',
        },
        {
          status: 400,
        },
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        {
          success: false,
          message: 'Nama paket maksimal 100 karakter.',
        },
        {
          status: 400,
        },
      );
    }

    if (!/^[A-Z0-9_-]{2,30}$/.test(code)) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Kode paket hanya boleh berisi huruf, angka, underscore, atau tanda strip.',
        },
        {
          status: 400,
        },
      );
    }

    if (!speed) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Kecepatan internet harus lebih dari 0 Mbps.',
        },
        {
          status: 400,
        },
      );
    }

    if (speed > 10000) {
      return NextResponse.json(
        {
          success: false,
          message: 'Kecepatan internet terlalu besar.',
        },
        {
          status: 400,
        },
      );
    }

    if (price === null) {
      return NextResponse.json(
        {
          success: false,
          message: 'Harga paket tidak valid.',
        },
        {
          status: 400,
        },
      );
    }

    if (price > 999999999999) {
      return NextResponse.json(
        {
          success: false,
          message: 'Harga paket terlalu besar.',
        },
        {
          status: 400,
        },
      );
    }

    if (description.length > 1000) {
      return NextResponse.json(
        {
          success: false,
          message: 'Deskripsi maksimal 1000 karakter.',
        },
        {
          status: 400,
        },
      );
    }

    const existing =
      await prisma.internetPackage.findUnique({
        where: {
          code,
        },
        select: {
          id: true,
        },
      });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: 'Kode paket sudah digunakan.',
        },
        {
          status: 409,
        },
      );
    }

    const internetPackage =
      await prisma.internetPackage.create({
        data: {
          name,
          code,
          speed,
          price,
          description: description || null,
          isPopular,
          isActive,
        },
      });

    await createAuditLog({
      userId: user.id,
      action: 'CREATE',
      entity: 'InternetPackage',
      entityId: internetPackage.id,
      description:
        `Membuat paket internet ${internetPackage.name} (${internetPackage.code}).`,
      ipAddress:
        request.headers.get('x-forwarded-for') ??
        request.headers.get('x-real-ip') ??
        null,
      userAgent:
        request.headers.get('user-agent') ?? null,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Paket internet berhasil ditambahkan.',
        data: {
          ...internetPackage,
          price: Number(internetPackage.price),
        },
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error('POST /api/packages error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Terjadi kesalahan pada server.',
      },
      {
        status: 500,
      },
    );
  }
}