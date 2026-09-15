import { NextResponse } from 'next/server';

import { getCurrentUser } from '@/lib/auth/session';
import { createAuditLog } from '@/lib/audit';
import { prisma } from '@/lib/prisma';

const ALLOWED_ROLES = ['SUPER_ADMIN', 'ADMIN'];

const MAX_NAME_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;

interface CoverageUpdateRequest {
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
 * GET /api/coverage/[id]
 *
 * Detail coverage area untuk admin.
 */
export async function GET(
  _request: Request,
  context: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    const auth = await requireAdmin();

    if (auth.response) {
      return auth.response;
    }

    const { id: idParam } = await context.params;
    const id = parsePositiveInteger(idParam);

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: 'ID coverage tidak valid.',
        },
        { status: 400 },
      );
    }

    const coverage = await prisma.coverageArea.findUnique({
      where: {
        id,
      },
      include: {
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
            address: true,
            phone: true,
            email: true,
            isActive: true,
          },
        },
      },
    });

    if (!coverage) {
      return NextResponse.json(
        {
          success: false,
          message: 'Coverage area tidak ditemukan.',
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: coverage,
    });
  } catch (error) {
    console.error(
      'GET /api/coverage/[id] error:',
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: 'Gagal mengambil detail coverage.',
      },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/coverage/[id]
 *
 * Update coverage area.
 */
export async function PATCH(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    const auth = await requireAdmin();

    if (auth.response) {
      return auth.response;
    }

    const { id: idParam } = await context.params;
    const id = parsePositiveInteger(idParam);

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: 'ID coverage tidak valid.',
        },
        { status: 400 },
      );
    }

    let body: CoverageUpdateRequest;

    try {
      body =
        (await request.json()) as CoverageUpdateRequest;
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: 'Format JSON tidak valid.',
        },
        { status: 400 },
      );
    }

    const existingCoverage =
      await prisma.coverageArea.findUnique({
        where: {
          id,
        },
        include: {
          branch: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

    if (!existingCoverage) {
      return NextResponse.json(
        {
          success: false,
          message: 'Coverage area tidak ditemukan.',
        },
        { status: 404 },
      );
    }

    const data: {
      name?: string;
      description?: string | null;
      branchId?: number;
      isActive?: boolean;
    } = {};

    /*
     * NAME
     */
    if (body.name !== undefined) {
      if (typeof body.name !== 'string') {
        return NextResponse.json(
          {
            success: false,
            message: 'Nama area harus berupa teks.',
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

      data.name = name;
    }

    /*
     * DESCRIPTION
     */
    if (body.description !== undefined) {
      if (
        body.description !== null &&
        typeof body.description !== 'string'
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              'Deskripsi harus berupa teks atau null.',
          },
          { status: 400 },
        );
      }

      const description =
        typeof body.description === 'string'
          ? body.description.trim()
          : null;

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

      data.description = description || null;
    }

    /*
     * BRANCH
     */
    if (body.branchId !== undefined) {
      const branchId = parsePositiveInteger(
        body.branchId,
      );

      if (!branchId) {
        return NextResponse.json(
          {
            success: false,
            message: 'Cabang tidak valid.',
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
              'Coverage tidak dapat dipindahkan ke cabang yang nonaktif.',
          },
          { status: 400 },
        );
      }

      data.branchId = branchId;
    }

    /*
     * STATUS
     */
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

      data.isActive = body.isActive;
    }

    /*
     * Pastikan minimal ada perubahan.
     */
    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Tidak ada data yang diubah.',
        },
        { status: 400 },
      );
    }

    const finalName =
      data.name ?? existingCoverage.name;

    const finalBranchId =
      data.branchId ?? existingCoverage.branchId;

    /*
     * Pastikan kombinasi cabang + nama tetap unik.
     */
    const duplicate =
      await prisma.coverageArea.findFirst({
        where: {
          branchId: finalBranchId,
          name: finalName,
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
          message:
            'Nama coverage tersebut sudah digunakan pada cabang yang sama.',
        },
        { status: 409 },
      );
    }

    const updatedCoverage =
      await prisma.coverageArea.update({
        where: {
          id,
        },
        data,
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
      action: 'UPDATE',
      entity: 'CoverageArea',
      entityId: updatedCoverage.id,
      description: `Memperbarui coverage area "${updatedCoverage.name}".`,
    });

    return NextResponse.json({
      success: true,
      message: 'Coverage area berhasil diperbarui.',
      data: updatedCoverage,
    });
  } catch (error) {
    console.error(
      'PATCH /api/coverage/[id] error:',
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: 'Gagal memperbarui coverage area.',
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/coverage/[id]
 *
 * Soft delete:
 * Coverage tidak dihapus dari database.
 * Hanya dibuat nonaktif.
 */
export async function DELETE(
  _request: Request,
  context: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    const auth = await requireAdmin();

    if (auth.response) {
      return auth.response;
    }

    const { id: idParam } = await context.params;
    const id = parsePositiveInteger(idParam);

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: 'ID coverage tidak valid.',
        },
        { status: 400 },
      );
    }

    const existingCoverage =
      await prisma.coverageArea.findUnique({
        where: {
          id,
        },
      });

    if (!existingCoverage) {
      return NextResponse.json(
        {
          success: false,
          message: 'Coverage area tidak ditemukan.',
        },
        { status: 404 },
      );
    }

    if (!existingCoverage.isActive) {
      return NextResponse.json(
        {
          success: false,
          message: 'Coverage area sudah nonaktif.',
        },
        { status: 400 },
      );
    }

    const updatedCoverage =
      await prisma.coverageArea.update({
        where: {
          id,
        },
        data: {
          isActive: false,
        },
      });

    await createAuditLog({
      userId: auth.user!.id,
      action: 'SOFT_DELETE',
      entity: 'CoverageArea',
      entityId: updatedCoverage.id,
      description: `Menonaktifkan coverage area "${updatedCoverage.name}".`,
    });

    return NextResponse.json({
      success: true,
      message:
        'Coverage area berhasil dinonaktifkan.',
      data: updatedCoverage,
    });
  } catch (error) {
    console.error(
      'DELETE /api/coverage/[id] error:',
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          'Gagal menonaktifkan coverage area.',
      },
      { status: 500 },
    );
  }
}