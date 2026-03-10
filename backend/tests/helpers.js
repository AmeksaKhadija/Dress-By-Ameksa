const User = require('../models/User');
const Boutique = require('../models/Boutique');
const Tenue = require('../models/Tenue');
const generateToken = require('../utils/generateToken');

let counter = 0;

const createUser = async (role = 'client', overrides = {}) => {
  counter++;
  const user = await User.create({
    nom: `Test User ${counter}`,
    email: `test${counter}@example.com`,
    motDePasse: 'password123',
    role,
    statut: role === 'vendeur' ? 'en_attente' : 'actif',
    ...overrides,
  });
  const token = generateToken(user._id);
  return { user, token };
};

const createVendeurWithBoutique = async () => {
  const { user: vendeur, token } = await createUser('vendeur', { statut: 'actif' });

  const boutique = await Boutique.create({
    nom: 'Boutique Test',
    description: 'Une boutique de test',
    vendeur: vendeur._id,
    statut: 'validee',
  });

  return { vendeur, token, boutique };
};

const createTenue = async (boutiqueId) => {
  counter++;
  const tenue = await Tenue.create({
    nom: `Tenue Test ${counter}`,
    type: 'caftan',
    description: 'Un caftan de test',
    prix: 500,
    tailles: ['S', 'M', 'L'],
    couleurs: ['Rouge', 'Bleu'],
    images: [{ url: 'https://example.com/image.jpg', public_id: 'test_img' }],
    boutique: boutiqueId,
    disponible: true,
  });
  return tenue;
};

module.exports = { createUser, createVendeurWithBoutique, createTenue };
