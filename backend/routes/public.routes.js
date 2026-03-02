const router = require('express').Router();
const {
  getPopularTenues,
  getTenues,
  getTenueById,
  getSimilarTenues,
} = require('../controllers/public/publicController');

router.get('/tenues/popular', getPopularTenues);
router.get('/tenues', getTenues);
router.get('/tenues/:id', getTenueById);
router.get('/tenues/:id/similar', getSimilarTenues);

module.exports = router;
