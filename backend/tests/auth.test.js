const request = require('supertest');
const app = require('../app');
const { connect, closeDatabase, clearDatabase } = require('./setup');
const { createUser } = require('./helpers');

beforeAll(async () => await connect());
afterEach(async () => await clearDatabase());
afterAll(async () => await closeDatabase());

describe('POST /api/auth/register', () => {
  it('should register a client', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        nom: 'Sara Test',
        email: 'sara@test.com',
        motDePasse: 'password123',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('client');
    expect(res.body.user.statut).toBe('actif');
  });

  it('should register a vendeur with statut en_attente', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        nom: 'Fatima Vendeur',
        email: 'fatima@test.com',
        motDePasse: 'password123',
        role: 'vendeur',
      });

    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('vendeur');
    expect(res.body.user.statut).toBe('en_attente');
  });

  it('should reject duplicate email', async () => {
    await createUser('client', { email: 'duplicate@test.com' });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        nom: 'Autre User',
        email: 'duplicate@test.com',
        motDePasse: 'password123',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject invalid role', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        nom: 'Hacker',
        email: 'hacker@test.com',
        motDePasse: 'password123',
        role: 'admin',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await createUser('client', {
      nom: 'Login User',
      email: 'login@test.com',
    });
  });

  it('should login with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@test.com', motDePasse: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('login@test.com');
  });

  it('should reject wrong email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'wrong@test.com', motDePasse: 'password123' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should reject wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@test.com', motDePasse: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should reject missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@test.com' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('GET /api/auth/me', () => {
  it('should return current user with valid token', async () => {
    const { token } = await createUser('client', {
      nom: 'Me User',
      email: 'me@test.com',
    });

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe('me@test.com');
  });

  it('should reject request without token', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
  });
});
