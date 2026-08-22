import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 10

/** Hash a plaintext password for storage. */
export async function hashPassword(plain: string): Promise<string> {
  if (!plain || plain.length < 6) {
    throw new Error('Password must be at least 6 characters')
  }
  return bcrypt.hash(plain, SALT_ROUNDS)
}

/** Verify a plaintext password against a stored hash. */
export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  if (!plain || !hash) return false
  try {
    return await bcrypt.compare(plain, hash)
  } catch {
    return false
  }
}

/**
 * Check if a stored hash looks like a bcrypt hash.
 * Used to detect legacy plaintext passwords that need migration.
 */
export function isBcryptHash(hash: string): boolean {
  return typeof hash === 'string' && hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$')
}
