const router = require('express').Router();
const protect = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const {
  getAllBoutiques,
  updateBoutiqueStatut,
} = require('../controllers/admin/boutiqueController');

router.use(protect);
router.use(authorize('admin'));

// Boutiques management
router.get('/boutiques', getAllBoutiques);
router.put('/boutiques/:id/statut', updateBoutiqueStatut);

module.exports = router;
