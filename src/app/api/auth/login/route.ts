import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

import {
  verifyPassword,
} from '@/lib/password';

import {
  createSession,
} from '@/lib/auth/session';

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
    const body =
      await request.json();

    const username =
      typeof body.username ===
      'string'
        ? body.username.trim()
        : '';

    const password =
      typeof body.password ===
      'string'
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

    const user =
      await db.user.findUnique({
        where: {
          username,
        },
      });

    if (!user) {
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

    const passwordValid =
      await verifyPassword(
        password,
        user.passwordHash,
      );

    if (!passwordValid) {
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

    await db.user.update({
      where: {
        id: user.id,
      },

      data: {
        lastLoginAt:
          new Date(),
      },
    });

    await createSession(
      user.id,
    );

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
