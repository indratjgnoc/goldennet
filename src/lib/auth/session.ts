import { createHash, randomBytes } from 'node:crypto';

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

/**
 * Membuat hash SHA-256 dari session token.
 *
 * Token asli hanya disimpan di browser melalui
 * HTTP-only cookie.
 *
 * Database hanya menyimpan hash token.
 */
function hashToken(
  token: string,
) {
  return createHash('sha256')
    .update(token)
    .digest('hex');
}

/**
 * Membuat session baru.
 *
 * Browser:
 *   goldennet_session = random token
 *
 * Database:
 *   tokenHash = SHA-256(token)
 */
export async function createSession(
  userId: number,
) {
  const token =
    randomBytes(32).toString('hex');

  const tokenHash =
    hashToken(token);

  const expiresAt =
    new Date(
      Date.now() +
        SESSION_MAX_AGE * 1000,
    );

  await prisma.session.create({
    data: {
      tokenHash,
      userId,
      expiresAt,
    },
  });

  const cookieStore =
    await cookies();

  cookieStore.set(
    SESSION_COOKIE_NAME,
    token,
    {
      httpOnly: true,

      secure:
        process.env.NODE_ENV ===
        'production',

      sameSite: 'lax',

      maxAge: SESSION_MAX_AGE,

      path: '/',
    },
  );
}

/**
 * Menghapus session aktif.
 */
export async function destroySession() {
  const cookieStore =
    await cookies();

  const session =
    cookieStore.get(
      SESSION_COOKIE_NAME,
    );

  if (session?.value) {
    const tokenHash =
      hashToken(session.value);

    await prisma.session.deleteMany({
      where: {
        tokenHash,
      },
    });
  }

  cookieStore.delete(
    SESSION_COOKIE_NAME,
  );
}

/**
 * Mengambil user ID dari session
 * yang valid.
 *
 * Token dari cookie tidak pernah
 * dipercaya langsung sebagai user ID.
 */
export async function getSessionUserId() {
  const cookieStore =
    await cookies();

  const session =
    cookieStore.get(
      SESSION_COOKIE_NAME,
    );

  if (!session?.value) {
    return null;
  }

  const token =
    session.value.trim();

  if (!token) {
    return null;
  }

  const tokenHash =
    hashToken(token);

  const dbSession =
    await prisma.session.findUnique({
      where: {
        tokenHash,
      },
      select: {
        userId: true,
        expiresAt: true,
      },
    });

  if (!dbSession) {
    return null;
  }

  /**
   * Session sudah expired.
   */
  if (
    dbSession.expiresAt.getTime() <=
    Date.now()
  ) {
    await prisma.session.deleteMany({
      where: {
        tokenHash,
      },
    });

    return null;
  }

  return dbSession.userId;
}

/**
 * Mengambil user yang sedang login.
 */
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

  /**
   * User tidak ditemukan atau
   * account tidak aktif.
   */
  if (
    !user ||
    user.status !== 'ACTIVE'
  ) {
    return null;
  }

  return user;
}

/**
 * Memastikan user sudah login.
 */
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

/**
 * Memastikan user memiliki
 * salah satu role yang diizinkan.
 */
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

/**
 * Mengecek role tanpa melempar error.
 */
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