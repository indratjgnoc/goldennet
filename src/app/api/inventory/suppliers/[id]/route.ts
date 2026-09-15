import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';

const allowedRoles = ['SUPER_ADMIN', 'ADMIN'];

async function checkAuth() {
  const user = await getCurrentUser();

  if (!user) {
    return {
      error: NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 },
      ),
    };
  }

  if (!allowedRoles.includes(user.role)) {
    return {
      error: NextResponse.json(
        { message: 'Forbidden' },
        { status: 403 },
      ),
    };
  }

  return { user };
}

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

// GET /api/inventory/suppliers/:id
export async function GET(
  _request: NextRequest,
  context: RouteContext,
) {
  try {
    const auth = await checkAuth();

    if (auth.error) {
      return auth.error;
    }

    const { id } = await context.params;
    const supplierId = Number(id);

    if (!Number.isInteger(supplierId) || supplierId <= 0) {
      return NextResponse.json(
        { message: 'ID supplier tidak valid' },
        { status: 400 },
      );
    }

    const supplier = await prisma.inventorySupplier.findUnique({
      where: {
        id: supplierId,
      },
      include: {
        _count: {
          select: {
            stockIns: true,
          },
        },
        stockIns: {
          orderBy: {
            transactionDate: 'desc',
          },
          take: 10,
          select: {
            id: true,
            transactionCode: true,
            transactionDate: true,
            notes: true,
          },
        },
      },
    });

    if (!supplier) {
      return NextResponse.json(
        { message: 'Supplier tidak ditemukan' },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        data: {
          id: supplier.id,
          name: supplier.name,
          code: supplier.code,
          phone: supplier.phone,
          email: supplier.email,
          address: supplier.address,
          contactName: supplier.contactName,
          isActive: supplier.isActive,
          stockInCount: supplier._count.stockIns,
          recentStockIns: supplier.stockIns,
          createdAt: supplier.createdAt,
          updatedAt: supplier.updatedAt,
        },
      },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      },
    );
  } catch (error) {
    console.error('GET /api/inventory/suppliers/[id] error:', error);

    return NextResponse.json(
      { message: 'Gagal mengambil data supplier' },
      { status: 500 },
    );
  }
}

// PATCH /api/inventory/suppliers/:id
export async function PATCH(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    const auth = await checkAuth();

    if (auth.error) {
      return auth.error;
    }

    const { id } = await context.params;
    const supplierId = Number(id);

    if (!Number.isInteger(supplierId) || supplierId <= 0) {
      return NextResponse.json(
        { message: 'ID supplier tidak valid' },
        { status: 400 },
      );
    }

    const existingSupplier =
      await prisma.inventorySupplier.findUnique({
        where: {
          id: supplierId,
        },
      });

    if (!existingSupplier) {
      return NextResponse.json(
        { message: 'Supplier tidak ditemukan' },
        { status: 404 },
      );
    }

    const body = await request.json();

    const {
      name,
      code,
      phone,
      email,
      address,
      contactName,
      isActive,
    } = body;

    if (
      name !== undefined &&
      (typeof name !== 'string' ||
        !name.trim() ||
        name.trim().length > 150)
    ) {
      return NextResponse.json(
        {
          message:
            'Nama supplier wajib diisi dan maksimal 150 karakter',
        },
        { status: 400 },
      );
    }

    if (
      code !== undefined &&
      (typeof code !== 'string' ||
        !code.trim() ||
        code.trim().length > 50)
    ) {
      return NextResponse.json(
        {
          message:
            'Kode supplier wajib diisi dan maksimal 50 karakter',
        },
        { status: 400 },
      );
    }

    if (
      phone !== undefined &&
      phone !== null &&
      (typeof phone !== 'string' || phone.length > 30)
    ) {
      return NextResponse.json(
        { message: 'Nomor telepon maksimal 30 karakter' },
        { status: 400 },
      );
    }

    if (
      email !== undefined &&
      email !== null &&
      (typeof email !== 'string' ||
        email.length > 254 ||
        (email.length > 0 &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)))
    ) {
      return NextResponse.json(
        { message: 'Format email tidak valid' },
        { status: 400 },
      );
    }

    if (
      address !== undefined &&
      address !== null &&
      (typeof address !== 'string' || address.length > 500)
    ) {
      return NextResponse.json(
        { message: 'Alamat maksimal 500 karakter' },
        { status: 400 },
      );
    }

    if (
      contactName !== undefined &&
      contactName !== null &&
      (typeof contactName !== 'string' ||
        contactName.length > 100)
    ) {
      return NextResponse.json(
        { message: 'Nama kontak maksimal 100 karakter' },
        { status: 400 },
      );
    }

    if (
      isActive !== undefined &&
      typeof isActive !== 'boolean'
    ) {
      return NextResponse.json(
        { message: 'Status aktif tidak valid' },
        { status: 400 },
      );
    }

    const normalizedName =
      name !== undefined
        ? name.trim()
        : existingSupplier.name;

    const normalizedCode =
      code !== undefined
        ? code.trim().toUpperCase()
        : existingSupplier.code;

    const duplicate = await prisma.inventorySupplier.findFirst({
      where: {
        AND: [
          {
            id: {
              not: supplierId,
            },
          },
          {
            OR: [
              {
                name: {
                  equals: normalizedName,
                },
              },
              {
                code: {
                  equals: normalizedCode,
                },
              },
            ],
          },
        ],
      },
    });

    if (duplicate) {
      return NextResponse.json(
        {
          message:
            'Nama atau kode supplier sudah digunakan',
        },
        { status: 409 },
      );
    }

    const supplier = await prisma.inventorySupplier.update({
      where: {
        id: supplierId,
      },
      data: {
        name: normalizedName,
        code: normalizedCode,
        phone:
          phone !== undefined
            ? phone?.trim() || null
            : existingSupplier.phone,
        email:
          email !== undefined
            ? email?.trim() || null
            : existingSupplier.email,
        address:
          address !== undefined
            ? address?.trim() || null
            : existingSupplier.address,
        contactName:
          contactName !== undefined
            ? contactName?.trim() || null
            : existingSupplier.contactName,
        isActive:
          isActive !== undefined
            ? isActive
            : existingSupplier.isActive,
      },
    });

    await createAuditLog({
      userId: auth.user.id,
      action: 'UPDATE',
      entity: 'InventorySupplier',
      entityId: supplier.id,
      details: {
        before: {
          name: existingSupplier.name,
          code: existingSupplier.code,
          phone: existingSupplier.phone,
          email: existingSupplier.email,
          address: existingSupplier.address,
          contactName: existingSupplier.contactName,
          isActive: existingSupplier.isActive,
        },
        after: {
          name: supplier.name,
          code: supplier.code,
          phone: supplier.phone,
          email: supplier.email,
          address: supplier.address,
          contactName: supplier.contactName,
          isActive: supplier.isActive,
        },
      },
    });

    return NextResponse.json({
      message: 'Supplier berhasil diperbarui',
      data: supplier,
    });
  } catch (error) {
    console.error(
      'PATCH /api/inventory/suppliers/[id] error:',
      error,
    );

    return NextResponse.json(
      { message: 'Gagal memperbarui supplier' },
      { status: 500 },
    );
  }
}

// DELETE /api/inventory/suppliers/:id
export async function DELETE(
  _request: NextRequest,
  context: RouteContext,
) {
  try {
    const auth = await checkAuth();

    if (auth.error) {
      return auth.error;
    }

    const { id } = await context.params;
    const supplierId = Number(id);

    if (!Number.isInteger(supplierId) || supplierId <= 0) {
      return NextResponse.json(
        { message: 'ID supplier tidak valid' },
        { status: 400 },
      );
    }

    const existingSupplier =
      await prisma.inventorySupplier.findUnique({
        where: {
          id: supplierId,
        },
        include: {
          _count: {
            select: {
              stockIns: true,
            },
          },
        },
      });

    if (!existingSupplier) {
      return NextResponse.json(
        { message: 'Supplier tidak ditemukan' },
        { status: 404 },
      );
    }

    // Supplier yang sudah pernah digunakan tidak dihapus permanen.
    // Kita lakukan soft delete dengan menonaktifkannya.
    if (existingSupplier._count.stockIns > 0) {
      const supplier =
        await prisma.inventorySupplier.update({
          where: {
            id: supplierId,
          },
          data: {
            isActive: false,
          },
        });

      await createAuditLog({
        userId: auth.user.id,
        action: 'DELETE',
        entity: 'InventorySupplier',
        entityId: supplier.id,
        details: {
          type: 'SOFT_DELETE',
          reason: 'Supplier memiliki riwayat barang masuk',
          stockInCount: existingSupplier._count.stockIns,
        },
      });

      return NextResponse.json({
        message:
          'Supplier memiliki riwayat transaksi dan telah dinonaktifkan',
        data: supplier,
      });
    }

    // Jika belum pernah digunakan, hapus permanen.
    await prisma.inventorySupplier.delete({
      where: {
        id: supplierId,
      },
    });

    await createAuditLog({
      userId: auth.user.id,
      action: 'DELETE',
      entity: 'InventorySupplier',
      entityId: supplierId,
      details: {
        type: 'PERMANENT_DELETE',
        name: existingSupplier.name,
        code: existingSupplier.code,
      },
    });

    return NextResponse.json({
      message: 'Supplier berhasil dihapus',
    });
  } catch (error) {
    console.error(
      'DELETE /api/inventory/suppliers/[id] error:',
      error,
    );

    return NextResponse.json(
      { message: 'Gagal menghapus supplier' },
      { status: 500 },
    );
  }
}