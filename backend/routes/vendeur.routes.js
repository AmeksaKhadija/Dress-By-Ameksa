const router = require('express').Router();
const protect = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const { uploadSingle } = require('../middleware/uploadMiddleware');
const {
  getMyBoutique,
  createBoutique,
  updateBoutique,
} = require('../controllers/vendeur/boutiqueController');

router.use(protect);
router.use(authorize('vendeur'));

// Boutique
router.get('/boutique', getMyBoutique);
router.post('/boutique', uploadSingle, createBoutique);
router.put('/boutique', uploadSingle, updateBoutique);

module.exports = router;
