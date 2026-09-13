import { NextRequest, NextResponse } from 'next/server';

import {requireRole } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';

function generateCustomerCode() {
  const timestamp = Date.now().toString().slice(-8);
  return `CUST-${timestamp}`;
}

export async function GET(request: NextRequest) {
  try {
    await requireRole([
      'SUPER_ADMIN',
      'ADMIN',
      'CUSTOMER_SERVICE',
    ]);

    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search')?.trim() || '';
    const status = searchParams.get('status') || '';

    const customers = await prisma.customer.findMany({
      where: {
        ...(search
          ? {
              OR: [
                {
                  customerCode: {
                    contains: search,
                  },
                },
                {
                  name: {
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

        ...(status
          ? {
              status: status as
                | 'PROSPECT'
                | 'ACTIVE'
                | 'SUSPENDED'
                | 'INACTIVE',
            }
          : {}),
      },

      include: {
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },

      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: customers,
    });
  } catch (error) {
    console.error('GET CUSTOMERS ERROR:', error);

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
        message: 'Gagal mengambil data customer.',
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole([
      'SUPER_ADMIN',
      'ADMIN',
      'CUSTOMER_SERVICE',
    ]);

    const body = await request.json();

    const name = String(body.name || '').trim();
    const phone = String(body.phone || '').trim();
    const email = body.email
      ? String(body.email).trim()
      : null;
    const address = String(body.address || '').trim();

    const branchId =
      body.branchId !== undefined &&
      body.branchId !== null &&
      body.branchId !== ''
        ? Number(body.branchId)
        : null;

    const status = body.status
      ? String(body.status)
      : 'PROSPECT';

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: 'Nama customer wajib diisi.',
        },
        { status: 400 },
      );
    }

    if (!phone) {
      return NextResponse.json(
        {
          success: false,
          message: 'Nomor telepon wajib diisi.',
        },
        { status: 400 },
      );
    }

    if (!address) {
      return NextResponse.json(
        {
          success: false,
          message: 'Alamat wajib diisi.',
        },
        { status: 400 },
      );
    }

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

    if (branchId !== null) {
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
    }

    const customerCode = generateCustomerCode();

    const customer = await prisma.customer.create({
      data: {
        customerCode,
        name,
        phone,
        email,
        address,
        branchId,
        status: status as
          | 'PROSPECT'
          | 'ACTIVE'
          | 'SUSPENDED'
          | 'INACTIVE',
      },

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
      action: 'CREATE_CUSTOMER',
      entity: 'Customer',
      entityId: customer.id,
      description: `Customer ${customer.customerCode} dibuat.`,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Customer berhasil dibuat.',
        data: customer,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('CREATE CUSTOMER ERROR:', error);

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
        message: 'Gagal membuat customer.',
      },
      { status: 500 },
    );
  }
}