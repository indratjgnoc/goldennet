type RateLimitEntry = {
  count: number;
  firstAttemptAt: number;
  blockedUntil: number;
};

const attempts = new Map<string, RateLimitEntry>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 menit
const BLOCK_MS = 15 * 60 * 1000;  // 15 menit

function cleanupExpiredEntries() {
  const now = Date.now();

  for (const [key, entry] of attempts.entries()) {
    const windowExpired =
      now - entry.firstAttemptAt >= WINDOW_MS;

    const blockExpired =
      entry.blockedUntil > 0 &&
      now >= entry.blockedUntil;

    if (windowExpired || blockExpired) {
      attempts.delete(key);
    }
  }
}

export function getClientIp(request: Request) {
  const forwardedFor =
    request.headers.get('x-forwarded-for');

  if (forwardedFor) {
    return forwardedFor
      .split(',')[0]
      .trim();
  }

  const realIp =
    request.headers.get('x-real-ip');

  if (realIp) {
    return realIp.trim();
  }

  return 'unknown';
}

export function checkLoginRateLimit(
  key: string,
) {
  cleanupExpiredEntries();

  const now = Date.now();

  const entry = attempts.get(key);

  if (!entry) {
    return {
      allowed: true,
      remaining: MAX_ATTEMPTS,
      retryAfterSeconds: 0,
    };
  }

  if (
    entry.blockedUntil > 0 &&
    now < entry.blockedUntil
  ) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil(
        (entry.blockedUntil - now) / 1000,
      ),
    };
  }

  if (
    now - entry.firstAttemptAt >= WINDOW_MS
  ) {
    attempts.delete(key);

    return {
      allowed: true,
      remaining: MAX_ATTEMPTS,
      retryAfterSeconds: 0,
    };
  }

  return {
    allowed: true,
    remaining: Math.max(
      0,
      MAX_ATTEMPTS - entry.count,
    ),
    retryAfterSeconds: 0,
  };
}

export function recordLoginFailure(
  key: string,
) {
  cleanupExpiredEntries();

  const now = Date.now();

  const existing = attempts.get(key);

  if (!existing) {
    attempts.set(key, {
      count: 1,
      firstAttemptAt: now,
      blockedUntil: 0,
    });

    return;
  }

  if (
    now - existing.firstAttemptAt >=
    WINDOW_MS
  ) {
    attempts.set(key, {
      count: 1,
      firstAttemptAt: now,
      blockedUntil: 0,
    });

    return;
  }

  existing.count += 1;

  if (existing.count >= MAX_ATTEMPTS) {
    existing.blockedUntil =
      now + BLOCK_MS;
  }

  attempts.set(key, existing);
}

export function resetLoginRateLimit(
  key: string,
) {
  attempts.delete(key);
}