const router = require('express').Router();
const protect = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const { uploadSingle, uploadMultiple } = require('../middleware/uploadMiddleware');
const {
  getMyBoutique,
  createBoutique,
  updateBoutique,
} = require('../controllers/vendeur/boutiqueController');
const {
  getMyTenues,
  getMyTenueById,
  createTenue,
  updateTenue,
  deleteTenue,
  toggleDisponibilite,
} = require('../controllers/vendeur/tenueController');

router.use(protect);
router.use(authorize('vendeur'));

// Boutique
router.get('/boutique', getMyBoutique);
router.post('/boutique', uploadSingle, createBoutique);
router.put('/boutique', uploadSingle, updateBoutique);

// Tenues
router.get('/tenues', getMyTenues);
router.get('/tenues/:id', getMyTenueById);
router.post('/tenues', uploadMultiple, createTenue);
router.put('/tenues/:id', uploadMultiple, updateTenue);
router.delete('/tenues/:id', deleteTenue);
router.patch('/tenues/:id/disponibilite', toggleDisponibilite);

module.exports = router;
