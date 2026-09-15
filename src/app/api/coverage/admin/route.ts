import { NextResponse } from 'next/server';

import { getCurrentUser } from '@/lib/auth/session';
import { createAuditLog } from '@/lib/audit';
import { prisma } from '@/lib/prisma';

const ALLOWED_ROLES = ['SUPER_ADMIN', 'ADMIN'];

const MAX_NAME_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;

interface CoverageCreateRequest {
  name?: unknown;
  description?: unknown;
  branchId?: unknown;
  isActive?: unknown;
}

function parsePositiveInteger(value: unknown): number | null {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

async function requireAdmin() {
  const user = await getCurrentUser();

  if (!user) {
    return {
      user: null,
      response: NextResponse.json(
        {
          success: false,
          message: 'Unauthorized.',
        },
        { status: 401 },
      ),
    };
  }

  if (!ALLOWED_ROLES.includes(user.role)) {
    return {
      user: null,
      response: NextResponse.json(
        {
          success: false,
          message: 'Kamu tidak memiliki akses.',
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

/**
 * GET /api/coverage/admin
 *
 * Mengambil seluruh coverage area untuk dashboard admin.
 */
export async function GET(request: Request) {
  try {
    const auth = await requireAdmin();

    if (auth.response) {
      return auth.response;
    }

    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search')?.trim() ?? '';
    const branchIdParam = searchParams.get('branchId');
    const status = searchParams.get('status');

    const branchId = branchIdParam
      ? parsePositiveInteger(branchIdParam)
      : null;

    if (branchIdParam && !branchId) {
      return NextResponse.json(
        {
          success: false,
          message: 'ID cabang tidak valid.',
        },
        { status: 400 },
      );
    }

    if (
      status &&
      status !== 'active' &&
      status !== 'inactive' &&
      status !== 'all'
    ) {
      return NextResponse.json(
        {
          success: false,
          message: 'Filter status tidak valid.',
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
                description: {
                  contains: search,
                },
              },
              {
                branch: {
                  name: {
                    contains: search,
                  },
                },
              },
              {
                branch: {
                  code: {
                    contains: search,
                  },
                },
              },
            ],
          }
        : {}),

      ...(branchId
        ? {
            branchId,
          }
        : {}),

      ...(status === 'active'
        ? {
            isActive: true,
          }
        : status === 'inactive'
          ? {
              isActive: false,
            }
          : {}),
    };

    const coverageAreas =
      await prisma.coverageArea.findMany({
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
          branch: {
            select: {
              id: true,
              name: true,
              code: true,
              address: true,
              isActive: true,
            },
          },
        },
      });

    const total = coverageAreas.length;
    const active = coverageAreas.filter(
      (item) => item.isActive,
    ).length;
    const inactive = total - active;

    return NextResponse.json(
      {
        success: true,
        data: coverageAreas,
        statistics: {
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
  } catch (error) {
    console.error(
      'GET /api/coverage/admin error:',
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          'Gagal mengambil data coverage area.',
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/coverage/admin
 *
 * Membuat coverage area baru.
 */
export async function POST(request: Request) {
  try {
    const auth = await requireAdmin();

    if (auth.response) {
      return auth.response;
    }

    let body: CoverageCreateRequest;

    try {
      body =
        (await request.json()) as CoverageCreateRequest;
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: 'Format JSON tidak valid.',
        },
        { status: 400 },
      );
    }

    /*
     * NAME
     */
    if (typeof body.name !== 'string') {
      return NextResponse.json(
        {
          success: false,
          message: 'Nama area wajib berupa teks.',
        },
        { status: 400 },
      );
    }

    const name = body.name.trim();

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: 'Nama area wajib diisi.',
        },
        { status: 400 },
      );
    }

    if (name.length > MAX_NAME_LENGTH) {
      return NextResponse.json(
        {
          success: false,
          message: `Nama area maksimal ${MAX_NAME_LENGTH} karakter.`,
        },
        { status: 400 },
      );
    }

    /*
     * BRANCH
     */
    const branchId = parsePositiveInteger(
      body.branchId,
    );

    if (!branchId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Cabang wajib dipilih.',
        },
        { status: 400 },
      );
    }

    const branch = await prisma.branch.findUnique({
      where: {
        id: branchId,
      },
      select: {
        id: true,
        name: true,
        code: true,
        address: true,
        isActive: true,
      },
    });

    if (!branch) {
      return NextResponse.json(
        {
          success: false,
          message: 'Cabang tidak ditemukan.',
        },
        { status: 404 },
      );
    }

    if (!branch.isActive) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Coverage tidak dapat dibuat pada cabang yang nonaktif.',
        },
        { status: 400 },
      );
    }

    /*
     * DESCRIPTION
     */
    let description: string | null = null;

    if (body.description !== undefined) {
      if (typeof body.description !== 'string') {
        return NextResponse.json(
          {
            success: false,
            message:
              'Deskripsi harus berupa teks.',
          },
          { status: 400 },
        );
      }

      description =
        body.description.trim() || null;

      if (
        description &&
        description.length > MAX_DESCRIPTION_LENGTH
      ) {
        return NextResponse.json(
          {
            success: false,
            message: `Deskripsi maksimal ${MAX_DESCRIPTION_LENGTH} karakter.`,
          },
          { status: 400 },
        );
      }
    }

    /*
     * STATUS
     */
    let isActive = true;

    if (body.isActive !== undefined) {
      if (typeof body.isActive !== 'boolean') {
        return NextResponse.json(
          {
            success: false,
            message:
              'Status aktif harus berupa boolean.',
          },
          { status: 400 },
        );
      }

      isActive = body.isActive;
    }

    /*
     * DUPLICATE CHECK
     *
     * Sesuai constraint Prisma:
     * @@unique([branchId, name])
     */
    const existingCoverage =
      await prisma.coverageArea.findFirst({
        where: {
          branchId,
          name,
        },
        select: {
          id: true,
        },
      });

    if (existingCoverage) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Nama coverage tersebut sudah digunakan pada cabang yang dipilih.',
        },
        { status: 409 },
      );
    }

    const coverage =
      await prisma.coverageArea.create({
        data: {
          name,
          description,
          branchId,
          isActive,
        },
        include: {
          branch: {
            select: {
              id: true,
              name: true,
              code: true,
              address: true,
              isActive: true,
            },
          },
        },
      });

    await createAuditLog({
      userId: auth.user!.id,
      action: 'CREATE',
      entity: 'CoverageArea',
      entityId: coverage.id,
      description: `Membuat coverage area "${coverage.name}" pada cabang "${coverage.branch.name}".`,
    });

    return NextResponse.json(
      {
        success: true,
        message:
          'Coverage area berhasil ditambahkan.',
        data: coverage,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      'POST /api/coverage/admin error:',
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          'Gagal membuat coverage area.',
      },
      { status: 500 },
    );
  }
}