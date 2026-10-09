// ============================================================================
// BlackSentinel Forge - JWT signing secret
// ============================================================================

import { randomBytes } from 'crypto';

let cached: string | undefined;

/**
 * The one secret the gateway signs and verifies tokens with.
 *
 * SECURITY FIX: login, register and the auth middleware fell back to
 * 'dev-secret' (and docker compose to 'forge_dev_jwt_secret'), both public, so
 * anyone could forge a token. Without a real JWT_SECRET (32+ characters) the
 * gateway now uses a random secret per process; tokens end on restart. Run
 * scripts/init-env.sh to keep one in infrastructure/docker/.env.
 */
export function jwtSecret(warn: (msg: string) => void = console.warn): string {
  if (cached) return cached;
  const value = process.env.JWT_SECRET?.trim();
  if (value && value.length >= 32 && !/change|your[-_]|example|placeholder|fallback|dev[-_]|^forge_dev/i.test(value)) {
    cached = value;
  } else {
    warn(`JWT_SECRET is ${value ? 'too short or a placeholder' : 'not set'}; using a random secret for this run.`);
    cached = randomBytes(32).toString('hex');
  }
  return cached;
}
