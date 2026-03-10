const router = require('express').Router();
const {
  getPopularTenues,
  getTenues,
  getTenueById,
  getSimilarTenues,
  getBoutiques,
  getBoutiqueById,
} = require('../controllers/public/publicController');

// Tenues
router.get('/tenues/popular', getPopularTenues);
router.get('/tenues', getTenues);
router.get('/tenues/:id', getTenueById);
router.get('/tenues/:id/similar', getSimilarTenues);

// Boutiques
router.get('/boutiques', getBoutiques);
router.get('/boutiques/:id', getBoutiqueById);

module.exports = router;
