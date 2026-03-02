const router = require('express').Router();
const { getPopularTenues } = require('../controllers/public/publicController');

router.get('/tenues/popular', getPopularTenues);

module.exports = router;
