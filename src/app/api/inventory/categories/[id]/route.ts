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

function parseId(value: string) {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return id;
}

function parseBoolean(value: unknown) {
  if (typeof value !== 'boolean') {
    return null;
  }

  return value;
}

/**
 * GET /api/inventory/categories/[id]
 */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();

  if (auth.error) {
    return auth.error;
  }

  const { id: rawId } = await context.params;
  const id = parseId(rawId);

  if (!id) {
    return NextResponse.json(
      {
        message: 'ID kategori tidak valid',
      },
      { status: 400 },
    );
  }

  const category = await prisma.inventoryCategory.findUnique({
    where: {
      id,
    },
    include: {
      _count: {
        select: {
          items: true,
        },
      },
    },
  });

  if (!category) {
    return NextResponse.json(
      {
        message: 'Kategori tidak ditemukan',
      },
      { status: 404 },
    );
  }

  return NextResponse.json(
    {
      data: {
        id: category.id,
        name: category.name,
        description: category.description,
        isActive: category.isActive,
        itemCount: category._count.items,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
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
 * PATCH /api/inventory/categories/[id]
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();

  if (auth.error) {
    return auth.error;
  }

  const { id: rawId } = await context.params;
  const id = parseId(rawId);

  if (!id) {
    return NextResponse.json(
      {
        message: 'ID kategori tidak valid',
      },
      { status: 400 },
    );
  }

  const existing = await prisma.inventoryCategory.findUnique({
    where: {
      id,
    },
  });

  if (!existing) {
    return NextResponse.json(
      {
        message: 'Kategori tidak ditemukan',
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

  const data: {
    name?: string;
    description?: string | null;
    isActive?: boolean;
  } = {};

  if (payload.name !== undefined) {
    if (typeof payload.name !== 'string') {
      return NextResponse.json(
        {
          message: 'Nama kategori harus berupa teks',
        },
        { status: 400 },
      );
    }

    const name = payload.name.trim();

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

    data.name = name;
  }

  if (payload.description !== undefined) {
    if (
      payload.description !== null &&
      typeof payload.description !== 'string'
    ) {
      return NextResponse.json(
        {
          message: 'Deskripsi harus berupa teks',
        },
        { status: 400 },
      );
    }

    const description =
      typeof payload.description === 'string'
        ? payload.description.trim()
        : null;

    if (
      description !== null &&
      description.length > MAX_DESCRIPTION_LENGTH
    ) {
      return NextResponse.json(
        {
          message: `Deskripsi maksimal ${MAX_DESCRIPTION_LENGTH} karakter`,
        },
        { status: 400 },
      );
    }

    data.description = description || null;
  }

  if (payload.isActive !== undefined) {
    const isActive = parseBoolean(payload.isActive);

    if (isActive === null) {
      return NextResponse.json(
        {
          message: 'isActive harus berupa boolean',
        },
        { status: 400 },
      );
    }

    data.isActive = isActive;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      {
        message: 'Tidak ada data yang diperbarui',
      },
      { status: 400 },
    );
  }

  if (data.name && data.name !== existing.name) {
    const duplicate = await prisma.inventoryCategory.findFirst({
      where: {
        name: data.name,
        NOT: {
          id,
        },
      },
    });

    if (duplicate) {
      return NextResponse.json(
        {
          message: 'Kategori dengan nama tersebut sudah ada',
        },
        { status: 409 },
      );
    }
  }

  const category = await prisma.inventoryCategory.update({
    where: {
      id,
    },
    data,
    include: {
      _count: {
        select: {
          items: true,
        },
      },
    },
  });

  await createAuditLog({
    userId: auth.user.id,
    action: 'UPDATE',
    entity: 'InventoryCategory',
    entityId: category.id,
    description: `Memperbarui kategori inventory "${category.name}"`,
  });

  return NextResponse.json({
    message: 'Kategori berhasil diperbarui',
    data: {
      id: category.id,
      name: category.name,
      description: category.description,
      isActive: category.isActive,
      itemCount: category._count.items,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    },
  });
}

/**
 * DELETE /api/inventory/categories/[id]
 *
 * Soft delete:
 * isActive = false
 */
export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();

  if (auth.error) {
    return auth.error;
  }

  const { id: rawId } = await context.params;
  const id = parseId(rawId);

  if (!id) {
    return NextResponse.json(
      {
        message: 'ID kategori tidak valid',
      },
      { status: 400 },
    );
  }

  const existing = await prisma.inventoryCategory.findUnique({
    where: {
      id,
    },
    include: {
      _count: {
        select: {
          items: true,
        },
      },
    },
  });

  if (!existing) {
    return NextResponse.json(
      {
        message: 'Kategori tidak ditemukan',
      },
      { status: 404 },
    );
  }

  if (!existing.isActive) {
    return NextResponse.json(
      {
        message: 'Kategori sudah tidak aktif',
      },
      { status: 400 },
    );
  }

  const category = await prisma.inventoryCategory.update({
    where: {
      id,
    },
    data: {
      isActive: false,
    },
  });

  await createAuditLog({
    userId: auth.user.id,
    action: 'SOFT_DELETE',
    entity: 'InventoryCategory',
    entityId: category.id,
    description: `Menonaktifkan kategori inventory "${category.name}"`,
  });

  return NextResponse.json({
    message: 'Kategori berhasil dinonaktifkan',
    data: {
      id: category.id,
      name: category.name,
      isActive: category.isActive,
    },
  });
}