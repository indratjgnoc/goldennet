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

function parsePositiveInteger(value: unknown) {
  const number = Number(value);

  if (!Number.isInteger(number) || number <= 0) {
    return null;
  }

  return number;
}

function parsePositiveNumber(value: unknown) {
  const number = Number(value);

  if (!Number.isFinite(number) || number <= 0) {
    return null;
  }

  return number;
}

function cleanString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * GET /api/packages/:id
 */
export async function GET(
  request: Request,
  context: RouteContext,
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

    const { id: rawId } = await context.params;
    const id = parseId(rawId);

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: 'ID paket tidak valid.',
        },
        { status: 400 },
      );
    }

    const internetPackage =
      await prisma.internetPackage.findUnique({
        where: { id },
      });

    if (!internetPackage) {
      return NextResponse.json(
        {
          success: false,
          message: 'Paket internet tidak ditemukan.',
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...internetPackage,
        price: Number(internetPackage.price),
      },
    });
  } catch (error) {
    console.error('GET /api/packages/[id] error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Terjadi kesalahan pada server.',
      },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/packages/:id
 */
export async function PATCH(
  request: Request,
  context: RouteContext,
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

    const { id: rawId } = await context.params;
    const id = parseId(rawId);

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: 'ID paket tidak valid.',
        },
        { status: 400 },
      );
    }

    const existing =
      await prisma.internetPackage.findUnique({
        where: { id },
      });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: 'Paket internet tidak ditemukan.',
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

    const data = body as Record<string, unknown>;

    const updateData: {
      name?: string;
      code?: string;
      speed?: number;
      price?: number;
      description?: string | null;
      isPopular?: boolean;
      isActive?: boolean;
    } = {};

    if (data.name !== undefined) {
      const name = cleanString(data.name);

      if (name.length < 3 || name.length > 100) {
        return NextResponse.json(
          {
            success: false,
            message:
              'Nama paket harus 3–100 karakter.',
          },
          { status: 400 },
        );
      }

      updateData.name = name;
    }

    if (data.code !== undefined) {
      const code = cleanString(data.code).toUpperCase();

      if (!/^[A-Z0-9_-]{2,30}$/.test(code)) {
        return NextResponse.json(
          {
            success: false,
            message: 'Kode paket tidak valid.',
          },
          { status: 400 },
        );
      }

      const duplicate =
        await prisma.internetPackage.findFirst({
          where: {
            code,
            NOT: {
              id,
            },
          },
          select: {
            id: true,
          },
        });

      if (duplicate) {
        return NextResponse.json(
          {
            success: false,
            message: 'Kode paket sudah digunakan.',
          },
          { status: 409 },
        );
      }

      updateData.code = code;
    }

    if (data.speed !== undefined) {
      const speed = parsePositiveInteger(data.speed);

      if (!speed || speed > 10000) {
        return NextResponse.json(
          {
            success: false,
            message: 'Kecepatan paket tidak valid.',
          },
          { status: 400 },
        );
      }

      updateData.speed = speed;
    }

    if (data.price !== undefined) {
      const price = parsePositiveNumber(data.price);

      if (price === null) {
        return NextResponse.json(
          {
            success: false,
            message: 'Harga paket tidak valid.',
          },
          { status: 400 },
        );
      }

      updateData.price = price;
    }

    if (data.description !== undefined) {
      const description = cleanString(
        data.description,
      );

      if (description.length > 1000) {
        return NextResponse.json(
          {
            success: false,
            message:
              'Deskripsi maksimal 1000 karakter.',
          },
          { status: 400 },
        );
      }

      updateData.description =
        description || null;
    }

    if (data.isPopular !== undefined) {
      if (typeof data.isPopular !== 'boolean') {
        return NextResponse.json(
          {
            success: false,
            message:
              'isPopular harus berupa boolean.',
          },
          { status: 400 },
        );
      }

      updateData.isPopular = data.isPopular;
    }

    if (data.isActive !== undefined) {
      if (typeof data.isActive !== 'boolean') {
        return NextResponse.json(
          {
            success: false,
            message:
              'isActive harus berupa boolean.',
          },
          { status: 400 },
        );
      }

      updateData.isActive = data.isActive;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Tidak ada data yang diperbarui.',
        },
        { status: 400 },
      );
    }

    const updated =
      await prisma.internetPackage.update({
        where: { id },
        data: updateData,
      });

    await createAuditLog({
      userId: user.id,
      action: 'UPDATE',
      entity: 'InternetPackage',
      entityId: id,
      description:
        `Memperbarui paket internet ${updated.name} (${updated.code}).`,
      ipAddress:
        request.headers.get('x-forwarded-for') ??
        request.headers.get('x-real-ip') ??
        null,
      userAgent:
        request.headers.get('user-agent') ??
        null,
    });

    return NextResponse.json({
      success: true,
      message: 'Paket internet berhasil diperbarui.',
      data: {
        ...updated,
        price: Number(updated.price),
      },
    });
  } catch (error) {
    console.error(
      'PATCH /api/packages/[id] error:',
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: 'Terjadi kesalahan pada server.',
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/packages/:id
 *
 * Soft delete:
 * isActive = false
 *
 * Tidak menghapus record karena paket
 * mungkin sudah dipakai Registration/Subscription.
 */
export async function DELETE(
  request: Request,
  context: RouteContext,
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

    const { id: rawId } = await context.params;
    const id = parseId(rawId);

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: 'ID paket tidak valid.',
        },
        { status: 400 },
      );
    }

    const existing =
      await prisma.internetPackage.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          code: true,
          isActive: true,
        },
      });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: 'Paket internet tidak ditemukan.',
        },
        { status: 404 },
      );
    }

    if (!existing.isActive) {
      return NextResponse.json(
        {
          success: false,
          message: 'Paket sudah tidak aktif.',
        },
        { status: 400 },
      );
    }

    const updated =
      await prisma.internetPackage.update({
        where: { id },
        data: {
          isActive: false,
          isPopular: false,
        },
      });

    await createAuditLog({
      userId: user.id,
      action: 'SOFT_DELETE',
      entity: 'InternetPackage',
      entityId: id,
      description:
        `Menonaktifkan paket internet ${existing.name} (${existing.code}).`,
      ipAddress:
        request.headers.get('x-forwarded-for') ??
        request.headers.get('x-real-ip') ??
        null,
      userAgent:
        request.headers.get('user-agent') ??
        null,
    });

    return NextResponse.json({
      success: true,
      message: 'Paket internet berhasil dinonaktifkan.',
      data: {
        ...updated,
        price: Number(updated.price),
      },
    });
  } catch (error) {
    console.error(
      'DELETE /api/packages/[id] error:',
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: 'Terjadi kesalahan pada server.',
      },
      { status: 500 },
    );
  }
}