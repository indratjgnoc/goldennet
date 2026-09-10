import { NextResponse } from 'next/server';

import {
  destroySession,
  getCurrentUser,
} from '@/lib/auth/session';

import { createAuditLog } from '@/lib/audit-log';

export async function POST(
  request: Request,
) {
  try {
    const user =
      await getCurrentUser();

    if (user) {
      await createAuditLog({
        userId: user.id,
        action: 'LOGOUT',
        entity: 'User',
        entityId: user.id,
        description: `User ${user.username} logout.`,
        ipAddress:
          request.headers.get(
            'x-forwarded-for',
          )?.split(',')[0].trim() ??
          request.headers.get(
            'x-real-ip',
          ),
        userAgent:
          request.headers.get(
            'user-agent',
          ),
      });
    }

    await destroySession();

    return NextResponse.json({
      success: true,
      message: 'Logout berhasil.',
    });
  } catch (error) {
    console.error(
      'POST /api/auth/logout error:',
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