import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/session';
import { createAuditLog } from '@/lib/audit';

const ALLOWED_ROLES = [
  'SUPER_ADMIN',
  'ADMIN',
  'CUSTOMER_SERVICE',
];

const VALID_STATUSES = [
  'PROSPECT',
  'ACTIVE',
  'SUSPENDED',
  'INACTIVE',
] as const;

function unauthorized() {
  return NextResponse.json(
    {
      success: false,
      message: 'Unauthorized',
    },
    { status: 401 }
  );
}

function forbidden() {
  return NextResponse.json(
    {
      success: false,
      message: 'Kamu tidak memiliki akses untuk melakukan tindakan ini.',
    },
    { status: 403 }
  );
}

function badRequest(message: string) {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status: 400 }
  );
}

/**
 * GET /api/customers/[id]
 * Detail customer
 */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();

  if (!user) {
    return unauthorized();
  }

  if (!ALLOWED_ROLES.includes(user.role)) {
    return forbidden();
  }

  const { id } = await context.params;
  const customerId = Number(id);

  if (!Number.isInteger(customerId) || customerId <= 0) {
    return badRequest('ID customer tidak valid.');
  }

  try {
    const customer = await prisma.customer.findUnique({
      where: {
        id: customerId,
      },
      include: {
        branch: true,

        registrations: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
          include: {
            package: true,
          },
        },

        subscriptions: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
          include: {
            package: true,
          },
        },
      },
    });

    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          message: 'Customer tidak ditemukan.',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: customer,
    });
  } catch (error) {
    console.error('GET CUSTOMER DETAIL ERROR:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Terjadi kesalahan saat mengambil data customer.',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/customers/[id]
 * Update customer
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();

  if (!user) {
    return unauthorized();
  }

  if (!ALLOWED_ROLES.includes(user.role)) {
    return forbidden();
  }

  const { id } = await context.params;
  const customerId = Number(id);

  if (!Number.isInteger(customerId) || customerId <= 0) {
    return badRequest('ID customer tidak valid.');
  }

  try {
    const existingCustomer = await prisma.customer.findUnique({
      where: {
        id: customerId,
      },
    });

    if (!existingCustomer) {
      return NextResponse.json(
        {
          success: false,
          message: 'Customer tidak ditemukan.',
        },
        { status: 404 }
      );
    }

    const body = await request.json();

    const {
      customerCode,
      name,
      phone,
      email,
      address,
      status,
      branchId,
    } = body;

    const data: {
      customerCode?: string;
      name?: string;
      phone?: string;
      email?: string | null;
      address?: string;
      status?: (typeof VALID_STATUSES)[number];
      branchId?: number | null;
    } = {};

    if (customerCode !== undefined) {
      if (
        typeof customerCode !== 'string' ||
        !customerCode.trim()
      ) {
        return badRequest('Kode customer tidak boleh kosong.');
      }

      const normalizedCode = customerCode.trim();

      const duplicate = await prisma.customer.findFirst({
        where: {
          customerCode: normalizedCode,
          NOT: {
            id: customerId,
          },
        },
      });

      if (duplicate) {
        return badRequest('Kode customer sudah digunakan.');
      }

      data.customerCode = normalizedCode;
    }

    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim()) {
        return badRequest('Nama customer tidak boleh kosong.');
      }

      data.name = name.trim();
    }

    if (phone !== undefined) {
      if (typeof phone !== 'string' || !phone.trim()) {
        return badRequest('Nomor telepon tidak boleh kosong.');
      }

      data.phone = phone.trim();
    }

    if (email !== undefined) {
      if (email === null || email === '') {
        data.email = null;
      } else if (typeof email === 'string') {
        data.email = email.trim().toLowerCase();
      } else {
        return badRequest('Format email tidak valid.');
      }
    }

    if (address !== undefined) {
      if (typeof address !== 'string' || !address.trim()) {
        return badRequest('Alamat customer tidak boleh kosong.');
      }

      data.address = address.trim();
    }

    if (status !== undefined) {
      if (
        typeof status !== 'string' ||
        !VALID_STATUSES.includes(
          status as (typeof VALID_STATUSES)[number]
        )
      ) {
        return badRequest('Status customer tidak valid.');
      }

      data.status = status as (typeof VALID_STATUSES)[number];
    }

    if (branchId !== undefined) {
      if (branchId === null || branchId === '') {
        data.branchId = null;
      } else {
        const parsedBranchId = Number(branchId);

        if (
          !Number.isInteger(parsedBranchId) ||
          parsedBranchId <= 0
        ) {
          return badRequest('Branch ID tidak valid.');
        }

        const branch = await prisma.branch.findUnique({
          where: {
            id: parsedBranchId,
          },
        });

        if (!branch) {
          return badRequest('Branch tidak ditemukan.');
        }

        data.branchId = parsedBranchId;
      }
    }

    if (Object.keys(data).length === 0) {
      return badRequest('Tidak ada data yang diubah.');
    }

    const updatedCustomer = await prisma.customer.update({
      where: {
        id: customerId,
      },
      data,
      include: {
        branch: true,
      },
    });

    await createAuditLog({
      userId: user.id,
      action: 'UPDATE',
      entity: 'CUSTOMER',
      entityId: customerId,
      description: `Memperbarui customer ${updatedCustomer.customerCode} - ${updatedCustomer.name}`,
    });

    return NextResponse.json({
      success: true,
      message: 'Data customer berhasil diperbarui.',
      data: updatedCustomer,
    });
  } catch (error) {
    console.error('UPDATE CUSTOMER ERROR:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Terjadi kesalahan saat memperbarui customer.',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/customers/[id]
 *
 * Soft delete:
 * Customer tidak benar-benar dihapus.
 * Status diubah menjadi INACTIVE.
 */
export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();

  if (!user) {
    return unauthorized();
  }

  if (!ALLOWED_ROLES.includes(user.role)) {
    return forbidden();
  }

  const { id } = await context.params;
  const customerId = Number(id);

  if (!Number.isInteger(customerId) || customerId <= 0) {
    return badRequest('ID customer tidak valid.');
  }

  try {
    const existingCustomer = await prisma.customer.findUnique({
      where: {
        id: customerId,
      },
    });

    if (!existingCustomer) {
      return NextResponse.json(
        {
          success: false,
          message: 'Customer tidak ditemukan.',
        },
        { status: 404 }
      );
    }

    if (existingCustomer.status === 'INACTIVE') {
      return badRequest('Customer sudah berstatus inactive.');
    }

    const customer = await prisma.customer.update({
      where: {
        id: customerId,
      },
      data: {
        status: 'INACTIVE',
      },
    });

    await createAuditLog({
      userId: user.id,
      action: 'SOFT_DELETE',
      entity: 'CUSTOMER',
      entityId: customerId,
      description: `Menonaktifkan customer ${customer.customerCode} - ${customer.name}`,
    });

    return NextResponse.json({
      success: true,
      message: 'Customer berhasil dinonaktifkan.',
      data: customer,
    });
  } catch (error) {
    console.error('DELETE CUSTOMER ERROR:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Terjadi kesalahan saat menonaktifkan customer.',
      },
      { status: 500 }
    );
  }
}