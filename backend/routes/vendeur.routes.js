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
const {
  getMyReservations,
  getMyReservationById,
  updateReservationStatut,
  markAsReturned,
  handleLitige,
} = require('../controllers/vendeur/reservationController');
const {
  getProfile,
  updateProfile,
  changePassword,
} = require('../controllers/client/clientController');

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

// Reservations
router.get('/reservations', getMyReservations);
router.get('/reservations/:id', getMyReservationById);
router.put('/reservations/:id/statut', updateReservationStatut);
router.put('/reservations/:id/retour', markAsReturned);
router.put('/reservations/:id/litige', handleLitige);

// Profile
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/profile/password', changePassword);

module.exports = router;
