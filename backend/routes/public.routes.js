const router = require('express').Router();
const { getPopularTenues, getTenues } = require('../controllers/public/publicController');

router.get('/tenues/popular', getPopularTenues);
router.get('/tenues', getTenues);

module.exports = router;
