const request = require('supertest');
const app = require('../app');
const { connect, closeDatabase, clearDatabase } = require('./setup');
const { createUser, createVendeurWithBoutique, createTenue } = require('./helpers');

let clientToken;
let tenue;

beforeAll(async () => await connect());
afterEach(async () => await clearDatabase());
afterAll(async () => await closeDatabase());

const setupData = async () => {
  const { token } = await createUser('client');
  const { boutique } = await createVendeurWithBoutique();
  const t = await createTenue(boutique._id);
  return { clientToken: token, tenue: t };
};

describe('POST /api/client/reservations', () => {
  it('should create a reservation', async () => {
    const { clientToken, tenue } = await setupData();

    const dateDebut = new Date();
    dateDebut.setDate(dateDebut.getDate() + 7);
    const dateFin = new Date();
    dateFin.setDate(dateFin.getDate() + 10);

    const res = await request(app)
      .post('/api/client/reservations')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        tenueId: tenue._id,
        dateDebut: dateDebut.toISOString(),
        dateFin: dateFin.toISOString(),
        taille: 'M',
        couleur: 'Rouge',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.reservation).toBeDefined();
    expect(res.body.reservation.statut).toBe('en_attente');
  });

  it('should reject overlapping dates for same tenue+taille+couleur', async () => {
    const { clientToken, tenue } = await setupData();

    const dateDebut = new Date();
    dateDebut.setDate(dateDebut.getDate() + 7);
    const dateFin = new Date();
    dateFin.setDate(dateFin.getDate() + 10);

    // First reservation
    await request(app)
      .post('/api/client/reservations')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        tenueId: tenue._id,
        dateDebut: dateDebut.toISOString(),
        dateFin: dateFin.toISOString(),
        taille: 'M',
        couleur: 'Rouge',
      });

    // Overlapping reservation
    const res = await request(app)
      .post('/api/client/reservations')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        tenueId: tenue._id,
        dateDebut: dateDebut.toISOString(),
        dateFin: dateFin.toISOString(),
        taille: 'M',
        couleur: 'Rouge',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject without auth token', async () => {
    const res = await request(app)
      .post('/api/client/reservations')
      .send({
        tenueId: '507f1f77bcf86cd799439011',
        dateDebut: new Date().toISOString(),
        dateFin: new Date().toISOString(),
        taille: 'M',
        couleur: 'Rouge',
      });

    expect(res.status).toBe(401);
  });

  it('should reject vendeur role', async () => {
    const { token: vendeurToken } = await createUser('vendeur', { statut: 'actif' });

    const res = await request(app)
      .post('/api/client/reservations')
      .set('Authorization', `Bearer ${vendeurToken}`)
      .send({
        tenueId: '507f1f77bcf86cd799439011',
        dateDebut: new Date().toISOString(),
        dateFin: new Date().toISOString(),
        taille: 'M',
        couleur: 'Rouge',
      });

    expect(res.status).toBe(403);
  });
});

describe('GET /api/client/reservations', () => {
  it('should return client reservations', async () => {
    const { clientToken } = await setupData();

    const res = await request(app)
      .get('/api/client/reservations')
      .set('Authorization', `Bearer ${clientToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.reservations)).toBe(true);
  });

  it('should return reservation by id', async () => {
    const { clientToken, tenue } = await setupData();

    const dateDebut = new Date();
    dateDebut.setDate(dateDebut.getDate() + 7);
    const dateFin = new Date();
    dateFin.setDate(dateFin.getDate() + 10);

    const createRes = await request(app)
      .post('/api/client/reservations')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        tenueId: tenue._id,
        dateDebut: dateDebut.toISOString(),
        dateFin: dateFin.toISOString(),
        taille: 'M',
        couleur: 'Rouge',
      });

    const res = await request(app)
      .get(`/api/client/reservations/${createRes.body.reservation._id}`)
      .set('Authorization', `Bearer ${clientToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.reservation._id).toBe(createRes.body.reservation._id);
  });
});
