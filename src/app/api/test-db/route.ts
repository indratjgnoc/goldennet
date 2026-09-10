import { NextResponse } from 'next/server';

import { requireRole } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Hanya SUPER_ADMIN yang boleh mengakses
    await requireRole(['SUPER_ADMIN']);

    // Query sederhana untuk memastikan database aktif
    const branches = await prisma.branch.findMany({
      orderBy: {
        id: 'asc',
      },
      select: {
        id: true,
        name: true,
        code: true,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      message:
        'Database Golden Net berhasil terhubung.',
      data: branches,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === 'UNAUTHORIZED'
    ) {
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

    if (
      error instanceof Error &&
      error.message === 'FORBIDDEN'
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Anda tidak memiliki izin untuk mengakses endpoint ini.',
        },
        {
          status: 403,
        },
      );
    }

    console.error(
      'GET /api/test-db error:',
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          'Gagal terhubung ke database.',
      },
      {
        status: 500,
      },
    );
  }
}