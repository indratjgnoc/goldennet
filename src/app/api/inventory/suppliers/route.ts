import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/session';
import { createAuditLog } from '@/lib/audit';

const ALLOWED_ROLES = ['SUPER_ADMIN', 'ADMIN'];

const MAX_NAME_LENGTH = 150;
const MAX_CODE_LENGTH = 50;
const MAX_PHONE_LENGTH = 30;
const MAX_EMAIL_LENGTH = 254;
const MAX_ADDRESS_LENGTH = 500;
const MAX_CONTACT_LENGTH = 100;

function isAllowedRole(role: string) {
  return ALLOWED_ROLES.includes(role);
}

async function requireAdmin() {
  const user = await getCurrentUser();

  if (!user) {
    return {
      user: null,
      response: NextResponse.json(
        {
          message: 'Unauthorized',
        },
        { status: 401 },
      ),
    };
  }

  if (!isAllowedRole(user.role)) {
    return {
      user: null,
      response: NextResponse.json(
        {
          message: 'Forbidden',
        },
        { status: 403 },
      ),
    };
  }

  return {
    user,
    response: null,
  };
}

function normalizeString(value: unknown) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
}

function isValidEmail(email: string) {
  if (!email) {
    return true;
  }

  if (email.length > MAX_EMAIL_LENGTH) {
    return false;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidBoolean(value: unknown) {
  return typeof value === 'boolean';
}

/**
 * GET /api/inventory/suppliers
 *
 * Query:
 * ?search=
 * ?status=all|active|inactive
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin();

    if (auth.response) {
      return auth.response;
    }

    const searchParams = request.nextUrl.searchParams;

    const search = normalizeString(
      searchParams.get('search'),
    );

    const status =
      searchParams.get('status') ?? 'all';

    if (
      !['all', 'active', 'inactive'].includes(
        status,
      )
    ) {
      return NextResponse.json(
        {
          message:
            'Parameter status tidak valid.',
        },
        { status: 400 },
      );
    }

    const where = {
      ...(search
        ? {
            OR: [
              {
                name: {
                  contains: search,
                },
              },
              {
                code: {
                  contains: search,
                },
              },
              {
                contactName: {
                  contains: search,
                },
              },
              {
                phone: {
                  contains: search,
                },
              },
              {
                email: {
                  contains: search,
                },
              },
            ],
          }
        : {}),
      ...(status === 'active'
        ? { isActive: true }
        : {}),
      ...(status === 'inactive'
        ? { isActive: false }
        : {}),
    };

    const [
      suppliers,
      total,
      active,
      inactive,
    ] = await Promise.all([
      prisma.inventorySupplier.findMany({
        where,
        orderBy: [
          {
            isActive: 'desc',
          },
          {
            name: 'asc',
          },
        ],
        include: {
          _count: {
            select: {
              stockIns: true,
            },
          },
        },
      }),

      prisma.inventorySupplier.count(),

      prisma.inventorySupplier.count({
        where: {
          isActive: true,
        },
      }),

      prisma.inventorySupplier.count({
        where: {
          isActive: false,
        },
      }),
    ]);

    return NextResponse.json(
      {
        data: suppliers.map(
          (
            supplier: (typeof suppliers)[number],
          ) => ({
            id: supplier.id,
            name: supplier.name,
            code: supplier.code,
            phone: supplier.phone,
            email: supplier.email,
            address: supplier.address,
            contactName:
              supplier.contactName,
            isActive: supplier.isActive,
            stockInCount:
              supplier._count.stockIns,
            createdAt:
              supplier.createdAt,
            updatedAt:
              supplier.updatedAt,
          }),
        ),
        stats: {
          total,
          active,
          inactive,
        },
      },
      {
        headers: {
          'Cache-Control':
            'no-store, max-age=0',
        },
      },
    );
  } catch (error: unknown) {
    console.error(
      'GET /api/inventory/suppliers error:',
      error,
    );

    return NextResponse.json(
      {
        message:
          'Gagal mengambil data supplier.',
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/inventory/suppliers
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin();

    if (auth.response) {
      return auth.response;
    }

    const body: unknown = await request.json();

    if (
      typeof body !== 'object' ||
      body === null ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        {
          message: 'Data request tidak valid.',
        },
        { status: 400 },
      );
    }

    const payload =
      body as Record<string, unknown>;

    const name = normalizeString(
      payload.name,
    );

    const code = normalizeString(
      payload.code,
    ).toUpperCase();

    const phone = normalizeString(
      payload.phone,
    );

    const email = normalizeString(
      payload.email,
    );

    const address = normalizeString(
      payload.address,
    );

    const contactName = normalizeString(
      payload.contactName,
    );

    const isActive =
      payload.isActive === undefined
        ? true
        : payload.isActive;

    if (!name) {
      return NextResponse.json(
        {
          message:
            'Nama supplier wajib diisi.',
        },
        { status: 400 },
      );
    }

    if (name.length > MAX_NAME_LENGTH) {
      return NextResponse.json(
        {
          message:
            `Nama supplier maksimal ${MAX_NAME_LENGTH} karakter.`,
        },
        { status: 400 },
      );
    }

    if (!code) {
      return NextResponse.json(
        {
          message:
            'Kode supplier wajib diisi.',
        },
        { status: 400 },
      );
    }

    if (code.length > MAX_CODE_LENGTH) {
      return NextResponse.json(
        {
          message:
            `Kode supplier maksimal ${MAX_CODE_LENGTH} karakter.`,
        },
        { status: 400 },
      );
    }

    if (phone.length > MAX_PHONE_LENGTH) {
      return NextResponse.json(
        {
          message:
            `Nomor telepon maksimal ${MAX_PHONE_LENGTH} karakter.`,
        },
        { status: 400 },
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        {
          message:
            'Format email supplier tidak valid.',
        },
        { status: 400 },
      );
    }

    if (address.length > MAX_ADDRESS_LENGTH) {
      return NextResponse.json(
        {
          message:
            `Alamat maksimal ${MAX_ADDRESS_LENGTH} karakter.`,
        },
        { status: 400 },
      );
    }

    if (
      contactName.length >
      MAX_CONTACT_LENGTH
    ) {
      return NextResponse.json(
        {
          message:
            `Nama kontak maksimal ${MAX_CONTACT_LENGTH} karakter.`,
        },
        { status: 400 },
      );
    }

    if (!isValidBoolean(isActive)) {
      return NextResponse.json(
        {
          message:
            'Status supplier tidak valid.',
        },
        { status: 400 },
      );
    }

    const existing =
      await prisma.inventorySupplier.findFirst(
        {
          where: {
            OR: [
              {
                code,
              },
              {
                name,
              },
            ],
          },
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      );

    if (existing) {
      const duplicateField =
        existing.code === code
          ? 'Kode supplier'
          : 'Nama supplier';

      return NextResponse.json(
        {
          message:
            `${duplicateField} sudah digunakan.`,
        },
        { status: 409 },
      );
    }

    const supplier =
      await prisma.inventorySupplier.create({
        data: {
          name,
          code,
          phone: phone || null,
          email: email || null,
          address: address || null,
          contactName:
            contactName || null,
          isActive,
        },
      });

    await createAuditLog({
      userId: auth.user.id,
      action: 'CREATE',
      entity: 'InventorySupplier',
      entityId: supplier.id,
      details: {
        name: supplier.name,
        code: supplier.code,
      },
    });

    return NextResponse.json(
      {
        message:
          'Supplier berhasil ditambahkan.',
        data: supplier,
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error(
      'POST /api/inventory/suppliers error:',
      error,
    );

    return NextResponse.json(
      {
        message:
          'Gagal menambahkan supplier.',
      },
      { status: 500 },
    );
  }
}