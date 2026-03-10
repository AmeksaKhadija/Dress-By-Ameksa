const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const { connect, closeDatabase, clearDatabase } = require('./setup');
const { createVendeurWithBoutique, createTenue } = require('./helpers');
const Boutique = require('../models/Boutique');

beforeAll(async () => await connect());
afterEach(async () => await clearDatabase());
afterAll(async () => await closeDatabase());

describe('GET /api/public/tenues', () => {
  it('should return list of tenues', async () => {
    const { boutique } = await createVendeurWithBoutique();
    await createTenue(boutique._id);
    await createTenue(boutique._id);

    const res = await request(app).get('/api/public/tenues');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.results.length).toBe(2);
  });

  it('should return tenue by id', async () => {
    const { boutique } = await createVendeurWithBoutique();
    const tenue = await createTenue(boutique._id);

    const res = await request(app).get(`/api/public/tenues/${tenue._id}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.tenue.nom).toBe(tenue.nom);
  });

  it('should return 404 for non-existent tenue', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/public/tenues/${fakeId}`);

    expect(res.status).toBe(404);
  });
});

describe('GET /api/public/boutiques', () => {
  it('should return only validated boutiques', async () => {
    const { boutique } = await createVendeurWithBoutique(); // statut = validee
    // Create a non-validated boutique
    const { user: vendeur2 } = require('./helpers');
    await Boutique.create({
      nom: 'Boutique Non Validee',
      description: 'Test',
      vendeur: boutique.vendeur,
      statut: 'en_attente',
    });

    const res = await request(app).get('/api/public/boutiques');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // Only the validated boutique should be returned
    const validees = res.body.boutiques.filter((b) => b.statut === 'validee');
    expect(validees.length).toBe(res.body.boutiques.length);
  });

  it('should return boutique by id', async () => {
    const { boutique } = await createVendeurWithBoutique();

    const res = await request(app).get(`/api/public/boutiques/${boutique._id}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.boutique.nom).toBe('Boutique Test');
  });
});
