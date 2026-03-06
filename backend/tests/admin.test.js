const request = require('supertest');
const app = require('../app');
const { connect, closeDatabase, clearDatabase } = require('./setup');
const { createUser, createVendeurWithBoutique } = require('./helpers');
const Boutique = require('../models/Boutique');

beforeAll(async () => await connect());
afterEach(async () => await clearDatabase());
afterAll(async () => await closeDatabase());

const createAdmin = async () => {
  return createUser('admin', { nom: 'Admin Test', email: 'admin@test.com' });
};

describe('GET /api/admin/users', () => {
  it('should return all users', async () => {
    const { token: adminToken } = await createAdmin();
    await createUser('client');
    await createUser('vendeur');

    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.users.length).toBeGreaterThanOrEqual(3); // admin + client + vendeur
  });

  it('should reject non-admin', async () => {
    const { token: clientToken } = await createUser('client');

    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${clientToken}`);

    expect(res.status).toBe(403);
  });
});

describe('PUT /api/admin/users/:id/approve', () => {
  it('should approve a vendeur', async () => {
    const { token: adminToken } = await createAdmin();
    const { user: vendeur } = await createUser('vendeur'); // statut = en_attente

    const res = await request(app)
      .put(`/api/admin/users/${vendeur._id}/approve`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.statut).toBe('actif');
  });
});

describe('PUT /api/admin/boutiques/:id/statut', () => {
  it('should change boutique statut', async () => {
    const { token: adminToken } = await createAdmin();
    const { boutique } = await createVendeurWithBoutique();

    // Change to suspendue
    const res = await request(app)
      .put(`/api/admin/boutiques/${boutique._id}/statut`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ statut: 'suspendue' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.boutique.statut).toBe('suspendue');
  });
});
