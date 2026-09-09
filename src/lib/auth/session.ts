import { cookies } from 'next/headers';

import { prisma } from '../prisma';

export const SESSION_COOKIE_NAME =
  'goldennet_session';

const SESSION_MAX_AGE =
  60 * 60 * 8; // 8 jam

export type AppRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'TEKNISI'
  | 'CUSTOMER_SERVICE'
  | 'FINANCE';

export async function createSession(
  userId: number,
) {
  const cookieStore = await cookies();

  cookieStore.set(
    SESSION_COOKIE_NAME,
    String(userId),
    {
      httpOnly: true,
      secure:
        process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE,
      path: '/',
    },
  );
}

export async function destroySession() {
  const cookieStore = await cookies();

  cookieStore.delete(
    SESSION_COOKIE_NAME,
  );
}

export async function getSessionUserId() {
  const cookieStore = await cookies();

  const session = cookieStore.get(
    SESSION_COOKIE_NAME,
  );

  if (!session?.value) {
    return null;
  }

  const userId = Number(session.value);

  if (
    !Number.isInteger(userId) ||
    userId <= 0
  ) {
    return null;
  }

  return userId;
}

export async function getCurrentUser() {
  const userId =
    await getSessionUserId();

  if (!userId) {
    return null;
  }

  const user =
    await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        status: true,
        lastLoginAt: true,
      },
    });

  if (
    !user ||
    user.status !== 'ACTIVE'
  ) {
    return null;
  }

  return user;
}

export async function requireAuth() {
  const user =
    await getCurrentUser();

  if (!user) {
    throw new Error(
      'UNAUTHORIZED',
    );
  }

  return user;
}

export async function requireRole(
  allowedRoles: AppRole[],
) {
  const user =
    await requireAuth();

  if (
    !allowedRoles.includes(
      user.role as AppRole,
    )
  ) {
    throw new Error(
      'FORBIDDEN',
    );
  }

  return user;
}

export async function hasRole(
  allowedRoles: AppRole[],
) {
  const user =
    await getCurrentUser();

  if (!user) {
    return false;
  }

  return allowedRoles.includes(
    user.role as AppRole,
  );
}