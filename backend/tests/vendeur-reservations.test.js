const request = require('supertest');
const app = require('../app');
const { connect, closeDatabase, clearDatabase } = require('./setup');
const { createUser, createVendeurWithBoutique, createTenue } = require('./helpers');
const Reservation = require('../models/Reservation');

beforeAll(async () => await connect());
afterEach(async () => await clearDatabase());
afterAll(async () => await closeDatabase());

const setupVendeurWithReservation = async () => {
  const { vendeur, token: vendeurToken, boutique } = await createVendeurWithBoutique();
  const tenue = await createTenue(boutique._id);
  const { user: client } = await createUser('client');

  const dateDebut = new Date();
  dateDebut.setDate(dateDebut.getDate() + 7);
  const dateFin = new Date();
  dateFin.setDate(dateFin.getDate() + 10);

  const reservation = await Reservation.create({
    client: client._id,
    tenue: tenue._id,
    dateDebut,
    dateFin,
    taille: 'M',
    couleur: 'Rouge',
    prixTotal: 1500,
    statut: 'en_attente',
  });

  return { vendeur, vendeurToken, boutique, tenue, client, reservation };
};

describe('GET /api/vendeur/reservations', () => {
  it('should return vendeur reservations', async () => {
    const { vendeurToken } = await setupVendeurWithReservation();

    const res = await request(app)
      .get('/api/vendeur/reservations')
      .set('Authorization', `Bearer ${vendeurToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.reservations)).toBe(true);
  });

  it('should reject without auth', async () => {
    const res = await request(app).get('/api/vendeur/reservations');
    expect(res.status).toBe(401);
  });
});

describe('PUT /api/vendeur/reservations/:id/statut', () => {
  it('should confirm a reservation', async () => {
    const { vendeurToken, reservation } = await setupVendeurWithReservation();

    const res = await request(app)
      .put(`/api/vendeur/reservations/${reservation._id}/statut`)
      .set('Authorization', `Bearer ${vendeurToken}`)
      .send({ statut: 'confirmee' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.reservation.statut).toBe('confirmee');
  });

  it('should reject if vendeur is en_attente', async () => {
    const { user: vendeurPending, token: pendingToken } = await createUser('vendeur');
    // vendeur en_attente by default

    const res = await request(app)
      .put('/api/vendeur/reservations/507f1f77bcf86cd799439011/statut')
      .set('Authorization', `Bearer ${pendingToken}`)
      .send({ statut: 'confirmee' });

    expect(res.status).toBe(403);
  });
});
