import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/password';
import { createSession } from '@/lib/auth/session';
import { createAuditLog } from '@/lib/audit-log';

import {
  checkLoginRateLimit,
  getClientIp,
  recordLoginFailure,
  resetLoginRateLimit,
} from '@/lib/rate-limit';

type UserRecord = {
  id: number;
  name: string;
  username: string;
  passwordHash: string;
  role: string;
  status: string;
  lastLoginAt?: Date | null;
};

type UserDbClient = {
  findUnique: (
    args: Record<string, unknown>,
  ) => Promise<UserRecord | null>;

  update: (
    args: Record<string, unknown>,
  ) => Promise<UserRecord>;
};

const db = prisma as typeof prisma & {
  user: UserDbClient;
};

export async function POST(
  request: Request,
) {
  try {

    // 1. Parse request body
    const body =
      await request.json();

    // 2. Validate input   
    const username =
      typeof body.username === 'string'
        ? body.username.trim()
        : '';

    const password =
      typeof body.password === 'string'
        ? body.password
        : '';

    if (!username || !password) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Username dan password wajib diisi.',
        },
        {
          status: 400,
        },
      );
    }

    // 3. Rate limit check
    const clientIp =
      getClientIp(request);

    const rateLimitKey =
      `${clientIp}:${username}`;

    const rateLimit =
      checkLoginRateLimit(
        rateLimitKey,
      );

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Terlalu banyak percobaan login. Silakan coba lagi nanti.',
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(
              rateLimit.retryAfterSeconds,
            ),
          },
        },
      );
    }

    // 4. Find user  
    const user =
      await db.user.findUnique({
        where: {
          username,
        },
      });

    // 5. User tidak ditemukan   
    if (!user) {
      recordLoginFailure(
        rateLimitKey,
      );

      return NextResponse.json(
        {
          success: false,
          message:
            'Username atau password salah.',
        },
        {
          status: 401,
        },
      );
    }

    // 6. Check account status
    if (
      user.status !== 'ACTIVE'
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Akun Anda tidak aktif. Hubungi administrator.',
        },
        {
          status: 403,
        },
      );
    }

    // 7. Verify password 
    const passwordValid =
      await verifyPassword(
        password,
        user.passwordHash,
      );

    // 8. Password salah
    if (!passwordValid) {
      recordLoginFailure(
        rateLimitKey,
      );

      return NextResponse.json(
        {
          success: false,
          message:
            'Username atau password salah.',
        },
        {
          status: 401,
        },
      );
    }

    // 9. Login berhasil
   resetLoginRateLimit(
      rateLimitKey,
    );

    // 10. Update last login
   await db.user.update({
      where: {
        id: user.id,
      },

      data: {
        lastLoginAt: new Date(),
      },
    });

    // 11. Create session
    await createSession(
      user.id,
    );

    await createAuditLog({
      userId: user.id,
      action: 'LOGIN',
      entity: 'User',
      entityId: user.id,
      description: `User ${user.username} berhasil login.`,
      ipAddress: clientIp,
      userAgent:
        request.headers.get('user-agent'),
    });

    // 12. Response
    return NextResponse.json({
      success: true,

      message:
        'Login berhasil.',

      data: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(
      'POST /api/auth/login error:',
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