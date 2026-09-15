import { NextRequest, NextResponse } from 'next/server';

import { getCurrentUser } from '@/lib/auth/session';
import { createAuditLog } from '@/lib/audit';
import { prisma } from '@/lib/prisma';

const ALLOWED_ROLES = ['SUPER_ADMIN', 'ADMIN'];

const MAX_NAME_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;

async function requireAdmin() {
  const user = await getCurrentUser();

  if (!user) {
    return {
      error: NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 },
      ),
    };
  }

  if (!ALLOWED_ROLES.includes(user.role)) {
    return {
      error: NextResponse.json(
        { message: 'Forbidden' },
        { status: 403 },
      ),
    };
  }

  return { user };
}

function parseBoolean(value: unknown, fallback: boolean) {
  if (value === undefined) {
    return fallback;
  }

  if (typeof value !== 'boolean') {
    return null;
  }

  return value;
}

/**
 * GET /api/inventory/categories
 *
 * Admin:
 * - SUPER_ADMIN
 * - ADMIN
 *
 * Query:
 * ?search=
 * ?status=all|active|inactive
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin();

  if (auth.error) {
    return auth.error;
  }

  const searchParams = request.nextUrl.searchParams;

  const search = searchParams.get('search')?.trim() ?? '';
  const status = searchParams.get('status') ?? 'all';

  if (!['all', 'active', 'inactive'].includes(status)) {
    return NextResponse.json(
      {
        message: 'Invalid status filter',
      },
      { status: 400 },
    );
  }

  const inventoryCategoryModel = (prisma).inventoryCategory;

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
              description: {
                contains: search,
              },
            },
          ],
        }
      : {}),
    ...(status === 'active'
      ? { isActive: true }
      : status === 'inactive'
        ? { isActive: false }
        : {}),
  };

  const [categories, total, active, inactive] = await Promise.all([
    inventoryCategoryModel.findMany({
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
            items: true,
          },
        },
      },
    }),

    inventoryCategoryModel.count(),

    inventoryCategoryModel.count({
      where: {
        isActive: true,
      },
    }),

    inventoryCategoryModel.count({
      where: {
        isActive: false,
      },
    }),
  ]);

  return NextResponse.json(
    {
      data: categories.map((category: (typeof categories)[number]) => ({
        id: category.id,
        name: category.name,
        description: category.description,
        isActive: category.isActive,
        itemCount: category._count.items,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      })),
      stats: {
        total,
        active,
        inactive,
      },
    },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  );
}

/**
 * POST /api/inventory/categories
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin();

  if (auth.error) {
    return auth.error;
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        message: 'Invalid JSON body',
      },
      { status: 400 },
    );
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json(
      {
        message: 'Request body must be an object',
      },
      { status: 400 },
    );
  }

  const payload = body as Record<string, unknown>;

  const name =
    typeof payload.name === 'string'
      ? payload.name.trim()
      : '';

  const description =
    typeof payload.description === 'string'
      ? payload.description.trim()
      : null;

  const isActive = parseBoolean(
    payload.isActive,
    true,
  );

  if (!name) {
    return NextResponse.json(
      {
        message: 'Nama kategori wajib diisi',
      },
      { status: 400 },
    );
  }

  if (name.length > MAX_NAME_LENGTH) {
    return NextResponse.json(
      {
        message: `Nama kategori maksimal ${MAX_NAME_LENGTH} karakter`,
      },
      { status: 400 },
    );
  }

  if (description !== null && description.length > MAX_DESCRIPTION_LENGTH) {
    return NextResponse.json(
      {
        message: `Deskripsi maksimal ${MAX_DESCRIPTION_LENGTH} karakter`,
      },
      { status: 400 },
    );
  }

  if (isActive === null) {
    return NextResponse.json(
      {
        message: 'isActive harus berupa boolean',
      },
      { status: 400 },
    );
  }

  const existing = await prisma.inventoryCategory.findFirst({
    where: {
      name: {
        equals: name,
      },
    },
  });

  if (existing) {
    return NextResponse.json(
      {
        message: 'Kategori dengan nama tersebut sudah ada',
      },
      { status: 409 },
    );
  }

  const category = await prisma.inventoryCategory.create({
    data: {
      name,
      description: description || null,
      isActive,
    },
  });

  await createAuditLog({
    userId: auth.user.id,
    action: 'CREATE',
    entity: 'InventoryCategory',
    entityId: category.id,
    description: `Membuat kategori inventory "${category.name}"`,
  });

  return NextResponse.json(
    {
      message: 'Kategori berhasil dibuat',
      data: category,
    },
    { status: 201 },
  );
}