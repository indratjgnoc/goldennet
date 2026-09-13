import { NextRequest, NextResponse } from 'next/server';

import { requireRole } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: NextRequest,
  context: RouteContext,
) {
  try {
    await requireRole([
      'SUPER_ADMIN',
      'ADMIN',
      'CUSTOMER_SERVICE',
      'TEKNISI',
      'FINANCE',
    ]);

    const { id } = await context.params;
    const customerId = Number(id);

    if (!Number.isInteger(customerId)) {
      return NextResponse.json(
        {
          success: false,
          message: 'ID customer tidak valid.',
        },
        { status: 400 },
      );
    }

    const customer = await prisma.customer.findUnique({
      where: {
        id: customerId,
      },
      include: {
        branch: true,
        registrations: {
          include: {
            package: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        subscriptions: {
          include: {
            package: true,
          },
          orderBy: {
            createdAt: 'desc',
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
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: customer,
    });
  } catch (error) {
    console.error('GET CUSTOMER ERROR:', error);

    if (
      error instanceof Error &&
      error.message === 'UNAUTHORIZED'
    ) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized.',
        },
        { status: 401 },
      );
    }

    if (
      error instanceof Error &&
      error.message === 'FORBIDDEN'
    ) {
      return NextResponse.json(
        {
          success: false,
          message: 'Akses ditolak.',
        },
        { status: 403 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Gagal mengambil customer.',
      },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    const user = await requireRole([
      'SUPER_ADMIN',
      'ADMIN',
      'CUSTOMER_SERVICE',
    ]);

    const { id } = await context.params;
    const customerId = Number(id);

    if (!Number.isInteger(customerId)) {
      return NextResponse.json(
        {
          success: false,
          message: 'ID customer tidak valid.',
        },
        { status: 400 },
      );
    }

    const existing = await prisma.customer.findUnique({
      where: {
        id: customerId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: 'Customer tidak ditemukan.',
        },
        { status: 404 },
      );
    }

    const body = await request.json();

    const data: {
      name?: string;
      phone?: string;
      email?: string | null;
      address?: string;
      status?:
        | 'PROSPECT'
        | 'ACTIVE'
        | 'SUSPENDED'
        | 'INACTIVE';
      branchId?: number | null;
    } = {};

    if (body.name !== undefined) {
      const name = String(body.name).trim();

      if (!name) {
        return NextResponse.json(
          {
            success: false,
            message: 'Nama customer tidak boleh kosong.',
          },
          { status: 400 },
        );
      }

      data.name = name;
    }

    if (body.phone !== undefined) {
      const phone = String(body.phone).trim();

      if (!phone) {
        return NextResponse.json(
          {
            success: false,
            message: 'Nomor telepon tidak boleh kosong.',
          },
          { status: 400 },
        );
      }

      data.phone = phone;
    }

    if (body.email !== undefined) {
      data.email = body.email
        ? String(body.email).trim()
        : null;
    }

    if (body.address !== undefined) {
      const address = String(body.address).trim();

      if (!address) {
        return NextResponse.json(
          {
            success: false,
            message: 'Alamat tidak boleh kosong.',
          },
          { status: 400 },
        );
      }

      data.address = address;
    }

    if (body.status !== undefined) {
      const status = String(body.status);

      if (
        ![
          'PROSPECT',
          'ACTIVE',
          'SUSPENDED',
          'INACTIVE',
        ].includes(status)
      ) {
        return NextResponse.json(
          {
            success: false,
            message: 'Status customer tidak valid.',
          },
          { status: 400 },
        );
      }

      data.status = status as
        | 'PROSPECT'
        | 'ACTIVE'
        | 'SUSPENDED'
        | 'INACTIVE';
    }

    if (body.branchId !== undefined) {
      if (
        body.branchId === null ||
        body.branchId === ''
      ) {
        data.branchId = null;
      } else {
        const branchId = Number(body.branchId);

        if (!Number.isInteger(branchId)) {
          return NextResponse.json(
            {
              success: false,
              message: 'Branch tidak valid.',
            },
            { status: 400 },
          );
        }

        const branch = await prisma.branch.findUnique({
          where: {
            id: branchId,
          },
        });

        if (!branch) {
          return NextResponse.json(
            {
              success: false,
              message: 'Branch tidak ditemukan.',
            },
            { status: 400 },
          );
        }

        data.branchId = branchId;
      }
    }

    const customer = await prisma.customer.update({
      where: {
        id: customerId,
      },
      data,
      include: {
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    await createAuditLog({
      userId: user.id,
      action: 'UPDATE_CUSTOMER',
      entity: 'Customer',
      entityId: customer.id,
      description: `Customer ${customer.customerCode} diperbarui.`,
    });

    return NextResponse.json({
      success: true,
      message: 'Customer berhasil diperbarui.',
      data: customer,
    });
  } catch (error) {
    console.error('UPDATE CUSTOMER ERROR:', error);

    if (
      error instanceof Error &&
      error.message === 'UNAUTHORIZED'
    ) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized.',
        },
        { status: 401 },
      );
    }

    if (
      error instanceof Error &&
      error.message === 'FORBIDDEN'
    ) {
      return NextResponse.json(
        {
          success: false,
          message: 'Akses ditolak.',
        },
        { status: 403 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Gagal memperbarui customer.',
      },
      { status: 500 },
    );
  }
}