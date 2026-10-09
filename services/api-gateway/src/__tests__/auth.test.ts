import express from 'express';
import type { AddressInfo } from 'net';
import jwt from 'jsonwebtoken';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const ADMIN_PASSWORD = 'forge-test-operator-password';
const JWT_SECRET = 'f'.repeat(16) + '3c9a71e2b84d5f60a1c7e9b3d2f4a6c8';

let base = '';
let close: () => void;

beforeAll(async () => {
  process.env.ADMIN_PASSWORD = ADMIN_PASSWORD;
  process.env.JWT_SECRET = JWT_SECRET;
  const { createAuthRoutes } = await import('../routes/auth');
  const app = express();
  app.use(express.json());
  app.use('/auth', createAuthRoutes());
  const server = app.listen(0);
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  close = () => server.close();
});

afterAll(() => close());

const post = (path: string, body: unknown) =>
  fetch(base + path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });

describe('gateway auth', () => {
  it('rejects any email and password that are not the configured operator', async () => {
    const res = await post('/auth/login', { email: 'someone@example.com', password: 'anything-at-all' });
    expect(res.status).toBe(401);
  });

  it('rejects the right email with a wrong password', async () => {
    const res = await post('/auth/login', { email: 'admin@blacksentinel.local', password: 'not-the-password' });
    expect(res.status).toBe(401);
  });

  it('signs in the configured operator with a token signed by JWT_SECRET', async () => {
    const res = await post('/auth/login', { email: 'admin@blacksentinel.local', password: ADMIN_PASSWORD });
    expect(res.status).toBe(200);
    const { data } = (await res.json()) as { data: { token: string } };
    expect(() => jwt.verify(data.token, JWT_SECRET)).not.toThrow();
  });

  it('refuses self-registration', async () => {
    const res = await post('/auth/register', { email: 'x@example.com', password: 'longenough', name: 'X', tenantName: 'Acme' });
    expect(res.status).toBe(403);
  });
});
