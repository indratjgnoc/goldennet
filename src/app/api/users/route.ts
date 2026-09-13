import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/password';
import {
  requireRole,
} from '@/lib/auth/session';
import { createAuditLog } from '@/lib/audit-log';

const USER_ROLES = [
  'SUPER_ADMIN',
  'ADMIN',
  'TEKNISI',
  'CUSTOMER_SERVICE',
  'FINANCE',
] as const;

const USER_STATUSES = [
  'ACTIVE',
  'INACTIVE',
  'SUSPENDED',
] as const;

function getClientIp(request: Request) {
  return (
    request.headers
      .get('x-forwarded-for')
      ?.split(',')[0]
      .trim() ||
    request.headers.get('x-real-ip') ||
    null
  );
}

/**
 * GET /api/users
 *
 * Daftar seluruh user.
 *
 * Akses:
 * - SUPER_ADMIN
 * - ADMIN
 */
export async function GET() {
  try {
    const currentUser = await requireRole([
      'SUPER_ADMIN',
      'ADMIN',
    ]);

    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Data user berhasil diambil.',
      data: users,
      meta: {
        total: users.length,
        requestedBy: currentUser.username,
      },
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === 'UNAUTHORIZED'
    ) {
      return NextResponse.json(
        {
          success: false,
          message: 'Anda belum login.',
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
            'Anda tidak memiliki akses untuk melihat data user.',
        },
        {
          status: 403,
        },
      );
    }

    console.error(
      'GET /api/users error:',
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          'Terjadi kesalahan pada server.',
      },
      {
        status: 500,
      },
    );
  }
}

/**
 * POST /api/users
 *
 * Membuat user baru.
 *
 * Akses:
 * - SUPER_ADMIN
 * - ADMIN
 */
export async function POST(
  request: Request,
) {
  try {
    const currentUser =
      await requireRole([
        'SUPER_ADMIN',
        'ADMIN',
      ]);

    const body = await request.json();

    // =====================================================
    // 1. Ambil dan normalisasi input
    // =====================================================

    const name =
      typeof body.name === 'string'
        ? body.name.trim()
        : '';

    const username =
      typeof body.username === 'string'
        ? body.username.trim()
        : '';

    const email =
      typeof body.email === 'string'
        ? body.email.trim().toLowerCase()
        : '';

    const password =
      typeof body.password === 'string'
        ? body.password
        : '';

    const role =
      typeof body.role === 'string'
        ? body.role.trim().toUpperCase()
        : '';

    const status =
      typeof body.status === 'string'
        ? body.status.trim().toUpperCase()
        : 'ACTIVE';

    // =====================================================
    // 2. Validasi field wajib
    // =====================================================

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: 'Nama wajib diisi.',
        },
        {
          status: 400,
        },
      );
    }

    if (!username) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Username wajib diisi.',
        },
        {
          status: 400,
        },
      );
    }

    if (!password) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Password wajib diisi.',
        },
        {
          status: 400,
        },
      );
    }

    if (!role) {
      return NextResponse.json(
        {
          success: false,
          message: 'Role wajib dipilih.',
        },
        {
          status: 400,
        },
      );
    }

    // =====================================================
    // 3. Validasi panjang input
    // =====================================================

    if (name.length > 100) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Nama maksimal 100 karakter.',
        },
        {
          status: 400,
        },
      );
    }

    if (
      username.length < 3 ||
      username.length > 50
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Username harus 3-50 karakter.',
        },
        {
          status: 400,
        },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Password minimal 8 karakter.',
        },
        {
          status: 400,
        },
      );
    }

    if (password.length > 128) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Password maksimal 128 karakter.',
        },
        {
          status: 400,
        },
      );
    }

    if (email.length > 150) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Email maksimal 150 karakter.',
        },
        {
          status: 400,
        },
      );
    }

    // =====================================================
    // 4. Validasi format username
    // =====================================================

    const usernamePattern =
      /^[a-zA-Z0-9._-]+$/;

    if (!usernamePattern.test(username)) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Username hanya boleh menggunakan huruf, angka, titik, underscore, dan tanda hubung.',
        },
        {
          status: 400,
        },
      );
    }

    // =====================================================
    // 5. Validasi email jika diberikan
    // =====================================================

    if (email) {
      const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailPattern.test(email)) {
        return NextResponse.json(
          {
            success: false,
            message:
              'Format email tidak valid.',
          },
          {
            status: 400,
          },
        );
      }
    }

    // =====================================================
    // 6. Validasi role
    // =====================================================

    if (
      !USER_ROLES.includes(
        role as (typeof USER_ROLES)[number],
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Role user tidak valid.',
        },
        {
          status: 400,
        },
      );
    }

    // =====================================================
    // 7. Validasi status
    // =====================================================

    if (
      !USER_STATUSES.includes(
        status as (typeof USER_STATUSES)[number],
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Status user tidak valid.',
        },
        {
          status: 400,
        },
      );
    }

    // =====================================================
    // 8. ADMIN tidak boleh membuat SUPER_ADMIN
    // =====================================================

    if (
      currentUser.role === 'ADMIN' &&
      role === 'SUPER_ADMIN'
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            'ADMIN tidak memiliki izin membuat SUPER_ADMIN.',
        },
        {
          status: 403,
        },
      );
    }

    // =====================================================
    // 9. Cek username sudah digunakan
    // =====================================================

    const existingUsername =
      await prisma.user.findUnique({
        where: {
          username,
        },
        select: {
          id: true,
        },
      });

    if (existingUsername) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Username sudah digunakan.',
        },
        {
          status: 409,
        },
      );
    }

    // =====================================================
    // 10. Cek email jika diberikan
    // =====================================================

    if (email) {
      const existingEmail =
        await prisma.user.findUnique({
          where: {
            email,
          },
          select: {
            id: true,
          },
        });

      if (existingEmail) {
        return NextResponse.json(
          {
            success: false,
            message:
              'Email sudah digunakan.',
          },
          {
            status: 409,
          },
        );
      }
    }

    // =====================================================
    // 11. Hash password
    // =====================================================

    const passwordHash =
      await hashPassword(password);

    // =====================================================
    // 12. Create user
    // =====================================================

    const user =
      await prisma.user.create({
        data: {
          name,
          username,
          email: email || null,
          passwordHash,
          role:
            role as
              | 'SUPER_ADMIN'
              | 'ADMIN'
              | 'TEKNISI'
              | 'CUSTOMER_SERVICE'
              | 'FINANCE',
          status:
            status as
              | 'ACTIVE'
              | 'INACTIVE'
              | 'SUSPENDED',
        },
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
        },
      });

    // =====================================================
    // 13. Audit log
    // =====================================================

    await createAuditLog({
      userId: currentUser.id,
      action: 'CREATE_USER',
      entity: 'User',
      entityId: user.id,
      description:
        `User ${user.username} dibuat oleh ${currentUser.username}.`,
      ipAddress: getClientIp(request),
      userAgent:
        request.headers.get(
          'user-agent',
        ),
    });

    // =====================================================
    // 14. Response
    // =====================================================

    return NextResponse.json(
      {
        success: true,
        message:
          'User berhasil dibuat.',
        data: user,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === 'UNAUTHORIZED'
    ) {
      return NextResponse.json(
        {
          success: false,
          message: 'Anda belum login.',
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
            'Anda tidak memiliki akses untuk mengelola user.',
        },
        {
          status: 403,
        },
      );
    }

    console.error(
      'POST /api/users error:',
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          'Terjadi kesalahan pada server.',
      },
      {
        status: 500,
      },
    );
  }
}