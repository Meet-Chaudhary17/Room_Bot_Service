import { afterAll, describe, expect, it } from 'vitest';
import request from 'supertest';

process.env.NODE_ENV = 'test';
process.env.PORT = '5000';
process.env.DATABASE_URL = 'postgresql://roombot:roombot@localhost:5432/roombot?schema=public';
process.env.JWT_SECRET = 'test-only-secret-that-is-at-least-thirty-two-characters';
process.env.JWT_EXPIRES_IN = '24h';
process.env.OTP_EXPIRY_MINUTES = '10';
process.env.CLIENT_URL = 'http://localhost:5173';

const { app } = await import('../src/app.js');
const { prisma } = await import('../src/config/prisma.js');

afterAll(async () => prisma.$disconnect());

describe('GET /api/v1/health', () => {
  it('returns a consistent liveness response without database access', async () => {
    const response = await request(app).get('/api/v1/health').expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.service).toBe('room-bot-service-api');
    expect(response.body.data.status).toBe('ok');
    expect(response.headers['x-request-id']).toBeTruthy();
  });
});

describe('unknown routes', () => {
  it('returns the centralized not-found contract', async () => {
    const response = await request(app).get('/api/v1/missing').expect(404);

    expect(response.body).toMatchObject({
      success: false,
      error: { code: 'NOT_FOUND' },
    });
    expect(response.body.requestId).toBeTruthy();
  });
});
