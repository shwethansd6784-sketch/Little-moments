/**
 * Little Moments - Cryptographic and Rate Limiting Utilities
 * Ensures recipient passwords and PINs are securely hashed and never exposed in plaintext.
 */

// Generate a random salt
export function generateSalt(length = 16) {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Compute SHA-256 hash with salt
export async function hashPassword(password, salt) {
  const enc = new TextEncoder();
  const data = enc.encode(`${salt}:${password}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Verify entered password against hash and salt
export async function verifyPassword(enteredPassword, storedHash, salt) {
  const computedHash = await hashPassword(enteredPassword, salt);
  return computedHash === storedHash;
}

// Generate non-guessable gift slug
export function generateSlug(prefix = 'moment') {
  const randomChars = Math.random().toString(36).substring(2, 8);
  const timestamp = Date.now().toString(36).substring(4);
  return `${prefix}-${randomChars}-${timestamp}`;
}

// Rate Limiting helper for recipient unlock attempts
const RATE_LIMIT_KEY_PREFIX = 'lm_attempts_';
const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 10;

export function checkRateLimit(giftSlug) {
  const key = `${RATE_LIMIT_KEY_PREFIX}${giftSlug}`;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return { allowed: true, remaining: MAX_ATTEMPTS, lockedUntil: null };

    const data = JSON.parse(raw);
    const now = Date.now();

    if (data.lockedUntil && now < data.lockedUntil) {
      const waitMinutes = Math.ceil((data.lockedUntil - now) / 60000);
      return { 
        allowed: false, 
        remaining: 0, 
        lockedUntil: data.lockedUntil,
        waitMinutes 
      };
    }

    // Reset if window expired
    if (data.firstAttempt && now - data.firstAttempt > LOCKOUT_MINUTES * 60 * 1000) {
      localStorage.removeItem(key);
      return { allowed: true, remaining: MAX_ATTEMPTS, lockedUntil: null };
    }

    const remaining = Math.max(0, MAX_ATTEMPTS - (data.count || 0));
    return { 
      allowed: remaining > 0, 
      remaining, 
      lockedUntil: null 
    };
  } catch {
    return { allowed: true, remaining: MAX_ATTEMPTS, lockedUntil: null };
  }
}

export function recordFailedAttempt(giftSlug) {
  const key = `${RATE_LIMIT_KEY_PREFIX}${giftSlug}`;
  const now = Date.now();
  try {
    const raw = localStorage.getItem(key);
    let data = raw ? JSON.parse(raw) : { count: 0, firstAttempt: now };
    
    data.count = (data.count || 0) + 1;
    if (!data.firstAttempt) data.firstAttempt = now;

    if (data.count >= MAX_ATTEMPTS) {
      data.lockedUntil = now + (LOCKOUT_MINUTES * 60 * 1000);
    }

    localStorage.setItem(key, JSON.stringify(data));
    return {
      remaining: Math.max(0, MAX_ATTEMPTS - data.count),
      lockedUntil: data.lockedUntil
    };
  } catch {
    return { remaining: 1, lockedUntil: null };
  }
}

export function resetRateLimit(giftSlug) {
  try {
    localStorage.removeItem(`${RATE_LIMIT_KEY_PREFIX}${giftSlug}`);
  } catch {
    // ignore
  }
}
